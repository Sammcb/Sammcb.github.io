+++
title = "Talos, Tofu, and TODOs"
description = "Automating the setup of a Talos cluster."
date = 2026-06-17
updated = 2026-06-17

[taxonomies]
projects = ["homelab"]

[extra]
stylesheets = ["/readable.css", "/blog.css"]
+++
## It's alive!

Now that I had a VM up and running with a Talos image, it was time to configure the OS and install it persistently. For now, I only plan to have one control plane node and no worker nodes. Multiple control plane node replicas is good is because it enables [high availability](https://en.wikipedia.org/wiki/High_availability). High availability allows for zero-downtime if one of the nodes goes down (for example, during an upgrade). However, this is not something I am very concerned about while getting started. Once I have things fully set up and actually start running some services, maybe I will look at setting up more nodes.

_Quick note: the next sections are mostly just me following the [Talos documentation](https://docs.siderolabs.com/talos). I highly recommend reading through these yourself if you're setting up Talos, as they are more detailed and will remain up-to-date._

When initially booting Talos, it only runs in RAM and does not persist any changes to disk. To make changes permanent, a configuration needs to be applied. First things first: the only way to interact with Talos was using the `talosctl` [command line interface (CLI)](https://en.wikipedia.org/wiki/Command-line_interface), which I installed through Nix. Next, I booted up the headless VM I created in the last post and ran `screen` to monitor the output of the [TTY serial device](https://en.wikipedia.org/wiki/Pseudoterminal) assigned by UTM (shown in the VM details when a VM is running). This allowed me to see the output logs from Talos. I noted the IP address in the logs and stored it in a variable called `CONTROL_PLANE_IP`.

Now that I had a VM with Talos running, I unmounted the ISO by going into the UTM VM details and selecting the `CD/DVD` dropdown and then clicking `Clear`. Next, I ran the following command to make sure `talosctl` was working and that SecureBoot was enabled:

```sh
talosctl -n $CONTROL_PLANE_IP get securitystate --insecure
```

And got the following output:

```txt
NODE    NAMESPACE    TYPE             ID               VERSION    SECUREBOOT    UKISIGNINGKEYFINGERPRINT    PCRSIGNINGKEYFINGERPRINT    SELINUXSTATE           MODULESIGNATUREENFORCED
				runtime      SecurityState    securitystate    1          true                                      <fingerprint>               enabled, permissive    true
```

Next, I ran a command to view the disks available on the control plane node:

```sh
talosctl -n $CONTROL_PLANE_IP get disks --insecure
```

And noted the ID of the disk I would install Talos on (in my case, `vda`) and stored it in a variable called `DISK_ID`. Now, I faced one of the hardest challenges in all of computer science! ⚠️Warning, programmer humor joke incoming!⚠️

> There are only two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.

(I'm unsure who originally came up with this variant of the joke, but I heard it a long time ago and love it 😄.) It was time to... pick a name for my cluster! I wanted to go with a fun name to try and make devlog posts about this project _slightly_ more fun. I settled on `virgo`, named after the [Virgo Supercluster](https://en.wikipedia.org/wiki/Virgo_Supercluster) because space is cool and I love a good pun! I stored this in a variable called `CLUSTER_NAME`. Following the production clusters guide, I generated a secrets bundle:

```sh
talosctl gen secrets -o secrets.yml
```

I was almost ready to generate the machine configuration files, but there were a few additional steps I needed to take first. Because I used an image with SecureBoot enabled, I needed to record the install image path provided by the Talos Image Factory when I created the image in the previous post. The path looked something like `factory.talos.dev/metal-installer-secureboot/<image_schematic_id>:<talos_version>`. I stored this in a variable called `TALOS_INSTALL_IMAGE`. I also needed to prep a machine configuration patch to enable [TMP](https://en.wikipedia.org/wiki/Trusted_Platform_Module)-based disk encryption, as well as configure the cluster networking as I planned to install [Cilium](https://cilium.io) as my [container network interface (CNI)](https://www.cni.dev) (as a quick note: the CNI is responsible for handling cluster networking):

```yaml
# machine-init.yml

# Enable TMP-based disk encryption.
machine:
	systemDiskEncryption:
		ephemeral:
			provider: luks2
			keys:
			- slot: 0
				tpm:
				checkSecurebootStatusOnEnroll: true
		state:
			provider: luks2
			keys:
			- slot: 0
				tpm:
				checkSecurebootStatusOnEnroll: true
# Disable default CNI and kube-proxy to prepare for Cilium.
cluster:
	network:
		cni:
			name: none
	proxy:
		disabled: true
```

Finally, I was ready to generate the machine configuration files. Combining all the prep above, I ran the following command:

```sh
talosctl gen config --with-secrets secrets.yml $CLUSTER_NAME https://$CONTROL_PLANE_IP:6443 --install-disk /dev/$DISK_ID --install-image $TALOS_INSTALL_IMAGE --config-patch @machine-init.yml
```

This produced three files: `controlplane.yaml`, `worker.yaml`, and `talosconfig`. For now, I wouldn't need the `worker.yaml` configuration as I wasn't setting up any worker nodes. Now came the fun part! It was time to apply the control plane node configuration and bootstrap the [`etcd`](https://etcd.io) cluster. I started by applying the configuration to my control plane node:

```sh
talosctl apply-config --insecure -n $CONTROL_PLANE_IP --file controlplane.yaml
```

Then I stored my control plane endpoint in the `talosconfig`:

```sh
talosctl --talosconfig talosconfig config endpoints $CONTROL_PLANE_IP
```

And bootstrapped the `etcd` cluster:

```sh
talosctl bootstrap -n $CONTROL_PLANE_IP --talosconfig talosconfig
```

For the next step, I needed to generate a `kubeconfig` file to run `kubectl` commands with:

```sh
talosctl kubeconfig kubeconfig -n $CONTROL_PLANE_IP --talosconfig talosconfig
```

Because I disabled the default CNI, the bootstrap got hung up with a "node not ready" error. This was expected, as no CNI was defined. The node would automatically be rebooted in 10 minutes, and during this 10 minute window is when I installed Cilium (configured to replace [`kube-proxy`](https://kubernetes.io/docs/reference/networking/virtual-ips/) and with [Gateway API](https://gateway-api.sigs.k8s.io) support enabled). I needed to install the Gateway API [CRDs](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) first (I stored the Gateway API release version in a variable called `GATEWAY_API_VERSION`):

```sh
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/$GATEWAY_API_VERSION/standard-install.yaml --kubeconfig kubeconfig
```

For this first setup, I installed Cilium using the `cilium` CLI:

```sh
cilium --kubeconfig kubeconfig install --version $CILIUM_VERSION \
--set ipam.mode=kubernetes \
--set kubeProxyReplacement=true \
--set securityContext.capabilities.ciliumAgent="{CHOWN,KILL,NET_ADMIN,NET_RAW,IPC_LOCK,SYS_ADMIN,SYS_RESOURCE,DAC_OVERRIDE,FOWNER,SETGID,SETUID}" \
--set securityContext.capabilities.cleanCiliumState="{NET_ADMIN,SYS_ADMIN,SYS_RESOURCE}" \
--set cgroup.autoMount.enabled=false \
--set cgroup.hostRoot=/sys/fs/cgroup \
--set k8sServiceHost=localhost \
--set k8sServicePort=7445 \
--set gatewayAPI.enabled=true \
--set gatewayAPI.enableAlpn=true \
--set gatewayAPI.enableAppProtocol=true
```

After installing Cilium, I confirmed the Talos node reached a healthy state:

```sh
talosctl -n $CONTROL_PLANE_IP --talosconfig talosconfig health
```

I use [`k9s`](https://k9scli.io) to help me manage Kubernetes clusters. It's a wonderful [TUI](https://en.wikipedia.org/wiki/Text-based_user_interface) wrapper around `kubectl` and just makes working with Kubernetes clusters so much nicer! I checked the state of the cluster and confirmed all the pods reached a healthy state:

```sh
k9s --kubeconfig kubeconfig
```

Finally, I shut down the VM:

```sh
talosctl -n $CONTROL_PLANE_IP --talosconfig talosconfig shutdown
```

Then I deleted the `USB Drive` from the VM settings, set the `USB Support` under the `Input` settings to `Disabled` (as I would no longer need any USB devices), deleted the `Serial` device, and restarted it to confirm all my changes were persisted and the node/cluster reached a healthy state!

{{ resize_image(file="cluster.png", size=700, alt="Healthy cluster") }}

## Can we automate it? Yes we (mostly) can!

Phew, that was a lot of steps to run 😮‍💨! Wouldn't it be great to automate that process? Well, there's some good news and some bad news. First, the bad news: automating the creation of the VM in UTM is difficult. UTM _does_ offer ways to script actions using [AppleScript](https://en.wikipedia.org/wiki/AppleScript), and even includes a CLI! Sadly though, at the time of writing the CLI is pretty limited and can't even be used to create VMs. While I could write an AppleScript script, I felt that automating the interactions in UTM was actually less useful because I would need to copy the script over to the Mac mini node and make sure I kept it up-to-date.

Ok, so can the Talos setup steps be automated? Good news, everyone! Yes! The simplest way would be to collect all the commands I ran together in a [shell script](https://en.wikipedia.org/wiki/Shell_script). Next time I need to setup a node, I could use the script instead of running the commands one-by-one. However, this method can be brittle because the required steps might change over time as Talos updates. Plus it might be difficult for future me to remember what the goal of the script was if I take a long break from the project. This is where [infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) comes in handy. To better explain the benefits, it's time for a quick aside on imperative vs. declarative programming:

First, consider the goal of the automation. Ideally, given a pre-created VM, one command can be run that will result in a functioning Kubernetes cluster. A script that runs the `talosctl` commands one-by-one is an example of ["imperative programming"](https://en.wikipedia.org/wiki/Imperative_programming) because the script doesn't communicate _what_ the end result is, instead it shows _how_ to get to the end result. This can be really powerful, because the steps can be changed at any time and additional steps can be added later if needed (such as testing or validation). The downside is that maintaining the steps over time could be a hassle, and it might not be very obvious why each step is required or what the end result is supposed to look like unless everything is carefully documented.

Infrastructure as code helps solve these issues by following the ["declarative programming"](https://en.wikipedia.org/wiki/Declarative_programming) paradigm. In declarative programming, the code represents what the final result should be but does not explicitly specify the steps needed to reach that final result. This can make the code simpler and significantly more readable as it's immediately obvious what is being created. It is also easier to audit what resources are being created and how they will be configured. The main tradeoff with this approach is that it's "magic" until it isn't. If an issue is encountered when creating the result, it can be much more difficult to figure out why/where something went wrong.

## Tasty Tofu

For this project, I'll be going with infrastructure as code. The tool I'll be using to write the code is called [OpenTofu](https://opentofu.org), which is easily one of my favorite names for a tool ever! There is a huge amount to learn about OpenTofu that I won't be covering here, but I encourage reading over the docs if you're interested in learning more about it! Luckily, there is an official [`talos` provider](https://search.opentofu.org/provider/siderolabs/talos/latest) for OpenTofu. To start off with, I created a simple module that would output the URL of the bare-metal, arm, SecureBoot Talos image I was using their website to find. This is an example of a process that would have been annoying to document because the website might change at any time (by updating the layout or style, or offering different options, etc.). Having this in code makes it much easier for me to remember and replicate the process in the future:

```terraform
# vm/main.tofu

# Get all stable Talos versions.
data "talos_image_factory_versions" "this" {
	filters = {
		stable_versions_only = true
	}
}

# Output the latest stable Talos version.
# The intent is only to notify if a new version is available.
output "latest_talos_version" {
	value = element(data.talos_image_factory_versions.this.talos_versions, -1)
}

# Get a Talos Image Factory image with no customizations.
resource "talos_image_factory_schematic" "vanilla" {}

# Get the URL of a bare-metal, arm architecture, vanilla Talos image based on an input version.
data "talos_image_factory_urls" "metal_arm" {
	talos_version = var.talos_version
	schematic_id = talos_image_factory_schematic.vanilla.id
	architecture = "arm64"
	platform = "metal"
}

# Output the SecureBoot enabled ISO of the
# bare-metal, arm architecture, vanilla Talos image.
output "iso_url" {
	value = data.talos_image_factory_urls.metal_arm.urls.iso_secureboot
}
```

In this case, I'm not creating any infrastructure but am using the output to help simplify the process of downloading the ISO I need when setting up the VM. The output looks something like this when I apply the changes:

```sh
tofu apply

# Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
#
# Outputs:
#
# iso_url = "https://factory.talos.dev/image/<schematic_id>/<talos_version>/metal-arm64-secureboot.iso"
# latest_talos_version = "<talos_version>"
```

And all I have to do is copy the URL into my browser to download the ISO! Having an output for the latest available stable Talos version is also useful because it will help notify me when I need to upgrade to a new version. _Please note, I did leave out a lot of other code needed to get this to work, as well as details about OpenTofu. At this point, I have not released any code related to this project but I plan to open-source everything once I get this in a usable state! Stay tuned for a future blog post where I finally share everything!_

So without further ado, here is the code needed to set up my Talos cluster with Cilium as the CNI using the Cilium [Helm Chart](https://helm.sh):

```terraform
# nodes/main.tofu

# Get all stable Talos versions.
data "talos_image_factory_versions" "this" {
	filters = {
		stable_versions_only = true
	}
}

# Output the latest stable Talos version.
# The intent is only to notify if a new version is available.
output "latest_talos_version" {
	value = element(data.talos_image_factory_versions.this.talos_versions, -1)
}

# Get a Talos Image Factory image with no customizations.
resource "talos_image_factory_schematic" "vanilla" {}

# Get the URL of a bare-metal, arm architecture, vanilla Talos image based on an input version.
data "talos_image_factory_urls" "metal_arm" {
	talos_version = var.talos_version
	schematic_id = talos_image_factory_schematic.vanilla.id
	architecture = "arm64"
	platform = "metal"
}

# Generate the secrets bundle.
resource "talos_machine_secrets" "this" {
	talos_version = var.talos_version
}

# Template Cilium Helm Chart resources.
data "helm_template" "cilium" {
	name = "cilium"
	namespace = "kube-system"
	repository = "oci://quay.io/cilium/charts"
	chart = "cilium"
	version = var.cilium_version
	atomic = true
	# The `kube-system` namespace is created automatically.
	create_namespace = false
	dependency_update = true
	include_crds = true
	kube_version = var.machine_kubernetes_version
	wait = true
	set = [
		{
			name = "ipam.mode"
			value = "kubernetes"
		},
		{
			name = "kubeProxyReplacement"
			value = "true"
		},
		{
			name = "securityContext.capabilities.ciliumAgent"
			value = "{CHOWN,KILL,NET_ADMIN,NET_RAW,IPC_LOCK,SYS_ADMIN,SYS_RESOURCE,DAC_OVERRIDE,FOWNER,SETGID,SETUID}"
		},
		{
			name = "securityContext.capabilities.cleanCiliumState"
			value = "{NET_ADMIN,SYS_ADMIN,SYS_RESOURCE}"
		},
		{
			name = "cgroup.autoMount.enabled"
			value = "false"
		},
		{
			name = "cgroup.hostRoot"
			value = "/sys/fs/cgroup"
		},
		{
			name = "k8sServiceHost"
			value = "localhost"
		},
		{
			name = "k8sServicePort"
			value = "7445"
		},
		{
			name = "gatewayAPI.enabled"
			value = "true"
		},
		{
			name = "gatewayAPI.enableAlpn"
			value = "true"
		},
		{
			name = "gatewayAPI.enableAppProtocol"
			value = "true"
		},
		{
			name = "operator.replicas"
			value = "1"
		}
	]
}

# Create a control plane node configuration with:
# - A specific Talos version.
# - A specific Kubernetes version.
# - A cluster name.
# - The secrets bundle created earlier.
# - A control plane node IP.
# - The SecureBoot installer image.
# - A specific install disk ID.
# - TPM-based disk encryption enabled.
# - Default CNI disabled as Cilium will be used.
# - Kube-proxy disabled as Cilium will be used.
# - The Gateway API CRDs installed.
# - Cilium installed from the Helm Chart templates rendered earlier.
ephemeral "talos_machine_configuration" "control_plane" {
	talos_version = var.talos_version
	kubernetes_version = var.machine_kubernetes_version
	cluster_name = var.cluster_name
	machine_type = "controlplane"
	machine_secrets = talos_machine_secrets.this.machine_secrets
	cluster_endpoint = "https://${var.control_plane_ip}:6443"
	config_patches = [
		yamlencode({
			machine = {
				install = {
					image = data.talos_image_factory_urls.metal_arm.urls.installer_secureboot
					disk = "/dev/${var.machine_install_disk}"
				}
				# Enable TMP-based disk encryption.
				systemDiskEncryption = {
					ephemeral = {
						provider = "luks2"
						keys = [{
							slot = 0
							tpm = {
								checkSecurebootStatusOnEnroll = true
							}
						}]
					}
					state = {
						provider = "luks2"
						keys = [{
							slot = 0
							tpm = {
								checkSecurebootStatusOnEnroll = true
							}
						}]
					}
				}
			}
			cluster = {
				network = {
					cni = {
						# Disable default CNI as Cilium is used.
						name = "none"
					}
				}
				proxy = {
					# Disable kube-proxy as Cilium replaces it.
					disabled = true
				}
				extraManifests = [
					# Install Gateway API CRDs.
					"https://github.com/kubernetes-sigs/gateway-api/releases/download/${var.gateway_api_version}/standard-install.yaml"
				]
				inlineManifests = [
					# Install Cilium as CNI.
					{
						name = "cilium"
						contents = data.helm_template.cilium.manifest
					}
				]
			}
		})
	]
}

# Create a Talos node by applying the control plane configuration created earlier.
resource "talos_machine" "control_plane" {
	node = var.control_plane_ip
	client_configuration = talos_machine_secrets.this.client_configuration
	machine_configuration_wo = ephemeral.talos_machine_configuration.control_plane.machine_configuration
	image = data.talos_image_factory_urls.metal_arm.urls.installer_secureboot
	# Disabling drain_on_upgrade as only one control plane node is provisioned.
	drain_on_upgrade = false
}

# Create a cluster. Currently, the cluster consists of only one control plane node.
resource "talos_cluster" "this" {
	depends_on = [talos_machine.control_plane]
	node = var.control_plane_ip
	kubernetes_version = var.cluster_kubernetes_version
	client_configuration = talos_machine_secrets.this.client_configuration
}

# Validate the cluster reaches a healthy state.
ephemeral "talos_cluster_health" "this" {
	depends_on = [talos_cluster.this]
	client_configuration = talos_machine_secrets.this.client_configuration
	control_plane_nodes = [var.control_plane_ip]
	endpoints = [var.control_plane_ip]
	timeout = "5m"
}

# Get the kubeconfig data for the cluster.
ephemeral "talos_cluster_kubeconfig" "this" {
	cluster_name = var.cluster_name
	endpoint = "https://${var.control_plane_ip}:6443"
	machine_secrets = talos_machine_secrets.this.machine_secrets
}

# Get the talosconfig data for the cluster.
ephemeral "talos_client_configuration" "this" {
	machine_secrets = talos_machine_secrets.this.machine_secrets
	cluster_name = var.cluster_name
	endpoints = [var.control_plane_ip]
	nodes = [var.control_plane_ip]
}

# Output the kubeconfig file to the repository root.
resource "terraform_data" "kubeconfig" {
	provisioner "local-exec" {
		command = "echo \"${ephemeral.talos_cluster_kubeconfig.this.kubeconfig_raw}\" > ${path.module}/../../kubeconfig"
	}
}

# Output the talosconfig file to the repository root.
resource "terraform_data" "talosconfig" {
	provisioner "local-exec" {
		command = "echo \"${ephemeral.talos_client_configuration.this.talos_config}\" > ${path.module}/../../talosconfig"
	}
}
```

Just like with the simpler Tofu, all it takes to turn a freshly created Talos VM into a fully-functioning cluster is running `tofu apply`. One of the really neat positives to this approach is I was able to easily add the templated Cilium manifests to the Talos machine config. This ensures that the cluster networking is set up at just the right time during the bootstrap process. The only downside to this approach is that any updates to the Cilium resources require running the Kubernetes upgrade process on the Talos nodes.

## Next steps

What's left to do? Well, actually quite a bit still. While I do like using Tofu to install Helm releases into the cluster, I think I would prefer to go with a [GitOps](https://en.wikipedia.org/wiki/DevOps#GitOps) approach for installing and managing future applications in my cluster. Don't worry, I'll explain more about GitOps and why I want to use it in the next post! For now, I need to compare different GitOps continuous-delivery projects and figure out how to bootstrap one in the cluster. Thanks so much for reading, and hope you enjoyed this post!

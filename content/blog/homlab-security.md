+++
title = "Safety first"
description = "Securing my homelab."
date = 2026-10-04
updated = 2026-10-04

[taxonomies]
projects = ["homelab"]

[extra]
stylesheets = ["/readable.css", "/blog.css"]
+++
## Who, me??

Now that I had GitOps set up, I was finally ready to install some services in my cluster. But before I could start having fun, I had to make sure everything was secure. I'm sure you've heard the phrase "ogres are like onions", but did you know that good software security (also known as SecOps) is also like an onion: layered! Layering security is important because even the most meticulous designs or audited software _will_ have bugs, [zero-days](https://en.wikipedia.org/wiki/Zero-day_vulnerability), and exploits. No system will ever be 100% secure, so the goal is to deter attackers by a) making your system an unappealing target and b) making your system hard enough to breach that it's not worth the time. My goal was to be both an unappealing target and to make my homelab difficult to breach.

To make my homelab unappealing, I will not be storing any sensitive data or running any critical services in my cluster. You might be wondering if that makes my cluster worth attacking at all. There are three main reasons I can think of:

1. The homelab might be an entry point to my entire home network, where there might be sensitive data, passwords to accounts, etc.
2. If a persistent piece of malware is installed in the cluster, it could wait patiently for me to mess up and store some sensitive data in my cluster.
3. The homelab machines could be used as part of a [botnet](https://en.wikipedia.org/wiki/Botnet) or for crypto mining.

That brings us to (in my opinion) the first layer of SecOps: _assume someone will want to hack you, and that they are skilled and determined_. In general, I think this is a good mindset to have to stay safe online.

## Protection IV, Unbreaking III

Now we can start to dig into the more technical layers. For Kubernetes clusters, there are three:

1. The configuration of the cluster.
2. The configuration of the workloads.
3. Runtime security.

First, the configuration of the cluster itself. This includes restricting access to the `kube-apiserver`, enabling Secret encryption-at-rest, configuring Pod Security Admission, etc. Because there are so many different configurations that need review, there are a number of open-source projects to help audit and enforce these. Two of the main ones I saw were [kube-bench](https://aquasecurity.github.io/kube-bench/latest/) and [Kubescape](https://kubescape.io). kube-bench is specifically designed to evaluate a cluster against the [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes/), which are an industry-standard set of controls cluster operators should follow to ensure their clusters are configured securely. Kubescape has the goal of being the all-in-one tool for Kubernetes security. Reviewing the two tools, I was interested in trying out Kubescape as it included a number of tools I could use to scan for security issues in my cluster. Spoiler alert, I ended up deciding not to use either of these tools.

I spent a number of hours getting the Kubescape Operator running in my cluster. The Kubescape Operator promised to do a number of things: it could continuously scan the cluster for misconfigurations (including evaluating against multiple frameworks, such as CIS, NSA, etc.), scan workload images for CVEs, generate NetworkPolicies, _and_ perform runtime security by monitoring running processes. However, I had to balance my goal of industry-standard production security with a number of homelab constraints. The most major constraint I have is compute capacity. While Kubescape can do a lot, it requires a large number of components running to perform all these actions. This ended up using too much of my limited single-node resource capacity. What use is having a secure cluster if I can't run anything else in it?

My other major constraint is time. Many security tools, including Kubescape, are mainly targeted at _auditing_ a cluster. For example, running privileged workloads _is_ less secure than only running unprivileged ones. In fact, they can even be indicators of an attack because typically an attacker would want to get privileged access. But there are legitimate workloads that need to run with privileged permissions. How should cluster operators handle this? One common way is to simply audit privileged workloads instead of outright blocking them. This allows security teams to set up alerts, get notified of new privileged workloads, and check them to make sure they aren't malicious. While auditing like this can be great for large companies, it's not really feasible for me with a hobby project. I need tools that help me block malicious activity with a high degree of confidence. In a similar vein, [image CVE scanning](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) isn't particularly useful to me. If a service I'm running has known CVEs, really the only thing I can do is wait for an update to be released that patches those vulnerabilities. I plan to automate dependency updates (read all about it in an upcoming post!), so being notified of CVEs just isn't something I need to waste precious cluster resources on. A large company might have the capacity to fork projects and apply their own fixes, or pay for a service like [Chainguard](https://www.chainguard.dev). But I don't 😁.

In addition to all this, some of the functionality is duplicated by existing services I plan to run, such as the NetworkPolicy generation and runtime security monitoring. I also ran into a number of bugs trying to get the Kubescape Operator set up, and generally I'm just not sure it's mature enough. And there's another factor to consider: [supply chain security](https://en.wikipedia.org/wiki/Digital_supply_chain_security). Every service I run in my cluster is software. And that software can depend on other software. And so on, and so on. Supply chain attacks are attacks where one of those dependencies, one I might not even know is a dependency, gets compromised, leading to me getting compromised. These can be some of the most widespread and devastating attacks. In fact, just recently [Trivy itself (an image CVE scanning security tool) was compromised through a supply chain attack](https://nvd.nist.gov/vuln/detail/cve-2026-33634)! How ironic that users were compromised _because_ they were trying to follow security best practices.

After going through all this, I found an extremely useful piece of [Talos documentation covering how it meets pretty much all of the CIS benchmarks by default](https://docs.siderolabs.com/talos/v1.14/security/talos-default-hardening-and-cis-compliance). This, along with their [security checklist](https://docs.siderolabs.com/talos/v1.14/security/talos-security-checklist) gave me enough confidence to decide not to run either kube-bench or Kubescape in my cluster for now. Maybe I'll decide to run a security scanning service later, but for now I had enough research to know that it wouldn't provide much immediate value. That being said, there were a few small configuration changes I made to improve my cluster security. First, I enabled the rotation of `kubelet` server certificates:

```terraform
yamlencode({
	apiVersion = "v1alpha1"
	kind = "KubeletConfig"
	config = {
		# Required for deploying metrics-server:
		# https://docs.siderolabs.com/kubernetes-guides/monitoring-and-observability/deploy-metrics-server.
		serverTLSBootstrap = true
	}
}),
```

However, I learned that doing this generated [certificate signing requests (CSRs)](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/) that needed to be auto approved. I discovered the [Talos Cloud Controller Manager project](https://github.com/siderolabs/talos-cloud-controller-manager), which I could deploy to do just that. One quick setting I had to adjust was to allow workload scheduling on control plane nodes:

```terraform
yamlencode({
	apiVersion = "v1alpha1"
	kind = "KubeNodeConfig"
	taints = {
		# Currently, only running single-node setup so all workloads need to schedule on the control plane node.
		"node-role.kubernetes.io/control-plane": {
			"$patch" = "delete"
		}
	}
}),
```

Similar to what I did for Cilium and Flux, I also needed to deploy the Talos Cloud Controller Manager as part of the Talos machine configuration. Otherwise, I would be locked out of the cluster after it was initially created. I also updated the Talos configuration so I could support [User Namespaces](https://kubernetes.io/docs/concepts/workloads/pods/user-namespaces/):

```terraform
yamlencode({
	apiVersion = "v1alpha1"
	kind = "SysctlConfig"
	params = {
		"user.max_user_namespaces" = "11255"
	}
}),
```

And finally, I updated the default [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) to use the `restricted` level by default:

```terraform
yamlencode({
	apiVersion = "v1alpha1"
	kind = "KubeAdmissionControlConfig"
	name = "PodSecurity"
	configuration = {
		apiVersion = "pod-security.admission.config.k8s.io/v1alpha1"
		kind = "PodSecurityConfiguration"
		defaults = {
			enforce = "restricted"
			enforce-version = "latest"
			audit = "restricted"
			audit-version = "latest"
			warn = "restricted"
			warn-version = "latest"
		}
		exemptions = {
			# The kube-system namespace is added by default.
			namespaces = []
			runtimeClasses = []
			usernames = []
		}
	}
}),
```

All these configurations, on top of the work I did previously (using the SecureBoot images, encrypting the disks, etc.), and the baseline Talos itself provides, gave me enough confidence in the security of my cluster configuration to move on to the next layer! _A quick side note: security hardening is an ongoing process, and never something that should be considered "finished"._

## Digital bouncer

With the cluster configuration in a good state, it was time to work on the next layer: workload configuration security. A "workload" generally refers to anything running in the cluster. There are a number of configurations that should be set to minimize their permissions and capabilities, unless they explicitly need more privileged access. The basic idea is to create a set of policies to enforce certain configurations on workloads, and block workloads missing these from being admitted to the cluster. Naturally, these are called admission policies and there are two kinds:

- [Validating Admission Policies](https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/), which simply check for specific configurations on workloads and block admission if the requirements are not met.
- [Mutating Admission Policies](https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/), which can be used to add configurations to workloads when they are admitted to the cluster.

Both kinds of policies can be used for security hardening, but can also be used to enforce standards and best practices. While these policies are natively supported by Kubernetes and can be added directly, most larger organizations use projects like [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/) or [Kyverno](https://kyverno.io) to deploy and manage policy enforcement. I did consider running one of these services, but again, with my limited amount of compute resources I decided just to directly deploy Validating and Mutating Admission Policies for now. I just started with a couple of simple policies to enforce some basic behavior. As I mentioned before, security hardening never really ends. And this is especially true of policy creation. There are a near-endless number of policies I could choose to deploy covering a massive spectrum of configuration options. For now, I just wanted one or two of each to get started, and I plan to keep adding more in the future. For a ValidatingAdmissionPolicy, I restricted the sources Flux would be allowed to sync from:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicy
metadata:
	name: flux-sources
spec:
	failurePolicy: Fail
	paramKind:
		apiVersion: v1
		kind: ConfigMap
	matchConstraints:
		resourceRules:
		- apiGroups: [source.toolkit.fluxcd.io]
			apiVersions: [v1]
			operations: [CREATE, UPDATE]
			resources: [gitrepositories, ocirepositories, helmrepositories]
	variables:
	- name: allowedSources
		expression: params.data.sources.split(' ')
	validations:
	- expression: variables.allowedSources.exists_one(prefix, object.spec.url.startsWith(prefix))
```

And for a MutatingAdmissionPolicy, I made sure all ServiceAccounts had the `automountServiceAccountToken` value explicitly defined:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingAdmissionPolicy
metadata:
	name: serviceaccount-token-default
spec:
	failurePolicy: Fail
	reinvocationPolicy: IfNeeded
	paramKind:
		apiVersion: v1
		kind: ConfigMap
	matchConstraints:
		resourceRules:
		- apiGroups: [""]
			apiVersions: [v1]
			operations: [CREATE, UPDATE]
			resources: [serviceaccounts]
	matchConditions:
	- name: missing-token-value
		expression: '!has(object.automountServiceAccountToken)'
	mutations:
	- patchType: ApplyConfiguration
		applyConfiguration:
			expression: |
				Object{
					automountServiceAccountToken: params.data.exists(serviceAccountEntry,
						serviceAccountEntry == object.metadata.namespace + "." + object.metadata.name
					)
				}
```

This layer does include other work beyond admission policies. While policies are great for enforcing configuration, it is also important to _actually_ configure workloads running in the cluster with appropriate security controls. For example, by defining [Security Contexts](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/), restricting file systems to be read-only, and more. These are all things that should be checked whenever any new service is added to the cluster. Because I am the only person installing workloads in the cluster, I don't necessarily need to create policies for every little value right now. It's something I'll continue working towards, but I'll also balance it with a careful review of new service configurations whenever I add anything to the cluster. With the policy flow figured out and tested, it was time to start work on one of the most important layers: runtime security!

## Pruning (network) paths

Great, so our cluster is at least somewhat secure and we have some policies to make sure our workloads minimize their permissions. But _what if_ an attacker does breach the cluster? What should we do? The best thing we can do is _limit_ what an attack can do or access. There are two main ways to do this: by restricting what programs an attacker can run, and by restricting what an attacker can connect to. I have a decent amount of experience implementing network restrictions, so I started there. Pretty much all workloads running in a cluster will need to connect to something, whether that be another service running in the cluster, some external endpoint, or even the Kubernetes API itself. By default in Kubernetes, workloads are allowed to connect to pretty much anything. The gold standard in network security is to reverse that and establish a default-deny stance. To understand why this is so critical, let's present a simple example scenario.

Maybe I have a Minecraft server running in my Kubernetes cluster. I need to allow people to connect to the server, and I need to allow the server to connect to an authentication API to make sure only specific players are allowed to join. In a default-allow networking environment, all this just works automatically. But maybe an attacker connects to the server. And maybe this attacker has found an exploit in the Minecraft server program that lets them get admin (more commonly known as "root") privileges on the Minecraft server pod. One of the first steps they might do is try to install some network scanning software from a source on the internet. Then they might use that to scan my cluster network to see what other workloads I'm running and if any could contain sensitive data. They might even connect to the Kubernetes API to create their own workloads in my cluster, such as setting up a crypto miner. This would all be very bad. But what would have happened if I had default-deny networking? I would have ensured the Minecraft server could only allow users to connect to it and could only connect to the authentication API. So an attacker wouldn't have been able to download their network scanning software, they wouldn't have been able to scan for other services in my network, and they wouldn't have been able to connect to the Kubernetes API. This would have severely limited what an attacker could do, even if they did gain root access to the Minecraft server pod.

Hopefully that example demonstrated how important default-deny networking can be! So how to get started? Well, luckily this is one of the many features Cilium supports (while Kubernetes _does_ support [NetworkPolicies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) natively, Cilium's policies offer a number of more advanced and convenient options). I can create [CiliumNetworkPolicies](https://docs.cilium.io/en/stable/security/policy/) for each of my workloads, which restrict what they can connect to. This process can be a little tedious, and can be quite challenging to do without knowing what a service is trying to hit. Cilium helps here too! We can deploy [Hubble](https://docs.cilium.io/en/stable/observability/hubble/) to view the network activity of the cluster. Because my cluster is still in development, I decided to just enable default-deny, which would break pretty much everything running, and then slowly start to enable connections bit by bit. There are a few different ways to enable default-deny, but I decided to set the `policyEnforcementMode` Cilium Helm Chart value to `always`. This initially broke pretty much every service, but I slowly worked to set up policies for everything. Here's an example of the policy I created for the Talos Cloud Controller Manager:

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
	name: talos-cloud-controller-manager
	namespace: kube-system
specs:
- description: Allow Talos Cloud Controller Manager connectivity.
	endpointSelector:
		matchLabels:
			app.kubernetes.io/name: talos-cloud-controller-manager
	ingress:
	# Talos Cloud Controller Manager probes need to connect back to itself.
	- fromEndpoints:
		- matchLabels:
				app.kubernetes.io/name: talos-cloud-controller-manager
		toPorts:
		- ports:
			- port: "10458"
				protocol: TCP
	egress:
	# Talos Cloud Controller Manager probes need to connect back to itself.
	- toEndpoints:
		- matchLabels:
				app.kubernetes.io/name: talos-cloud-controller-manager
		toPorts:
		- ports:
			- port: "10458"
				protocol: TCP
	# Talos Cloud Controller Manager needs to connect to kube-apiserver to approve node CSRs.
	- toEntities: [kube-apiserver]
```

As you can see, these policies drastically restrict what a service can connect to. Eventually, with a lot of hard work I got all the services healthy again and default-deny networking was fully enabled! There was one small hiccup though. How do I deal with this during the initial node creation? I ran into a series of issues trying to create the cluster with default-deny networking in place. I decided to override the `policyEnforcementMode` during node creation to keep the default-allow behavior, and they would have Flux update Cilium to enable default-deny after the initial bootstrap was finished:

```terraform
locals {
	# ...
	startup_cilium_chart_values = merge(local.cilium_chart_values, {policyEnforcementMode = "default"})
}

# ...

data "helm_template" "cilium" {
	values = [yamlencode(local.startup_cilium_chart_values)]
}
```

I felt this was sufficient as the cluster should be in a completely safe state during initial creation, and wouldn't need the network safety until after the bootstrap process. The default-deny networking I had in place was created to restrict what workloads running _in_ the cluster cloud do, but what if an attacker got access to the host node? Talos does have [documentation for setting up a host firewall](https://docs.siderolabs.com/talos/v1.14/networking/ingress-firewall), but again Cilium makes this even more convenient! Cilium supports [host firewall policies](https://docs.cilium.io/en/stable/security/host-firewall/), which are almost identical to the workload policies I just created! I added a host firewall to an existing CiliumClusterwideNetworkPolicy I had deployed:

```yaml
- description: Node firewall for all nodes.
	nodeSelector:
		matchLabels: {}
	ingress:
	# Allow connections from devices used to manage the cluster.
	- fromCIDR: [192.168.1.0/24]
		toPorts:
		- ports:
			# Used for talosctl commands (hitting apid).
			- port: "50000"
				protocol: TCP
			# Used for kubectl commands (hitting kube-apiserver).
			- port: "6443"
				protocol: TCP
	# Allow pods to access the kube-apiserver.
	- fromEntities: [cluster]
		toPorts:
		- ports:
			- port: "6443"
				protocol: TCP
	# Allow other nodes to access required control plane services.
	- fromEntities: [remote-node]
		toPorts:
		- ports:
			# Allow Cilium VXLAN traffic.
			- port: "8472"
				protocol: TCP
			# Allow connections to etcd.
			- port: "2379"
				endPort: 2380
				protocol: TCP
			- port: "51871"
				protocol: UDP
	# Allow connections for Cilium health checks.
	- fromEntities: [health]
		toPorts:
		- ports:
			- port: "4240"
				protocol: UDP
	# Allow metrics-server to connect to kubelet.
	- fromEndpoints:
		- matchLabels:
				app.kubernetes.io/instance: metrics-server
				app.kubernetes.io/name: metrics-server
		toPorts:
		- ports:
			- port: "10250"
				protocol: TCP
	# Allow Hubble Relay to connect to Cilium.
	- fromEndpoints:
		- matchLabels:
				app.kubernetes.io/part-of: cilium
				app.kubernetes.io/name: hubble-relay
		toPorts:
		- ports:
			- port: "4244"
				protocol: TCP
	# Allow full access to the cluster because currently pods using Gateway API
	# report their SYN/ACK connections as new ingress connections to the host:
	#
	# <time>: podinfo/podinfo-<pod-id>:9898 (ID:<id>) <> 10.244.0.254:57886 (host) policy-verdict:none INGRESS DENIED (TCP Flags: SYN, ACK)
	# <time>: podinfo/podinfo-<pod-id>:9898 (ID:<id>) <> 10.244.0.254:57886 (host) Policy denied DROPPED (TCP Flags: SYN, ACK)
	#
	# Possibly related to running envoy and backend on same node:
	# https://github.com/cilium/cilium/issues/42325.
	# TODO: Hopefully am able to remove at some point in the future.
	- fromEntities: [cluster]
	egress:
	# Allow connections for DNS resolution through LAN DNS.
	- toCIDR: [192.168.3.1/32]
		toPorts:
		- ports:
			- port: "53"
				protocol: ANY
	# Allow connections from the node to the cluster.
	# Required for pod probes, and other connectivity.
	- toEntities: [cluster]
	# Allow connections to the internet (same as `world` entity),
	# but excluding VLANs. Only allows HTTPS and NTP.
	- toCIDRSet:
		- cidr: 0.0.0.0/0
			except: [192.168.0.0/16]
		toPorts:
		- ports:
			- port: "443"
				protocol: TCP
		- ports:
			- port: "123"
				protocol: UDP
```

## Pruning (binary) paths

With that in place, I was ready to tackle the program restriction piece! I found a Cilium sub-project called [Tetragon](https://tetragon.io) I could use to accomplish this! I wanted to be ambitious with this. I wanted to try and implement a default-deny binary execution posture, very similar to what I just implemented for the networking layer. I ended up finding a way to do this, but want to wait to fully deploy policies till the next version of Tetragon releases, as the workload selector is currently scoped to the entire policy. For now, here's an example of the policy I created for `hubble-ui` pod in the `kube-system` namespace:

```yaml
apiVersion: cilium.io/v1alpha1
kind: TracingPolicyNamespaced
metadata:
	name: allowed-programs
	namespace: kube-system
spec:
	podSelector:
		matchLabels:
			app.kubernetes.io/part-of: cilium
			app.kubernetes.io/name: hubble-ui
	kprobes:
	- call: sys_execve
		syscall: true
		args:
		- index: 0
			type: string
		selectors:
		- matchArgs:
			- index: 0
				operator: NotPostfix
				values:
				# Used by `backend` container.
				- backend
				# Used by `frontend` container.
				- docker-entrypoint.sh
				- find
				- sort
				- 10-listen-on-ipv6-by-default.sh
				- basename
				- touch
				- 20-envsubst-on-templates.sh
				- awk
				- 30-tune-worker-processes.sh
				- nginx
			matchActions:
			- action: Sigkill
```

Overall, I'm really excited by Tetragon, as it feels like an extremely easy way to add a significant level of security hardening to the cluster. This also helps mitigate an issue that was bothering me with my homelab. Generally, it's best practice for maintainers to create "distroless" containers for production use. Distroless images aren't actually distroless, they are just images that are stripped down to the minimal number of dependencies needed to run an application. To be clear, this doesn't eliminate threats and I do think the security benefits of these images can be overstated. But generally, they result in smaller images which is good and they do reduce the number of available binaries an attacker might use. Unfortunately, not every maintainer provides these. Entire companies, like Chainguard, have developed a business model around creating minimal images with no CVEs, but sadly services like these are quite expensive. Tetragon, with default-deny binary policies, gives me a way to mirror the security benefits of a minimal image at runtime. Pretty cool!

## Done with security

Just kidding! Remember, security hardening never really ends! But at least for now, I think I've reached a good enough point and can start actually deploying something to the cluster. As one final hardening step, I did try to set up in-cluster traffic encryption with Cilium, but didn't end up deploying anything. Cilium offers three ways to do this: IPSec, WireGuard, and ztunnel. Both IPSec and WireGuard wouldn't be useful right now because they don't encrypt traffic within a node, and additionally IPSec isn't compatible with host firewall policies. I thought ztunnel seemed promising, but it broke some of the functionality of the network policies I set up. This is a known incompatibility, but since ztunnel is fairly new, I'll be interested to see if it will be made compatible in the future. For my homelab, the network policy protections are significantly more useful than traffic encryption so I decided to just leave traffic unencrypted for now.

While a lot of Kubernetes cluster security hardening needs to be tailored to each individual service and cluster, I hope this gave you a good starting point for thinking about what can be done at each layer. I know a lot of this might be pretty dry, or seem overkill, so I if there's anything I want you to take away from this post it's this:

- Assume someone will want to breach your system. This could be a determined hacker or an advanced, automated scanning bot looking for easy targets.
- Good security involves layering. Assuming each layer is breached will help you figure out how to handle security at the next layer (for example, I created a separate VLAN at the very start of this project because I assumed an attacker might breach every previous security layer I had and get root access to the host server).
- A system will never be 100% secure. The goal is just to make your system so hard to breach that it's not worth accessing (or at the very least, is resilient enough to automated bots).
- Security hardening is an ongoing process, and is never something that should be considered "finished".

Hopefully you found all this interesting! I know this was kind of a whirlwind, there is so much that could be covered under this topic that it was hard not to go off on a tangent. In the future, I might write more in-depth posts on specific security areas as there is just so much to talk about. Thank you so much for reading, and get excited for the next post! We're finally going to create a service exposed to the internet! 🌐

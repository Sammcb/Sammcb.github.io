+++
title = "Let's get virtual (machines)!"
description = "Setting up a VM with SecureBoot for a home server."
date = 2026-04-23
updated = 2026-04-23

[taxonomies]
projects = ["homelab"]

[extra]
stylesheets = ["/readable.css", "/blog.css"]
+++
## There's an app for that

Now that I had my first homelab host machine set up and ready to go, it was time to get a basic [Kubernetes](https://kubernetes.io/) cluster running. For that, I would need [virtual machines](https://en.wikipedia.org/wiki/Virtual_machine). I needed/wanted to use these for a few reasons:

1. A virtualization layer is required to run Kubernetes on macOS, as Kubernetes is only designed to run on Linux machines. For local development environments, it's common to simply install a containerization tool (like [`docker`](https://www.docker.com)) and then a tool to run Kubernetes in containers (like [`kind`](https://kind.sigs.k8s.io)).
2. Using VMs adds a layer of security due to the isolation from the host machine. Kubernetes of course containerizes the workloads it runs already, but it's also nice to know that Kubernetes itself will be isolated from the host machine.
3. VMs help reduce pollution of the host system. This is especially useful while I'm experimenting with different deployment methods and operating systems. While this isn't a major factor, it's nice to know I'm not leaving a bunch of unused binaries or configs across the host system. Cleaning all those up can be a real pain and it's very easy to miss some.

There are many ways to create VMs on macOS. For the initial development, I wasn't too concerned with automation and decided to go with a well-known app called [UTM](https://getutm.app). UTM is basically just a nice UI wrapper around [QEMU](https://www.qemu.org) and simplifies a lot of the VM setup. While UTM does have a paid app on the App Store, I couldn't download it because I wasn't signed in with an Apple Account. UTM does provide free app downloads with each of their repo releases (the only missing feature is the lack of automated updates), so I downloaded the app from there.

Quick aside: I strongly encourage purchasing the app if you can. It helps support the developers and the ecosystem of free, open source software!

## Definitely not the driest part of this post: networking!

You know it, you love it... it's more networking configuration! Before I could get to the fun stuff (choosing an OS, actually setting up Kubernetes, etc.), I needed to figure out how to connect the VM to my homelab VLAN so that I could expose future services to the internet and connect to the machine remotely from devices on my main VLAN. I also initially wanted to block connections from the VM to the host machine. UTM offered a few different network modes: Emulated VLAN, Shared Network, Host Only, and Bridged.

I couldn't use the Host Only mode because, while it did provide high isolation and could be shared across multiple VMs, it also blocked internet access.

The Emulated VLAN mode also wouldn't work because if I isolated the VM VLAN from the host, it would prevent me from being able to connect to services in the VM because the isolation goes both ways.

The Shared Network mode was the default setting, which basically sets up [NAT](https://en.wikipedia.org/wiki/Network_address_translation) for the VMs. I didn't like this option because I would have to expose the host machine's IP to the internet for port-forwarding instead of being able to expose a different IP specific to the VM.

I ended up going with Bridged mode. This mode connects the VMs LAN directly to the homelab VLAN. Essentially, what this means is that the VM acts like it's just any other physical machine on the existing homelab VLAN. I can give it a fixed IP, port-forward that IP without needing to expose the host machine's IP, and generally simplifies the networking. The one thing I wasn't able to do using Bridged mode was prevent the VM from connecting to the host machine's IP. Even if I added a new firewall rule, because the VM and host machine were in the same homelab VLAN, connections would be [switched](https://en.wikipedia.org/wiki/Network_switch) within a network instead of routed between networks and thus wouldn't be affected by firewall rules.

I decided that isolation from the host IP actually might not even be desirable, as I wanted to be able to backup Minecraft worlds to the host machine so they would be safely stored outside of the Kubernetes cluster in case of a VM corruption. I'm unsure what that solution will look like right now, but I might need connectivity from a container in Kubernetes to the host. Additionally, I plan to deploy default-deny networking policies for my Kubernetes cluster which will let me control exactly which services can make egress connections. I also have `ssh` access disabled on the host machine as I currently only need to access it over VNC.

## Analysis paralysis, deployment enjoyment

With the VM networking configuration decided, it was time to figure out what host OS to use. Ideally, I wanted the OS to be minimal, secure-by-default, and declaratively configurable. Originally, I was considering something like NixOS. I already use Nix for my projects, and knew the declarative configuration would be a good fit. However, NixOS is designed to be usable as a general-purpose OS, and I was worried about how long it might take to go through all the options and harden everything for use as a minimal Kubernetes host. I also considered widely-used options like Alpine, but had similar concerns. Plus, configuration would be much more difficult for these systems. Luckily, I found an OS called [Talos Linux](https://www.talos.dev) which was specifically designed to only run Kubernetes! It fit my requirements perfectly. I could set it up using a simple configuration file and it only included a bare-minimum set of packages needed to run Kubernetes. Because of this, it seemed like one of the easiest options to secure for use as a production system. To get started, I first read through the docs and followed the steps to set up the system manually. I noticed Talos had instructions for installation with [SecureBoot](https://en.wikipedia.org/wiki/UEFI#Secure_Boot) enabled.

## Mini tangent: SecureBoot

What's SecureBoot I hear you ~not~ asking? Here's a quick overview skipping over some of the more technical bits.

Basically, when a computer starts up, it progresses through a [boot process](https://en.wikipedia.org/wiki/Booting_process_of_Linux) made up of a few stages. With Linux systems, this typically includes four stages: motherboard firmware, bootloader, kernel, and operating system startup. Each of these stages execute code to initialize the machine, and importantly each stage has a higher privilege level than the stage after it. Most commonly, malware lives within the operating system level, which has a lower priveledge than the code in the boot stages. Because of this, most of the time the OS can simply be wiped and reinstalled to ensure the malware is cleaned from the system. However, there are some very advanced types of malware that can use exploits to escalate privileges until eventually they can persist themselves at a stage in the boot process. In the most extreme cases where malware persists itself at the motherboard firmware level, this can mean there is no way to fully disinfect a computer.

This is where SecureBoot comes in! SecureBoot is a security protocol designed to protect the code in the boot stages from being silently infected by malware. A "platform key" is used to sign [UEFI](https://en.wikipedia.org/wiki/UEFI) drivers and OS bootloaders. When SecureBoot is initially enabled, it enters "setup" mode and the platform key can be written to the firmware. From then on, SecureBoot enters "user" mode. In this mode, it will prevent any UEFI drivers or OS bootloaders from running if they do not match a known digital signature identified by the platform key. This whole process helps protect systems from having malware persist in the boot stage layers. Pretty cool beans!

## Back to the show!

So, back to installing Talos. You might be thinking, does SecureBoot really add any security if you're going to be running Talos in a VM anyways? The answer is... nope! But, I wanted to learn how to install the image with SecureBoot enabled in case I decide to run Talos on bare-metal later. Plus I got to learn a lot more about UEFI and SecureBoot, so I'm calling this a win! I started by using the Talos Image Factory to create a bare-metal [ARM](https://en.wikipedia.org/wiki/ARM_architecture_family) SecureBoot image and downloaded the [ISO](https://en.wikipedia.org/wiki/Optical_disc_image) file. I then set up a VM using the ISO in UTM. Because Talos has an ARM image, I was able to create a virtualized machine instead of a slower emulated one. I selected the "Other" OS, configured resources, and made sure the UEFI Boot option was selected. This was all I needed to create the VM entry, but I still had a little configuration to finish up in the VM settings.

First, I opened the QEMU settings and enabled `TPM 2.0 Device` as this is required for SecureBoot. I made sure `Reset UEFI Variables` was set, but unchecked `Preload Secure Boot Keys`. This configuration ensures that when the VM is initially booted, SecureBoot will be in "setup" mode and the Talos image can automatically enroll the keys needed. Next, I deleted the `Sound` and `Display` devices UTM automatically created. This is because I wanted to run the VM in [headless](https://en.wikipedia.org/wiki/Headless_software) mode (this just means running it without a GUI) to minimize the amount of overhead resources used. To finish setting up the headless VM, I added a `Serial` device and set the mode to `Pseudo-TTY Device` so I could view the Talos log output from a terminal window. Finally, it was time to start it up!

And... cliffhanger 🧗! This post is getting pretty long, so I'll cover the rest of the Talos manual setup in a future one. The next post should finally have some fun command snippets/output and maybe even some screenshots, so stay tuned! Thanks for reading!

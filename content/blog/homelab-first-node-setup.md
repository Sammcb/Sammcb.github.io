+++
title = "Configure it? I barely node it!"
description = "Configuring a Mac mini for use as a home server."
date = 2026-04-04
updated = 2026-04-04

[taxonomies]
projects = ["homelab"]

[extra]
stylesheets = ["/readable.css", "/blog.css"]
+++
## It works on my machine

For a while now, I've wanted to set up a small [home server](https://en.wikipedia.org/wiki/Home_server) (more commonly referred to as homelabs) to run some basic services and give me a place to play around with a personal [Kubernetes](https://kubernetes.io) cluster. I decided to start by setting up a simple single-node cluster using a [VM](https://en.wikipedia.org/wiki/Virtual_machine) running on one machine. I've flip-flopped back-and-forth on getting a machine, because I really only wanted to host some Minecraft servers and maybe my website instead of using GitHub pages. However, recently I learned about [Codeberg](https://codeberg.org) and love their mission. I decided to migrate my repos from GitHub to Codeberg, but ran into some issues with their provided runner sizes for CI jobs. I use [Nix](https://nixos.org) for my projects, and while I love many aspects about Nix, it can lead to heavy/slow initial installations when using `flake` dependencies. Codeberg urges users to use their provided runners responsibly, and in that spirit I decided this would be a great time to finally set up a homelab and also use it as a self-hosted runner. So I purchased a machine and finally committed to the project!

## Network configuration

I wanted to provide some basic network security for my home network. **Disclaimer: I am _not_ a network security professional and am still learning more about best practices, so this isn't meant to be a definitive guide!**

First, I created a separate [VLAN](https://en.wikipedia.org/wiki/VLAN) for future homelab nodes. I set up the homelab VLAN to be isolated from any other VLAN networks using firewall rules to block network traffic from crossing VLAN boundaries. I then created a new Wi-Fi SSID for machines on the network (for now, I plan to have machines use Wi-Fi instead of Ethernet).

Because I wanted to manage my machines remotely from devices on my main VLAN, I needed to allow some traffic communication between the VLANs. I was able to add a firewall rule that would allow devices on the homelab VLAN to respond to TCP requests initiated from the main VLAN. This allowed connectivity for VNC, SSH, etc., without allowing devices on the homelab VLAN to initiate connections to devices in other VLANs.

With these basic security firewalls in place, I was ready to set up my first (and for now, only) node!

## Conditioning

Next, it was time to set up my machine so that I could manage it remotely and reduce the amount of processes running to a bare minimum to minimize idle energy usage. I purchased a refurbished Mac mini due to the hardware offering a good balance of power, energy efficiency, and cost. Unfortunately, the default macOS software isn't designed to run headless/as a dedicated server, so there were a lot of settings I needed to configure to turn off unnecessary features. Once M4 chips are supported, I would love to install [Asahi Linux](https://asahilinux.org) instead of macOS.

The first step was to boot the machine, create a user, connect the device to the homelab VLAN, and enable Screen Sharing. Setting up the Mac mini required using an external display and keyboard initially, so I wanted to do as little as possible and just get the machine to a point where I could manage it via the Screen Sharing app from my macOS laptop. While I expected that just using a keyboard would be sufficient to get through the initial setup, I was annoyed to find that tabbing through fields in the setup forms did not always work as expected. Notably, on the form prompting to sign in with an Apple Account, I was unable to skip the sign in by tabbing through. I ended up needing to bring up the accessibility options and enable [Mouse Keys](https://support.apple.com/guide/mac-help/use-your-keyboard-like-a-mouse-mh27469/mac) on the keyboard.

Aside: I do not normally interact with macOS this way, so maybe I was just unaware of other ways to do keyboard-only navigation, but overall I was really disappointed in the default keyboard-only accessibility on the system. Trying to navigate through System Settings without Mouse Keys almost always had issues, where I just couldn't navigate to some fields and others wouldn't let me tab out.

Anyways, I finally enabled Screen Sharing with the following configuration:

```txt
General > Sharing > Screen Sharing (i)

- Screen Sharing: Enabled
- Anyone may request permission to control screen: disabled
- VNC viewers may control screen with password: disabled
- Allow access for: Only these users
	- <List only contains user created during setup>
```

It was difficult to find information about what some of the options would do if enabled or disabled. I discovered that `Anyone may request permission to control screen` being enabled would allow someone to use the credentials of any Mac mini user to log in, but would also require approving requests from the Mac mini. Neither of these things are desirable to me, so I left that disabled. Enabling the `VNC viewers may control screen with password` would effectively allow logins through a "guest" account with the password specified. However, logging in using the credentials of the allowed users would also work. Again, I left this disabled as I just planned to log in with the user credentials.

Before continuing Mac mini configuration remotely, I configured my router to give the Mac mini [MAC address](https://en.wikipedia.org/wiki/MAC_address) a fixed [IP](https://en.wikipedia.org/wiki/IP_address) so I could consistently connect to it in the future. I added a connection using the fixed IP in the Screen Sharing app on my laptop. Finally, I logged in as the user I created, unplugged the device from the keyboard and monitor, and finished setting up all the options.

## Lightning round: settings!

To be honest, the rest of this post is not super interesting and I'm mostly including the full-ish (I might have missed some) list of options I changed as a reference in case I need to wipe the machine and set it up again. Generally, the options I set focused on a few goals: making sure I could log back in remotely even after the machine restarted (which required disabling FileVault and setting some other options) and minimizing unnecessary background processes to improve power efficiency and performance. Thank you so much for reading!

```txt
Sign in with your Apple Account

- <Not signed in>
```

```txt
Wi-Fi

- Wi-Fi: enabled
- <Connected to homelab SSID>
```

```txt
Bluetooth

- Bluetooth: disabled
```

```txt
Network > Firewall

- Firewall: enabled

> Options...

- Block all incoming connections: disabled
- Automatically allow built-in software to receive incoming connections: enabled
- Automatically allow downloaded signed software to receive incoming connections: enabled
- Enable stealth mode: enabled
- Process list
	- screensharingd.bundle: Allow incoming connections
	- QEMULauncher: Allow incoming connections
```

```txt
Energy

- Prevent automatic sleeping when the display is off: enabled
- Wake for network access: enabled
- Start up automatically after a power failure: enabled
```

```txt
General > AirDrop & Handoff

- Allow Handoff between this Mac and your iCloud devices: disabled
- AirDrop: No One
- AirPlay Receiver: disabled
```

```txt
General > AutoFill & Passwords

- AutoFill Passwords and Passkeys: disabled

Verification codes

- Delete after use: enabled
```

```txt
General > Date & Time

- Set time and date automatically: enabled
- Set time zone automatically using your current location: true
```

```txt
General > Language & Region

- Live Text: disabled
```

```txt
General > Login Items & Extensions

- Open at Login: <empty list>

Extensions

- <All extensions for all apps disabled>
```

```txt
Appearance

- Appearance: Auto
- Icon & widget style: Dark (Auto)
```

```txt
Apple Intelligence & Siri

- Apple Intelligence: disabled

Siri Requests

- Siri: disabled
```

```txt
Desktop & Dock

Dock

- Show suggested and recent apps in Dock: disabled

Widgets

- Show Widgets: <disabled for all options>
- iPhone Widgets: disabled

Windows

- Drag windows to left or right edge of screen to tile: disabled
- Drag windows to menu bar to fill screen: disabled
- Hold ⌥ key while dragging windows to tile: disabled
- Tiled windows have margins: disabled

Mission Control

- Automatically rearrange Spaces based on most recent use: disabled
- When switching to an application, switch to a Space with open windows for the application: disabled
- Group windows by application: disabled
- Displays have separate Spaces: disabled
- Drag windows to top of screen to enter Mission Control: disabled
```

```txt
Displays

- Color profile: Screen Sharing Virtual Display

> Advanced...

Link to Mac or iPad

- Allow your pointer and keyboard to move between any nearby Mac or iPad: disabled

> Night Shift...

- Schedule: Sunset to Sunrise
```

```txt
Menu Bar

- Recent documents, applications, and servers: None

Menu Bar Controls

- <Only Wi-Fi enabled>

Allow in the Menu Bar

- SSMenuAgent: enabled
- <All other apps disabled>
```

```txt
Spotlight

- Show related content: disabled
- Help Apple improve Search: disabled

Results from Apps

- <All disabled>

Results from System

- <All disabled>

Results from Clipboard: disabled
```

```txt
Wallpaper

- Black
- Show on all Spaces: enabled

> Screen Saver...

- Start Screen Saver...: Never
```

```txt
Notifications

Notification Center

- Show previews: Never
- Show notifications
	- when display is sleeping: disabled
	- when screen is locked: disabled
	- when mirroring or sharing the display: Notifications Off

Application Notifications

- <All Off>
```

```txt
Sound

Sound Effects

- Play sound on startup: disabled
- Play user interface sound effects: disabled
- Play feedback when volume is changed: disabled

Output & Input

- Output volume: Mute
```

```txt
Lock Screen

- Turn display off when inactive: For 10 minutes
- Require password after screen saver begins or display is turned off: Never
```

```txt
Privacy & Security

> Location Services

- Location Services: enabled
- Siri: disabled
- > System Services > Details...
	- Alerts & Shortcuts Automations: disabled
	- Suggestions & Search: disabled
	- Setting time zone: enabled
	- System customization: enabled
	- Signification locations & routes: disabled
	- Find My Mac: enabled
	- Home: disabled
	- Networking and wireless: enabled
	- Mac Analytics: disabled
	- Show location in Control Center when System Services request your location: disabled

> <Data, like Calendars, Contacts, etc.>

- <All set to None>

> <System capabilities, like Accessibility, App Management, etc.>

- <All set to 0>

> Analytics & Improvements

- Share Mac Analytics: disabled
- Improve Siri & Dictation: disabled
- Improve Assistive Voice Features: disabled
- Share with app developers: disabled

> Apple Intelligence Report

- Report duration: Off

Security

- Allow applications from: App Store & Known Developers

> FileVault

- FileValut: disabled
```

```txt
Login Password

- Automatically log in after a restart: enabled
```

```txt
Users & Groups

- Automatically log in as: <user created during setup>
```

Wow, you made it all the way down here!? I guess you should get some kind of reward. How about a fun fact! Did you know, back in 2012 [Voyager I](https://en.wikipedia.org/wiki/Voyager_1) crossed the heliopause and became the first human-made object to leave the solar system and enter interstellar space? Pretty neat stuff!

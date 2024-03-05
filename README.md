# playbackOS
Turn a Raspberry Pi OS into a interruption-free remote-controlled video playback system

## What is it?
A project borne out of frustration. Trying to find a reliable way of playing back video
without some daft notification system getting in the way at some point (I'm looking at you
Oracle). PlaybackOS is a kiosk-like solution to playing back videos and playlists without
any sign of a user interface. Playback is through VLC, optimised for Raspberry Pi 5's H.265
hardware decoding.

## Features
- H.265 Decoding with VLC
- File and M3U playlist support
- No UI chrome
- No mouse cursor
- Web-based 'remote control'
- Self-healing wifi hotspot for direct access
- Wifi config built in

## Requirements (tested)
- Raspberry Pi 5
- Raspberry Pi OS (Bookworm) 64-bit with Desktop

## Installation
Starting from a clean Desktop OS install, run the following command from
a terminal window or over SSH:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/mrpjevans/playbackos/main/install.sh)"
```

if you would like to check what the script is doing, please have a look at it first:

[https://raw.githubusercontent.com/mrpjevans/playbackos/main/install.sh]()

This script will:

- Update the system
- Install dependancies
- Remove the taskbar and mouse pointer
- Remove the wallpaper
- Configure VLC
- Autostart VLC fullscreen
- Install the remote control web service
- Install a wifi hotspot
- Replace the splash screen
- Install a demo playback file
- Reboot the system

It is currently not idempotent, so do not run it again.

Two folders will be created in your home folder:
- `playbackos_repo` is for development. You can delete this if you wish.
- `playbackos` contains your media files and the web interface.

## Usage

On boot, the system will play a short intro video on loop.

To access the web interface, go to http://ip-address:3000/
where `ip-address` if your IP address. If you don't know this,
try the hostname set when you installed Raspberry Pi OS.

The web interface allows you to:
- Play/Pause
- Move between playlist tracks
- Control volume
- Set up wifi connections
- Set playback preferences
- Shutdown or reboot the system

The UI is very basic and designed for phone use in a live situation.

For more VLC features, it's own web interface is exposed on port 8080.

Currently, the only way to get files on to the system is to use `scp` or `rsync`. Place
all files in `~/playbackos/media`. You can then access then using the file browser.

## Wifi

On installation, a 'hotspot' network configuration is prepared. If there is no valid
wifi connection for the device, the hotspot will become active. You can then connect to
'playbackOS' with the password 'playback'. You can now access the web remote on http://10.42.0.1:3000.

If you wish, you can go to settings (the cog) and connect playbackOS to a local wifi network (wifi that
requires browser windows to log in are not supported).

Whenever playbackOS finds itself disconnected from wifi, the hotspot will be activated within 2 minutes.

## Developing

If you would like to improve playbackOS, you can develop locally.

To work on the web remote control, first stop the service:

```bash
sudo systemctl stop playbackos_remote.service
```

Optionally, halt the wifi checker by commenting out it's line in `/etc/crontab`.

To run in dev mode:

```bash
cd ~/playbackos_repo/remote
npm run dev
```

You can still get to the remote on port 3000, but it's running on files from
`~/playbackos_repo/remote/src`. It'll dynamically restart as on save and works well with
VS Code's SSH remote development service.

PRs welcomed!

## Security

In this version there ios very little in the way of security as we are still very much
in proof-of-concept territory. This will be addressed in future versions.

## Feedback

Love feedback. Please get in touch at pj@mrpjevans.com.

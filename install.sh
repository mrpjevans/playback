#!/bin/bash

# Updates & Depedencies
sudo apt -y update && sudo apt -y upgrade
sudo apt install git vlc

# Repo checkout
rm -rf ~/playbackos_repo
git clone https://github.com/mrpjevans/playbackos.git ~/playbackos_repo

# VLC Config
cp ~/playbackos_repo/assets/vlcrc ~/.config/vlc/

# Directory setup
rm -rf ~/playbackos
mkdir -p ~/playbackos/videos ~/playbackos/playlists
cp ~/playbackos_repo/assets/playback_os_ident_1.mp4 ~/playbackos/videos/
echo ../videos/playback_os_ident_1.mp4 > ~/playbackos/playlists/boot.m3u

# Autostart
cat >> ~/.config/wayfire.ini << EOF
[autostart]
vlc = cvlc $(pwd)/playbackos/playlists/boot.m3u
EOF


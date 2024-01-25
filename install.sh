#!/bin/bash

# Updates & Depedencies
sudo apt -y update && sudo apt -y upgrade
sudo apt -y install git vlc

# Set login to auto/desktop
sudo systemctl --quiet set-default graphical.target
sudo sed -i 's/^.*HandlePowerKey=.*$/HandlePowerKey=ignore/' /etc/systemd/logind.conf
sudo sed /etc/lightdm/lightdm.conf -i -e "s/^\(#\|\)autologin-user=.*/autologin-user=$USER/"
sudo sh -c "cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $USER --noclear %I \$TERM
EOF"

# Repo checkout
rm -rf ~/playbackos_repo
git clone https://github.com/mrpjevans/playbackos.git ~/playbackos_repo

# VLC Config
mkdir ~/.config/vlc
cp ~/playbackos_repo/assets/vlcrc ~/.config/vlc/

# Directory setup
rm -rf ~/playbackos
mkdir -p ~/playbackos/videos ~/playbackos/playlists
cp ~/playbackos_repo/assets/playback_os_ident_1.mp4 ~/playbackos/videos/
echo ../videos/playback_os_ident_1.mp4 > ~/playbackos/playlists/boot.m3u

# Autostart
cat >> ~/.config/wayfire.ini << EOF
[autostart]
vlc = cvlc $HOME/playbackos/playlists/boot.m3u
EOF


#!/bin/bash

WAYFIRE_FILE="$HOME/.config/wayfire.ini"

# Updates & Depedencies
sudo apt -y update && sudo apt -y upgrade
sudo apt -y install git vlc


# Repo checkout
rm -rf $HOME/playbackos_repo
git clone https://github.com/mrpjevans/playbackos.git $HOME/playbackos_repo

# VLC Config
mkdir $HOME/.config/vlc
cp $HOME/playbackos_repo/assets/vlcrc $HOME/.config/vlc/

# Directory setup
rm -rf $HOME/playbackos
mkdir -p $HOME/playbackos/videos $HOME/playbackos/playlists
cp $HOME/playbackos_repo/assets/playback_os_ident_1.mp4 $HOME/playbackos/videos/
echo ../videos/playback_os_ident_1.mp4 > $HOME/playbackos/playlists/boot.m3u

# Autostart
cat >> $WAYFIRE_FILE << EOF
[autostart]
vlc = cvlc $HOMEDIR/playbackos/playlists/boot.m3u
EOF

# Set up desktop
mkdir -p $HOME/pcmanfm/LXDE-pi
cp $HOME/playbackos_repo/assets/desktop-items-0.conf $HOME/pcmanfm/LXDE-pi/

# Set login to auto/desktop
sudo systemctl --quiet set-default graphical.target
sudo sed -i 's/^.*HandlePowerKey=.*$/HandlePowerKey=ignore/' /etc/systemd/logind.conf
sudo sed /etc/lightdm/lightdm.conf -i -e "s/^\(#\|\)autologin-user=.*/autologin-user=$USER/"
sudo sh -c "cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $USER --noclear %I \$TERM
EOF"

# Disable screen blanking
if grep -q dpms_timeout $WAYFIRE_FILE ; then
    sed -i 's/dpms_timeout.*/dpms_timeout=600/' $WAYFIRE_FILE
fi

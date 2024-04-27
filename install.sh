#!/bin/bash

set -euo pipefail

WAYFIRE_FILE="$HOME/.config/wayfire.ini"

# Updates & Depedencies
sudo apt -y update && sudo apt -y upgrade
sudo apt -y install git vlc nodejs npm

# Repo checkout
rm -rf $HOME/playback_repo
git clone https://github.com/mrpjevans/playback.git $HOME/playback_repo

# VLC Config
mkdir $HOME/.config/vlc
cp $HOME/playback_repo/assets/vlcrc $HOME/.config/vlc/

# Directory setup
rm -rf $HOME/playback
mkdir -p $HOME/playback/media
cp $HOME/playback_repo/assets/playback_os_ident_1.mp4 $HOME/playback/media/
cp $HOME/playback_repo/assets/surround_test.mp4 $HOME/playback/media/
echo playback_os_ident_1.mp4 > $HOME/playback/media/boot.m3u

# Autostart
cat >> $WAYFIRE_FILE << EOF
[autostart]
vlc = cvlc $HOME/playback/media/boot.m3u
EOF

# Set up desktop
mkdir -p $HOME/.config/pcmanfm/LXDE-pi
cp $HOME/playback_repo/assets/desktop-items-0.conf $HOME/.config/pcmanfm/LXDE-pi/

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

# Splash screen
sudo rm /usr/share/plymouth/themes/pix/splash.png
sudo cp $HOME/playback_repo/assets/splash.png /usr/share/plymouth/themes/pix/splash.png
sudo plymouth-set-default-theme --rebuild-initrd pix

# Disable taskbar
sudo sed -i '/^[^#].*wfrespawn wf-panel-pi/ s/^/# /' /etc/wayfire/defaults.ini

# Hide mouse
sudo mv /usr/share/icons/PiXflat/cursors/left_ptr /usr/share/icons/PiXflat/cursors/left_ptr.bak

# Website
cd $HOME/playback_repo/remote
npm install
npm run deploy

cat > ./playback_remote.service << EOM
[Unit]
Description=Playback Web Server

[Service]
ExecStart=/usr/bin/node $HOME/playback/remote/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOM

sudo mv ./playback_remote.service /usr/lib/systemd/playback_remote.service
sudo systemctl enable /usr/lib/systemd/playback_remote.service
sudo systemctl start playback_remote.service

# Enable wifiwatch
if cat /etc/crontab | grep $HOME/playback/remote/wifiwatch.js; then
    echo "Cron job already exists, skipping"
else
		echo "Creating cron job"
    sudo sh -c "echo '*/2 *	* * *	root	/usr/bin/node $HOME/playback/remote/wifiwatch.js > $HOME/playback/remote/wifiwatch.log 2>&1' >> /etc/crontab"
fi

# Initial wifiwatch run
/usr/bin/node $HOME/playback/remote/wifiwatch.js

# Done
sudo reboot

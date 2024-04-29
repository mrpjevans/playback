#!/bin/bash

set -euo pipefail

WAYFIRE_FILE="$HOME/.config/wayfire.ini"

echo "Welcome to the Playback installer"

while true; do	
	read -sp "Set the access password: " password
	echo

	if [[ -z "$password" ]]; then
		echo "The password cannot be empty. Please try again."
	else
		break
	fi

	read -sp "Confirm the access password: " confirmpassword
	echo

	if [ "$input1" == "$input2" ]; then
		echo "The passwords do not match. Please try again."
	else
		break
	fi

done

# Updates & Depedencies
sudo apt -y update && sudo apt -y upgrade
sudo apt -y install git vlc nodejs npm

# Repo checkout
rm -rf $HOME/playback_repo
git clone https://github.com/mrpjevans/playback.git $HOME/playback_repo

# VLC Config
mkdir $HOME/.config/vlc
cp $HOME/playback_repo/assets/vlcrc $HOME/.config/vlc/
sed -i "s/playbackpassword/$password/g" "$HOME/.config/vlc/vlcrc"

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

cat > $HOME/playback/remote/env.json << EOM
{
	vlcPassword: "$password",
	webPassword: "$password",
	hotspotPassword: "$password",
}
EOM

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

# Conductor
cd $HOME/playback_repo/conductor
npm install
npm run deploy

cat > $HOME/playback/remote/env.json << EOM
{
	vlcPassword: "$password",
}
EOM

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
while true; do
		# Prompt the user for a decision; assume 'yes' by default.
		read -r -p "Do you want to reboot the system? [Y/n] " response
		case "$response" in
				[yY][eE][sS]|[yY]|'')  # Yes or default (empty)
						echo "Rebooting now..."
						sudo reboot
						break
						;;
				[nN][oO]|[nN])         # No
						echo "Exiting without reboot."
						exit 0
						;;
				*)                      # Anything else
						echo "Please answer yes or no."
						;;
		esac
done
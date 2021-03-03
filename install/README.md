# Install

1. Prepare SD-Card with Raspberry Pi OS Lite (headless is recommended) using [Raspberry Pi Imager](https://www.raspberrypi.org/software/).
2. Copy the following files to SD-Card:
   - `ssh` to boot/
   - `wpa_supplicant.conf` to boot/
   - `.env`, `install-shc.sh` and `install-certs.sh` to boot/shc
3. Start the Raspberry Pi and give it some time to connect to your WiFi.
4. Connect to Raspberry Pi via SSH, using the default credentials.
5. Run `$ /boot/shc/install-shc.sh` and follow the instructions.
   - If installation starts from beginning after reboot, manually create the temp file by running `sudo mkdir /tmp/shc && sudo touch /tmp/shc/installation-in-progress`
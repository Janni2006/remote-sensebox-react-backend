#!/bin/sh

sudo apt-get update

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
sudo mv bin/arduino-cli /usr/local/bin
sudo rm -r bin

arduino-cli --additional-urls https://raw.githubusercontent.com/sensebox/senseBoxMCU-core/master/package_sensebox_index.json core install arduino:samd
arduino-cli --additional-urls https://raw.githubusercontent.com/sensebox/senseBoxMCU-core/master/package_sensebox_index.json core install sensebox:samd

git clone https://github.com/arduino-libraries/SD /home/pi/.arduino15/packages/sensebox/hardware/samd/1.4.0/libraries/SD

sudo apt-get install nodejs -y

sudo apt-get install npm -y

#!/bin/bash

SHC_INSTALL_FILES_PATH="/boot/shc"

GIT_USER=$(grep GIT_USER $SHC_INSTALL_FILES_PATH/.env | cut -d '=' -f2)
CLEANED_USER=$(echo $GIT_USER | sed -e 's/[\r\n]//g')
GIT_EMAIL=$(grep GIT_EMAIL $SHC_INSTALL_FILES_PATH/.env | cut -d '=' -f2)
CLEANED_EMAIL=$(echo $GIT_EMAIL | sed -e 's/[\r\n]//g')
DOMAIN=$(grep PUBLIC_DOMAIN $SHC_INSTALL_FILES_PATH/.env | cut -d '=' -f2)
CLEANED_DOMAIN=$(echo $DOMAIN | sed -e 's/[\r\n]//g')

change_password () {
  echo "Change password..."
  passwd
  if [[ !($? -eq 0) ]]; then
    echo "ERROR: Changing password did not succeed."
    exit 1
  fi
}

install_docker () {
  if [[ !($(which docker) && $(docker --version)) ]]; then
    echo "No docker installation detected"

    echo "Installing docker..."
    curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker pi

    echo "Done. Reboot (sudo reboot) to apply changes, then run this script again"
    read -p "Do you want to reboot now? (y/N) " rebootNow

    if [[ $rebootNow == [yY] ]]; then
      sudo reboot
    else
      echo "Please remember to reboot before continuing the installation."
      exit 1
    fi
  else
    echo "docker already installed"
  fi
}

install_docker_compose () {
  if [[ !($(which docker-compose) && $(docker-compose --version)) ]]; then
    echo "Installing docker-compose..."
    sudo apt install python3-pip -y
    sudo pip3 install docker-compose
  else
    echo "docker-compose already installed"
  fi
}

install_git () {
  if [[ !($(which git) && $(git --version)) ]]; then
    echo "Installing git..."
    sudo apt install git -y
    git config --global user.email $CLEANED_EMAIL
    git config --global user.name $CLEANED_USER
  else
    echo "git already installed"
  fi
}

install_snapd_certbot () {
  echo "Installing snapd and certbot..."
  sudo apt install snapd -y
  sudo snap install core; sudo snap refresh core
  sudo snap install --classic certbot
  sudo ln -s /snap/bin/certbot /usr/bin/certbot
  sudo certbot certonly -n --standalone -m $CLEANED_EMAIL --agree-tos -d $CLEANED_DOMAIN

  echo "Adding to /etc/hosts..."
  sudo -- sh -c  "echo 104.92.230.170    acme-v01.api.letsencrypt.org >> /etc/hosts"

  echo "Creating renewal hook..."
  sudo cp $SHC_INSTALL_FILES_PATH/install-certs.sh /etc/letsencrypt/renewal-hooks/deploy/install-certs.sh
}

setup_smart_home_conx () {
  echo "Checking out smart-home-conx..."
  cd ~
  git clone https://github.com/pschild/smart-home-conx
  cd smart-home-conx

  echo "Copying env file..."
  sudo cp $SHC_INSTALL_FILES_PATH/.env .env

  echo "Checking SSL setup..."
  sudo cp /etc/letsencrypt/live/$CLEANED_DOMAIN/cert.pem ./ssh
  sudo cp /etc/letsencrypt/live/$CLEANED_DOMAIN/privkey.pem ./ssh
  sudo cp /etc/letsencrypt/live/$CLEANED_DOMAIN/chain.pem ./ssh
  sudo cp /etc/letsencrypt/live/$CLEANED_DOMAIN/fullchain.pem ./ssh
}

build_start_containers () {
  echo "Building containers for PRODUCTION..."
  sudo docker-compose build --build-arg PRODUCTION=true
  echo "Starting containers..."
  sudo docker-compose up -d
}

install () {
  install_docker
  install_docker_compose
  install_git
  install_snapd_certbot

  setup_smart_home_conx
  build_start_containers
}

echo "Welcome to Smart Home ConX setup!"

if [ ! -f /tmp/shc/installation-in-progress ]; then
  echo "Before we start, please execute the following steps:"
  echo "1. Enable port-forwarding for port 80->80 in your router's config"
  read -p "Did you finished all prepartions? (y/N) " preparationsDone

  if [[ $preparationsDone == [yY] ]]; then
    echo "Alright. Let's start the installation..."
    echo "Creating installation file..."
    sudo mkdir /tmp/shc
    sudo touch /tmp/shc/installation-in-progress

    change_password

    echo "Updating system..."
    sudo apt-get update
    sudo apt-get dist-upgrade -y

    install
  else
    echo "ERROR: You need to finish all steps, otherwise SHC cannot be installed!"
    exit 1
  fi
else
  install

  echo "Cleaning up installation files..."
  sudo rm -f /tmp/shc/installation-in-progress
fi
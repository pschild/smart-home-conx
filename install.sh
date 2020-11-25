#!/bin/bash

if [[ !($(which docker) && $(docker --version)) ]];
  then
    echo "No docker installation detected. Running from beginning..."

    echo "Change password..."
    passwd
    if [[ !($? -eq 0) ]];
      then
        echo "ERROR: Changing password did not succeed."
        exit 1

    echo "Updating system..."
    sudo apt-get update
    sudo apt-get dist-upgrade -y

    echo "Installing docker..."
    curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker pi

    echo "Done. Reboot (sudo reboot) to apply changes, then run this script again"

  else
    echo "docker installation detected. Script will now continue..."

    if [[ !($(which docker-compose) && $(docker-compose --version)) ]];
      then
        echo "Installing docker-compose..."
        sudo apt install python3-pip -y
        sudo pip3 install docker-compose
      else
        echo "docker-compose is already installed. Skipping."
    fi

    if [[ !($(which docker-compose) && $(docker-compose --version)) ]];
      then
        echo "Installing git..."
        sudo apt install git -y
        git config --global user.email "philippe.schild@googlemail.com"
        git config --global user.name "pschild"
      else
        echo "git is already installed. Skipping."
    fi

    echo "Checking out smart-home-conx..."
    cd ~
    git clone https://github.com/pschild/smart-home-conx
    cd smart-home-conx
    if [[ ! -f .env ]];
      then
        echo "Preparing env file..."
        echo "Please provide values for your secret env properties:"
        read -p "SERVICE_USER (e.g. me): " serviceUserPrompt
        read -p "SERVICE_PASSWORD (e.g. s3cr3t): " servicePasswordPrompt
        read -p "SERVICE_SECRET (e.g. some-very-secret-string): " serviceSecretPrompt
        read -p "AMAZON_EMAIL (e.g. amazon_account@email.address): " amazonEmailPrompt
        read -p "AMAZON_PASSWORD (e.g. Very_Secret_Amazon_Account_Password): " amazonPasswordPrompt
        read -p "AMAZON_MFA_SECRET (e.g. 1234 5678 9ABC DEFG HIJK LMNO PQRS TUVW XYZ0 1234 5678 9ABC DEFG): " amazonMfaPrompt
        read -p "WIFI_SSID (e.g. My FRITZ!Box 1234): " wifiSsid
        read -p "WIFI_PASS (e.g. topsecret): " wifiPass
        read -p "GITHUB_ACCESS_TOKEN (e.g. yoursupersecretaccesstoken): " githubAccessToken
        touch .env
        echo "SERVICE_USER=${serviceUserPrompt}" >> .env
        echo "SERVICE_PASSWORD=${servicePasswordPrompt}" >> .env
        echo "SERVICE_SECRET=${serviceSecretPrompt}" >> .env
        echo "AMAZON_EMAIL=${amazonEmailPrompt}" >> .env
        echo "AMAZON_PASSWORD=${amazonPasswordPrompt}" >> .env
        echo "AMAZON_MFA_SECRET=${amazonMfaPrompt}" >> .env
        echo "WIFI_SSID=${wifiSsid}" >> .env
        echo "WIFI_PASS=${wifiPass}" >> .env
        echo "GITHUB_ACCESS_TOKEN=${githubAccessToken}" >> .env
      else
        echo ".env file already exists. Skipping."
    fi

    echo "Checking SSL setup..."
    if [[ "$(ls -A ssh | grep -i \\.pem\$)" ]]
      then
        echo "pem files found in ssh/ dir, so SSL seems to be set up."
      else
        echo "Aborting. Manual action for installing SSL certs is necessary! See ./letsencrypt-authenticator/READEME.md"
        exit 1
    fi

    echo "Building containers for PRODUCTION..."
    sudo docker-compose build --build-arg PRODUCTION=true
    echo "Starting containers..."
    sudo docker-compose up -d

fi
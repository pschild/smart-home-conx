#!/bin/bash

if [[ !($(which docker) && $(docker --version)) ]];
  then
    echo "No docker installation detected. Running from beginning..."

    echo "Change password..."
    passwd

    echo "Updating system..."
    sudo apt-get update
    sudo apt-get dist-upgrade -y

    echo "Installing docker..."
    curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker pi

    echo "Done. Reboot (sudo reboot) to apply changes, then run this script again"

  else
    echo "docker installation detected. Script will now continue..."

    echo "Installing docker-compose..."
    sudo apt install python3-pip -y
    sudo pip3 install docker-compose

    echo "Installing git..."
    sudo apt install git -y
    git config --global user.email "philippe.schild@googlemail.com"
    git config --global user.name "pschild"

    echo "Checking out smart-home-conx..."
    cd ~
    git clone https://github.com/pschild/smart-home-conx
    cd smart-home-conx
    echo "Preparing env file..."
    echo "Please provide values for your secret env properties:"
    read -p "PUBLIC_ENDPOINT (e.g. http://my-services-endpoint.com): " publicEndpointPrompt
    read -p "SERVICE_USER (e.g. me): " serviceUserPrompt
    read -p "SERVICE_PASSWORD (e.g. s3cr3t): " servicePasswordPrompt
    read -p "AMAZON_EMAIL (e.g. amazon_account@email.address): " amazonEmailPrompt
    read -p "AMAZON_PASSWORD (e.g. Very_Secret_Amazon_Account_Password): " amazonPasswordPrompt
    read -p "AMAZON_MFA_SECRET (e.g. 1234 5678 9ABC DEFG HIJK LMNO PQRS TUVW XYZ0 1234 5678 9ABC DEFG): " amazonMfaPrompt
    touch .env
    echo "PUBLIC_ENDPOINT=${publicEndpointPrompt}" >> .env
    echo "SERVICE_USER=${serviceUserPrompt}" >> .env
    echo "SERVICE_PASSWORD=${servicePasswordPrompt}" >> .env
    echo "AMAZON_EMAIL=${amazonEmailPrompt}" >> .env
    echo "AMAZON_PASSWORD=${amazonPasswordPrompt}" >> .env
    echo "AMAZON_MFA_SECRET=${amazonMfaPrompt}" >> .env

    echo "Starting services..."
    cd ../docker-infrastructure
    sudo docker-compose up -d

fi
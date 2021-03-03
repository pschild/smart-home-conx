#!/bin/bash
echo "Copying *.pem files to smart-home-conx/ssh..."
find /etc/letsencrypt/live -name "*.pem" -exec cp -L -r --remove-destination '{}' /home/pi/smart-home-conx/ssh/ \;
chown pi /home/pi/smart-home-conx/ssh/*
echo "Done."
echo "Restarting services..."
cd /home/pi/smart-home-conx/ && docker-compose build --build-arg PRODUCTION=true mqtt-client api-gateway && docker-compose up -d
echo "Done."
#!/bin/bash
echo "Copying *.pem files to smart-home-conx/ssl..."
find /etc/letsencrypt/live -name "*.pem" -exec cp -L -r --remove-destination '{}' /home/pi/smart-home-conx/ssl/ \;
chown pi /home/pi/smart-home-conx/ssl/*
echo "Done."
echo "Restarting services..."
cd /home/pi/smart-home-conx/ && docker-compose restart mqtt-client api-gateway
echo "Done."
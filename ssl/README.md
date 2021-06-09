# Setup Certbot

based on https://certbot.eff.org/lets-encrypt/snap-other

## 1. SSH into the server

Connect with Rasperry Pi

## 2. Install snapd

Installing snap on Debian  
`$ sudo apt update`  
`$ sudo apt install snapd`  

## 3. Ensure that your version of snapd is up to date

`$ sudo snap install core; sudo snap refresh core`

## 4. Remove certbot-auto and any Certbot OS packages

`$ sudo apt-get remove certbot`
> Package 'certbot' is not installed, so not removed

Uninstalling certbot-auto  
`$ sudo sed -i '/certbot-auto/d' /etc/crontab`  
`$ sudo rm /usr/local/bin/certbot-auto`  
`$ sudo rm -rf /opt/eff.org`  

Removing checked-out repository (only in my case)  
`$ rm -rf ~/letsencrypt`

## 5. Install Certbot

`$ sudo snap install --classic certbot`

## 6. Prepare the Certbot command

`$ sudo ln -s /snap/bin/certbot /usr/bin/certbot`

## 7. Choose how you'd like to run Certbot

Enable port-forwarding for port 80->80 (and 443->443?) in your router's config.

Yes, my web server is not currently running on this machine  
`$ sudo certbot certonly --standalone`

  > domain name(s) = xyz.myfritz.net
  
  > Congratulations! Your certificate and chain have been saved at:  
  > /etc/letsencrypt/live/xyz.myfritz.net/fullchain.pem  
  > Your key file has been saved at:  
  > /etc/letsencrypt/live/xyz.myfritz.net/privkey.pem  
  > ...

## 8. Install your certificate

`$ cd smart-home-conx`  
`$ cp /etc/letsencrypt/live/xyz.myfritz.net/cert.pem ./ssl`  
`$ cp /etc/letsencrypt/live/xyz.myfritz.net/privkey.pem ./ssl`  
`$ cp /etc/letsencrypt/live/xyz.myfritz.net/chain.pem ./ssl`  
`$ cp /etc/letsencrypt/live/xyz.myfritz.net/fullchain.pem ./ssl`  

## 9. Test automatic renewal

`$ sudo certbot renew --dry-run`

I executed this command a day after initial setup and it resulted in the following error:  
Failed to renew certificate ... with error: ('Connection aborted.', OSError("(104, 'ECONNRESET')"))

Adding the following line to /etc/hosts fixed that:  
> 104.92.230.170    acme-v01.api.letsencrypt.org

After that the command succeeded:

> Processing /etc/letsencrypt/renewal/xyz.myfritz.net.conf
>
> Simulating renewal of an existing certificate for xyz.myfritz.net
>
>
> Congratulations, all simulated renewals succeeded:
>   /etc/letsencrypt/live/xyz.myfritz.net/fullchain.pem (success)

To restart services that depends on the renewed certificates, create a script in /etc/letsencrypt/renewal-hooks/deploy/install-certs.sh:

> #!/bin/bash  
> echo "Copying *.pem files to smart-home-conx/ssl..."  
> find /etc/letsencrypt/live c -exec cp -L -r '{}' /home/pi/smart-home-conx/ssl/ \;  
> chown pi /home/pi/smart-home-conx/ssl/*  
> echo "Done."  
> echo "Restarting mqtt-client..."  
> cd /home/pi/smart-home-conx/ && docker-compose build --build-arg PRODUCTION=true mqtt-client api-gateway && docker-compose up -d  
> echo "Done."  

**ATTENTION**  
Make sure that the script uses LF (not CRLF)! Otherwise an execution leads to the following error:  

> 2021-05-03 04:06:04,653:INFO:certbot.compat.misc:Running deploy-hook command: /etc/letsencrypt/renewal-hooks/deploy/install-certs.sh
> 2021-05-03 04:06:04,669:ERROR:certbot.compat.misc:deploy-hook command "/etc/letsencrypt/renewal-hooks/deploy/install-certs.sh" returned error code 127
> 2021-05-03 04:06:04,672:ERROR:certbot.compat.misc:Error output from deploy-hook command install-certs.sh:
> /bin/sh: 1: /etc/letsencrypt/renewal-hooks/deploy/install-certs.sh: not found

The script should have the correct format, otherwise it can be converted with `$ sudo dos2unix /etc/letsencrypt/renewal-hooks/deploy/install-certs.sh`.

The script can be tested by running the following command:  
`$ sudo certbot renew --force-renewal`

Timer for auto-renew is automatically put to timer list:  
`$ systemctl list-timers`

Check log whether renewal succeeded:  
`$ sudo cat /var/log/letsencrypt/letsencrypt.log`

Check validity of cert:  
`$ sudo openssl x509 -noout -dates -in /etc/letsencrypt/live/xyz.myfritz.net/cert.pem`
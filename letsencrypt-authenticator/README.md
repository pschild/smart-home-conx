$ docker build -t letsencrypt-authenticator .
$ docker run -p 8090:8090 --name letsencrypt-authenticator letsencrypt-authenticator
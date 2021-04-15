# Smart Home ConX

This project was generated using [Nx](https://nx.dev).

[Nx Documentation](https://nx.dev/angular)

## Development

### Setup

1. Copy .env.template to .env and provide necessary credentials and secrets.  

       SERVICE_USER:            username for authentication in api-gateway  
       SERVICE_PASSWORD:        password for authentication in api-gateway  
       SERVICE_SECRET:          secret (any string) used to generate and verify JWTs  
       PUBLIC_DOMAIN:           the public domain the services are available at, e.g. xyz.myfritz.net, used for generating SSL certs  
       GIT_USER:                username for git (needed just for checkout/installation)  
       GIT_EMAIL:               email for git (needed just for checkout/installation)  
       AMAZON_EMAIL:            email address used for Amazon log-in (see README in alexa-connector)  
       AMAZON_PASSWORD:         password used for Amazon log-in (see README in alexa-connector)  
       AMAZON_MFA_SECRET:       MFA used for Amazon log-in (see README in alexa-connector)  
       WIFI_SSID:               SSID of your WiFi passed to firmwares that are built with pio  
       WIFI_PASS:               Password of your WiFi passed to firmwares that are built with pio  
       GITHUB_ACCESS_TOKEN:     Token for accessing GitHub API  
       OPEN_WEATHER_MAP_APP_ID: App ID to retrieve data from OpenWeatherMap API  
       HOME_POSITION_LAT:       Latitude of your home's position  
       HOME_POSITION_LON:       Longitude of your home's position  
       TELEGRAM_API_TOKEN:      Token for accessing Telegram API  
       TELEGRAM_RECEIVER_IDS:   Telegram Chat IDs to send messages to (comma-separated list)  
2. ~~Run `docker-compose up -d` to build and start all services. Run `docker-compose up -d --build <APP>` to run and rebuild a specific service.~~  
   Run

       docker-compose build && docker-compose up -d

   (or `npm run docker:start:all:dev`) to start all containers in **DEV** mode. Connections via SSL are not possible, so only use this for development on your local machine.

   -- OR --

   Run

       docker-compose build --build-arg PRODUCTION=true && docker-compose up -d

   (or `npm run docker:start:all:prod`) to start all containers in **PROD** mode. This includes SSL certificates.

   -- OR --

   Run

       docker-compose build --build-arg PRODUCTION=true service1 service2 ... serviceN && docker-compose up -d

   to start specific containers in **PROD** mode.

   Example:

       docker-compose build --build-arg PRODUCTION=true ota-server mqtt-client && docker-compose up -d

3. During development, you can start a single service by running `npm run start:<SERVICE>` or build it by running `npm run build:<SERVICE>`.

### ncc

[ncc](https://github.com/vercel/ncc) is a "simple CLI for compiling a Node.js module into a single file, together with all its dependencies", so that no extra `node_modules` folder is necessary.  
After building, each app will be ran through ncc and so compressed to a single `index.js`.  
Use `npm run ncc:<APP>` to start ncc.

### Publish docker images to private registry

The Pi in some cases ran out of memory, especially during building the Angular app.  
In order to not letting the Pi doing too much work, the docker images can also be built on a different system, e.g. Windows.  
To make that possible, the following settings need to be set for the Docker Engine in `Docker Desktop` (most important is to add the entry for `insecure-registries`; not quite sure about the `features` setting):  

```
{
  "registry-mirrors": [],
  "insecure-registries": ["192.168.178.28:5000"],
  "debug": true,
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

The registry is hosted on the Pi itself as it is running as a docker service (see docker-compose.yml). Ensure that the registry container is running before trying to pull images from the local registry.  
Run `npm run docker:<name>:publish:prod` to build the according image for armv7 (for Raspberry Pi 3) and push it to the private registry.  
Run `npm run docker:publish:all:prod` to build and push all images.  
You can check which images are located in the private registry by calling `GET http://192.168.178.28:5000/v2/_catalog`.  

To remove an image from the registry execute the following steps ([source repo](https://github.com/burnettk/delete-docker-registry-image)):  
1. `curl https://raw.githubusercontent.com/burnettk/delete-docker-registry-image/master/delete_docker_registry_image.py | sudo tee /usr/local/bin/delete_docker_registry_image >/dev/null` (only once)
2. `sudo chmod a+x /usr/local/bin/delete_docker_registry_image` (only once)
3. `export REGISTRY_DATA_DIR=/mnt/registry/docker/registry/v2 && sudo -E delete_docker_registry_image --image <name>`

To restart a container using the latest image version from the registry, run `$ docker-compose pull && docker-compose up -d` on the Pi.

### Statistics about running containers

Open `http://<ip>:9000` to access the UI of [portainer](https://www.portainer.io/).

### MongoDb

To run a MongoDB instance on Raspberry Pi 3, the following docker image was used: https://github.com/andresvidal/rpi3-mongodb3  

Because of some errors (trouble with lock file after stopping container) a custom Dockerfile based on the original one was created. It can be found in `mongodb/Dockerfile`. The only change that was made is adding `--journal` to the start command CMD.  

### InfluxDb

To run an InfluxDb instance on Raspberry Pi 3, the following docker image was used: https://hub.docker.com/r/arm32v7/influxdb/  

### Helpful commands

Run `nx g @nrwl/{angular,node,express,nest}:{app,lib} foo` to generate an application/lib.

Run `nx g @nrwl/workspace:remove foo` to remove an application/lib.

Run `docker-compose [-f docker-compose.dev.yml] up -d [--build] [<SERVICE>]` to rebuild and start/only start all services/a specific service.

Run `docker-compose pull && docker-compose up -d` on the Pi to restart a container using the latest image version from the registry.

Run `./docker-build.sh --prod --publish --all -r 192.168.178.28:5000` to build all services and push them to the given registry. The script internally runs
  - `docker buildx build [--build-arg PRODUCTION=true] --platform linux/arm/v7 -t 192.168.178.28:5000/<SERVICE>:latest -f ./apps/<SERVICE>/Dockerfile .` to build the given service for armv7 devices like Pi 3.
  - `docker push 192.168.178.28:5000/<SERVICE>:latest` to push the image to registry running on given IP.

Usage:
```

./docker-build.sh [options] [SERVICES...]

Options:
--prod:               Build services in production mode
--publish:            Not only build but also publish built services to registry
--all:                Run given commands for all services
-r, --registry REG:   Specify the docker registry to push built images to
                      (default: localhost:5000)
```

### Most used commands

`docker-compose -f docker-compose.dev.yml up -d --build [<SERVICE>]` on dev machine  
`nx serve <SERVICE>` on dev machine.

`./docker-build.sh --prod --publish --all -r 192.168.178.28:5000 [<SERVICE>]` on dev machine, followed by  
`docker-compose pull && docker-compose up -d [<SERVICE>]` on the Pi.  
`docker image prune -a` can be run in addition to remove unused images.  

## Production

### Install from scratch

Use the script `install/install-shc.sh` to setup everything from scratch (after a fresh installation of Raspbian).  
See [./install/README.md](./install/README.md) for more details. 
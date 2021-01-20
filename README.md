# Smart Home ConX

This project was generated using [Nx](https://nx.dev).

[Nx Documentation](https://nx.dev/angular)

## Development

### Setup

1. Copy .env.template to .env and provide necessary credentials and secrets.  

       SERVICE_USER:      username for authentication in api-gateway  
       SERVICE_PASSWORD:  password for authentication in api-gateway  
       SERVICE_SECRET:    secret (any string) used to generate and verify JWTs  
       AMAZON_EMAIL:      email address used for Amazon log-in (see README in alexa-connector)  
       AMAZON_PASSWORD:   password used for Amazon log-in (see README in alexa-connector)  
       AMAZON_MFA_SECRET: MFA used for Amazon log-in (see README in alexa-connector)  
       WIFI_SSID:         SSID of your WiFi passed to firmwares that are built with pio  
       WIFI_PASS:         Password of your WiFi passed to firmwares that are built with pio  
       GITHUB_ACCESS_TOKEN: tbd  
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

       docker-compose build --build-arg PRODUCTION=true esp-update-server mqtt-client && docker-compose up -d

3. During development, you can start a single service by running `npm run start:<SERVICE>` or build it by running `npm run build:<SERVICE>`.

### ncc

[ncc](https://github.com/vercel/ncc) is a "simple CLI for compiling a Node.js module into a single file, together with all its dependencies", so that no extra `node_modules` folder is necessary.  
After building, each app will be ran through ncc and so compressed to a single `index.js`.  
Use `npm run ncc:<APP>` to start ncc.

### Helpful commands

Run `nx g @nrwl/angular:app my-app` to generate an angular application.
Run `nx g @nrwl/angular:lib my-lib` to generate an angular library.

Run `nx g @nrwl/node:app my-app` to generate a node application.
Run `nx g @nrwl/node:lib my-lib` to generate a node library.

Run `nx g @nrwl/express:app my-app` to generate an express application.

Run `nx g @nrwl/nest:app my-app` to generate a nest application.

## Production

### Install from scratch (Untested yet!)

Use the script `install.sh` to setup everything from scratch (after a fresh installation of Raspbian).  
Call the script and follow the instructions. The script will
  - ensure that you change your password after fresh installation,
  - update your system packages,
  - install docker, docker-compose (+ dependencies), git (+ config),
  - create the necessary folder structure,
  - clone necessary repository,
  - prepare env file
  - and finally run the services (in dev mode, see "Dev and Prod Mode" for more information)
# Smart Home ConX

This project was generated using [Nx](https://nx.dev).

[Nx Documentation](https://nx.dev/angular)

## Development

1. Copy .env.template to .env and provide necessary credentials and secrets.  
2. ~~Run `docker-compose up -d` to build and start all services. Run `docker-compose up -d --build <APP>` to run and rebuild a specific service.~~  
   Run `docker-compose build && docker-compose up -d` (or `npm run docker:start:all:dev`) to start all containers in **DEV** mode. Connections via SSL are not possible, so only use this for development on your local machine.  
   -- OR --  
   Run `docker-compose build --build-arg PRODUCTION=true && docker-compose up -d` (or `npm run docker:start:all:prod`) to start all containers in **PROD** mode. This include SSL certificates.
3. During development, you can start a single service by running `npm run start:<SERVICE>` or build it by running `npm run build:<SERVICE>`.

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
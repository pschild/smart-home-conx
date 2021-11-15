ARG SERVICE_NAME=commuting-watcher

######################################################################
FROM node:14-alpine as build
######################################################################
WORKDIR /app

COPY package.json decorate-angular-cli.js ./
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install
COPY . .

# specific:
ARG PRODUCTION
ARG SERVICE_NAME
RUN if [ "$PRODUCTION" = "true" ]; then npm run build:$SERVICE_NAME -- --prod; else npm run build:$SERVICE_NAME; fi

RUN npm run ncc:$SERVICE_NAME

######################################################################
# Changed from node:14-alpine to node:16 as alpine image does not contain chromium since Oct./Nov. 2021
FROM node:16
######################################################################
WORKDIR /app

COPY .env /app/.env

# specific:
ARG SERVICE_NAME
COPY --from=build /app/dist/apps/$SERVICE_NAME/vendor /app

RUN apt-get update && apt-get install -y chromium tzdata

ENV TZ=Europe/Berlin
CMD ["node", "./index.js"]
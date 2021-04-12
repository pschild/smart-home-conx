ARG SERVICE_NAME=alexa-connector

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
FROM node:14-alpine
######################################################################
WORKDIR /app

COPY .env /app/.env

# specific:
ARG SERVICE_NAME
COPY --from=build /app/dist/apps/$SERVICE_NAME/vendor /app
COPY --from=build /app/dist/apps/$SERVICE_NAME/assets /app/assets

# specific:
RUN chmod +x /app/assets/alexa-remote-control/alexa_remote_control.sh

# specific:
RUN apk update && apk add curl jq oath-toolkit-oathtool tzdata

ENV TZ=Europe/Berlin
CMD ["node", "./index.js"]
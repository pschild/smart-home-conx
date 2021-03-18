ARG SERVICE_NAME=api

######################################################################
FROM node:14-alpine as build
######################################################################
WORKDIR /app

COPY package.json yarn.lock decorate-angular-cli.js ./
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

RUN apk update && apk add tzdata
ENV TZ=Europe/Berlin
CMD ["node", "./index.js"]
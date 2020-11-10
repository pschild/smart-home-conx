######################################################################
FROM node:14-alpine as all-deps
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install

######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY . .
COPY --from=all-deps /app/node_modules /app/node_modules
# specific:
ARG PRODUCTION
RUN if [ "$PRODUCTION" = "true" ]; then npm run build:alexa-connector -- --prod; else npm run build:alexa-connector; fi

######################################################################
FROM node:14-alpine as prod-deps
######################################################################
WORKDIR /app
COPY package.json package-lock.json /app/
# RUN npm install --prod --ignore-scripts
RUN npm ci --production --ignore-scripts && npm cache clean --force

######################################################################
FROM node:14-alpine
######################################################################
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY .env /app/.env
# specific:
COPY --from=builder /app/dist/apps/alexa-connector /app
# specific:
RUN apk update && apk add curl jq oath-toolkit-oathtool tzdata
# specific:
RUN chmod +x /app/assets/alexa-remote-control/alexa_remote_control.sh
ENV TZ=Europe/Berlin
CMD ["node", "./main.js"]

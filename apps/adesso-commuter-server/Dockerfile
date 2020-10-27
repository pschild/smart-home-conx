######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install
COPY . .
RUN npm run build:adesso-commuter-server -- --prod

######################################################################
FROM node:14-alpine as prod-deps
######################################################################
WORKDIR /app
ADD package.json /app/package.json
RUN npm install --prod --ignore-scripts

######################################################################
FROM node:14-alpine
######################################################################
WORKDIR /app
RUN apk update && apk add chromium tzdata
COPY --from=builder /app/dist/apps/adesso-commuter-server /app
COPY --from=prod-deps /app/node_modules /app/node_modules
ADD .env /app/.env
ENV TZ=Europe/Berlin
CMD ["node", "./main.js"]
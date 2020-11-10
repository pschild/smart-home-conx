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
RUN if [ "$PRODUCTION" = "true" ]; then npm run build:esp-update-server -- --prod; else npm run build:esp-update-server; fi

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
COPY --from=builder /app/dist/apps/esp-update-server /app
# specific:
RUN apk update && apk add tzdata
ENV TZ=Europe/Berlin
CMD ["node", "./main.js"]
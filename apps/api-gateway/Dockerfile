######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN npm install
COPY . .
RUN npm run build:api-gateway -- --prod

######################################################################
FROM node:14-alpine
######################################################################
WORKDIR /app
RUN apk update && apk add tzdata
COPY --from=builder /app/dist/apps/api-gateway /app
ADD package.json /app/package.json
ADD .env /app/.env
RUN npm install --prod --ignore-scripts
ENV TZ=Europe/Berlin
CMD ["node", "./main.js"]
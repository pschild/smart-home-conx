######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN npm install
COPY . .
RUN npm run build:alexa-connector -- --prod

######################################################################
FROM node:14-alpine
######################################################################
WORKDIR /app
RUN apk update && apk add tzdata
COPY --from=builder /app/dist/apps/alexa-connector /app
ADD package.json /app/package.json
RUN npm install --prod --ignore-scripts
ENV TZ=Europe/Berlin
CMD ["node", "./main.js"]
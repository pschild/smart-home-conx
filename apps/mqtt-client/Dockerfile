######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install
COPY . .
RUN npm run build:mqtt-client -- --prod

######################################################################
FROM nginx:alpine
######################################################################
COPY apps/mqtt-client/nginx.conf /etc/nginx/nginx.conf
COPY ssh /app/ssh
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/apps/mqtt-client /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

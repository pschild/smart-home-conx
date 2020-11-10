######################################################################
FROM node:14-alpine as builder
######################################################################
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install
COPY . .
# specific:
ARG PRODUCTION
RUN if [ "$PRODUCTION" = "true" ]; then npm run build:mqtt-client -- --prod; else npm run build:mqtt-client; fi

######################################################################
FROM nginx:alpine
######################################################################
# specific:
ARG PRODUCTION
# if PRODUCTION = true set NGINXENV to prod
ENV NGINXENV=${PRODUCTION:+prod}
# if !PRODUCTION set NGINXENV to dev
ENV NGINXENV=${NGINXENV:-dev}

COPY apps/mqtt-client/nginx.$NGINXENV.conf /etc/nginx/nginx.conf
COPY ssh /app/ssh
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/apps/mqtt-client /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

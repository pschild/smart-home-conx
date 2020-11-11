ARG SERVICE_NAME=mqtt-client

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

######################################################################
FROM nginx:alpine
######################################################################
# specific:
ARG PRODUCTION
# if PRODUCTION = true set NGINXENV to prod
ENV NGINXENV=${PRODUCTION:+prod}
# if !PRODUCTION set NGINXENV to dev
ENV NGINXENV=${NGINXENV:-dev}

# specific:
COPY apps/mqtt-client/nginx.$NGINXENV.conf /etc/nginx/nginx.conf
COPY ssh /app/ssh
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/apps/mqtt-client /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
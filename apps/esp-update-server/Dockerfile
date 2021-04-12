ARG SERVICE_NAME=esp-update-server

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
# We cannot use Alpine image here because it's missing some dependencies, needed for pio to work
# We need to use buster version as python > 3.6 is needed by pio!
FROM node:14.16.0-buster
######################################################################
WORKDIR /app

# set ENV variables to make Python3 work properly
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

# Python3.x
# RUN apk update && apk add tzdata py3-pip git curl
# RUN curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py -o get-platformio.py
# RUN python3 get-platformio.py

# Python2.7
# RUN apk update && apk add tzdata py-pip git curl
# RUN curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py -o get-platformio.py
# RUN python get-platformio.py

RUN apt-get update && apt-get install -y tzdata python3-pip git curl

# https://docs.platformio.org/en/latest/core/installation.html#super-quick-mac-linux
RUN curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py -o get-platformio.py
RUN python3 get-platformio.py
RUN rm get-platformio.py

# https://docs.platformio.org/en/latest/core/installation.html#install-shell-commands
RUN ln -s ~/.platformio/penv/bin/platformio /usr/local/bin/platformio \
    && ln -s ~/.platformio/penv/bin/pio /usr/local/bin/pio \
    && ln -s ~/.platformio/penv/bin/piodebuggdb /usr/local/bin/piodebuggdb

RUN cd .. && mkdir esp-projects && mkdir esp-binaries

COPY .env /app/.env

# specific:
ARG SERVICE_NAME
COPY --from=build /app/dist/apps/$SERVICE_NAME/vendor /app

ENV TZ=Europe/Berlin
CMD ["node", "./index.js"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]
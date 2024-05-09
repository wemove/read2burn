####################
# Build application

FROM node:lts-alpine AS builder

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

# Run a command inside the image
# If you are building your code for production
# RUN npm ci --only=production
# else 
# RUN npm install
RUN apk update \
  && apk upgrade \
  && apk add --no-cache tzdata \
  && apk add git \
  && git clone --single-branch --depth 1 https://github.com/wemove/read2burn.git ${READ2BURN_HOME} \
  && npm ci --only=production \
  && rm -rf ${READ2BURN_HOME}/docker

####################
# Create image

FROM node:lts-alpine

# Your contact info
MAINTAINER J Mueller <joachim.mueller@wemove.com>

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

COPY --from=builder ${READ2BURN_HOME} .

EXPOSE 3300

VOLUME ["${READ2BURN_HOME}/data"]

CMD ["node", "app.js"]

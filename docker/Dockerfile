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
# hadolint ignore=DL3018
RUN apk add --no-cache tzdata
# hadolint ignore=DL3018
RUN apk add --no-cache git
RUN git clone --single-branch --depth 1 https://github.com/danstis/read2burn.git ${READ2BURN_HOME}
RUN npm ci --only=production
RUN rm -rf ${READ2BURN_HOME}/docker

####################
# Create image

FROM node:lts-alpine

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

COPY --from=builder ${READ2BURN_HOME} .

EXPOSE 3300

VOLUME ["${READ2BURN_HOME}/data"]

CMD ["node", "app.js"]

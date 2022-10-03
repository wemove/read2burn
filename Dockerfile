####################
# Bump version
FROM node:lts-alpine AS version

ARG BUILD=0.0.0-development

WORKDIR /tmp

# hadolint ignore=DL3018
COPY ./package* /tmp
RUN npm install
# hadolint ignore=DL3059
RUN	npm version ${BUILD} --allow-same-version &&\
	npx genversion version.js

####################
# Build application
FROM node:lts-alpine AS builder

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata
COPY ./package* ${READ2BURN_HOME}
RUN npm ci --only=production
COPY ./ ${READ2BURN_HOME}
COPY --from=version /tmp/version.js ${READ2BURN_HOME}
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

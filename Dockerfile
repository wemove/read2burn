####################
# Build application

FROM node:lts-alpine AS builder

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata
COPY . ${READ2BURN_HOME}
RUN npm ci --only=production \
	rm -rf ${READ2BURN_HOME}/docker

####################
# Create image

FROM node:lts-alpine

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

COPY --from=builder ${READ2BURN_HOME} .

EXPOSE 3300

VOLUME ["${READ2BURN_HOME}/data"]

CMD ["node", "app.js"]

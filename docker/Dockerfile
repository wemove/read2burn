####################
# Build application

FROM node:lts-alpine AS builder

ENV READ2BURN_HOME="/app"

WORKDIR ${READ2BURN_HOME}

COPY . .

# Run a command inside the image
# If you are building your code for production
# RUN npm ci --only=production
# else 
# RUN npm install
RUN apk update \
  && apk upgrade \
  && apk add --no-cache tzdata \
  && npm ci --only=production \
  && rm -rf ${READ2BURN_HOME}/docker

####################
# Create image

FROM node:lts-alpine

ENV READ2BURN_HOME="/app"
ENV READ2BURN_MAX_SECRET_CHARS=4000
ENV READ2BURN_PUBLIC_URL=""

WORKDIR ${READ2BURN_HOME}

RUN mkdir -p "${READ2BURN_HOME}/data" \
  && chown -R node:node "${READ2BURN_HOME}"

COPY --from=builder --chown=node:node ${READ2BURN_HOME} .

USER node

EXPOSE 3300

VOLUME ["${READ2BURN_HOME}/data"]

CMD ["node", "app.js"]

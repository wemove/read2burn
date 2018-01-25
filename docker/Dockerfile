# The source image to start with
FROM cusspvz/node

# Your contact info
MAINTAINER J Mueller <joachim.mueller@wemove.com>

ENV READ2BURN_HOME="/app"
    
# Run a command inside the image
RUN apk update \
  && apk upgrade \
  && apk add git \
  && git clone https://github.com/joachimmueller/read2burn.git ${READ2BURN_HOME} \
  && npm install

EXPOSE 3300

VOLUME ["${READ2BURN_HOME}/data"]
WORKDIR ${READ2BURN_HOME}

ENTRYPOINT [ "/bin/entrypoint" ]

CMD ["start"]

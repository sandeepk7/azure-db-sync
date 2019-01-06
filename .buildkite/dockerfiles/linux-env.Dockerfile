FROM node:10.12

# Bazel Ubuntu pre-requisites.
# https://docs.bazel.build/versions/master/install-ubuntu.html
RUN apt-get update;
RUN apt-get -y install pkg-config zip g++ zlib1g-dev unzip python

# Chrome prerequisites.
# Based on https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
RUN apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb


# Work back from https://github.com/CircleCI-Public/circleci-dockerfiles/blob/master/node/images/10.12.0-jessie/Dockerfile to get Chrome working properly

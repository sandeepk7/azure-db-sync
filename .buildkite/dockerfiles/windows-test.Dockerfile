# Use the a previous image as source, or bootstrap to the default image.
ARG target=filipesilva/node-bazel-windows:0.0.2
FROM $target
WORKDIR /src

# Copy package.json and yarn.lock before the other files.
# This allows docker to cache these steps even if source files change.
COPY ./package.json /src/package.json
COPY ./yarn.lock /src/yarn.lock
RUN yarn install --frozen-lockfile --non-interactive --network-timeout 100000

# Copy files.
COPY ./ /src

# Setup.
COPY .circleci/bazel.rc /etc/bazel.bazelrc
RUN del packages\upgrade\static\src
RUN mklink /d packages\upgrade\static\src ..\src

# Run tests.
RUN yarn bazel test //tools/ts-api-guardian:all --noshow_progress

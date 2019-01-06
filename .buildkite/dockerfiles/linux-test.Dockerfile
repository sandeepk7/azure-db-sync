FROM gcr.io/internal-200822/angular-linux:latest
USER root

# TODO: Delete the above once the bootstrap image is available.

WORKDIR /src

# Copy package.json and yarn.lock before the other files.
# This allows docker to cache these steps even if source files change.
COPY ./package.json /src/package.json
COPY ./yarn.lock /src/yarn.lock
COPY ./tools/yarn/check-yarn.js /src/tools/yarn/check-yarn.js
COPY ./tools/postinstall-patches.js /src/tools/postinstall-patches.js
RUN yarn install --frozen-lockfile --non-interactive --network-timeout 100000

# Setup files.
COPY ./ /src
COPY .circleci/bazel.rc /etc/bazel.bazelrc

# Workaround symlink when building image on Windows.
RUN rm /src/packages/upgrade/static/src
RUN ln -s ../src /src/packages/upgrade/static/src

# Run tests.
RUN yarn bazel test //tools/ts-api-guardian:all --noshow_progress
# RUN yarn bazel build //... --build_tag_filters=-ivy-only --test_tag_filters=-ivy-only,-local
# RUN yarn bazel build --define=compile=aot --build_tag_filters=-no-ivy-aot,-fixme-ivy-aot --test_tag_filters=-no-ivy-aot,-fixme-ivy-aot //...
# RUN yarn bazel test //... --build_tag_filters=-ivy-only --test_tag_filters=-ivy-only,-local
# RUN yarn test-ivy-aot //...

# docker build -t angular:latest .
# docker build  . --build-arg target=angular:latest

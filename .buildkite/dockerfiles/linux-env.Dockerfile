ARG target=node:10.12
FROM $target
# Redeclare target ARG after FROM to inherit use value from the first ARG.
# https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG target

# Install Bazel Ubuntu pre-requisites if it's the default target.
# Subsequent targets will already have it installed.
# https://docs.bazel.build/versions/master/install-ubuntu.html
RUN if [ "$target" = "node:10.12" ] ; then apt-get update; apt-get -y install pkg-config zip g++ zlib1g-dev unzip python ; fi
# Chrome prerequisites
RUN if [ "$target" = "node:10.12" ] ; then apt-get -y install libx11-xcb1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 libnss3 libxss1 ; fi

# Setup files.
WORKDIR /src
COPY ./ /src
COPY .circleci/bazel.rc /etc/bazel.bazelrc

# Workaround symlink when building image on Windows.
RUN rm /src/packages/upgrade/static/src
RUN ln -s ../src /src/packages/upgrade/static/src

# Install dependencies and run tests.
RUN yarn install --frozen-lockfile --non-interactive
# RUN yarn bazel test //tools/ts-api-guardian:all
RUN yarn bazel build //... --build_tag_filters=-ivy-only --test_tag_filters=-ivy-only,-local
# RUN yarn bazel build --define=compile=aot --build_tag_filters=-no-ivy-aot,-fixme-ivy-aot --test_tag_filters=-no-ivy-aot,-fixme-ivy-aot //...
# RUN yarn bazel test //... --build_tag_filters=-ivy-only --test_tag_filters=-ivy-only,-local
# RUN yarn test-ivy-aot //...

# docker build -t angular:latest .
# docker build  . --build-arg target=angular:latest

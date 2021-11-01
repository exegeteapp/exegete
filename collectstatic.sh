#!/bin/bash

# collect together the static assets from the frontend, ready
# to be copied into the static container

set -e
set -x

rm -rf static/build/

(
    cd frontend
    rm -rf build/
    yarn install
    yarn build
    rsync -av build/ ../static/build/
    rm -rf build/
)

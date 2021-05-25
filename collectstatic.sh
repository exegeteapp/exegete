#!/bin/bash

# collect together the static assets from the frontend and the backend, ready
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

(
    cd exegete
    rm -rf django-static/
    poetry install
    poetry run python manage.py collectstatic --no-input
    rsync -av django-static/ ../static/build/django-static/
    rm -rf django-static/
)


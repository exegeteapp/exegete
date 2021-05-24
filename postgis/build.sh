#!/bin/bash

set -e

docker build --pull -t ealgis/postgis .
docker push ealgis/postgis

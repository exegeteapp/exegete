#!/bin/bash

bp="$1"
if [ -z "$bp" ]; then
  bp="/data/exegete-data"
fi

ingest() {
  mod="$1"
  arg="$2"
  echo "importing: $mod"
  time python -m exegete.text.ingest."$mod" "$arg"
}

ingest netbible "$bp"/NET-bible/json/
ingest sblgnt "$bp"/SBLGNT/
ingest njps "$bp"/NJPS/

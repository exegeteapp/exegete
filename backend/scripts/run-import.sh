#!/bin/bash

ingest() {
  mod="$1"
  arg="$2"
  echo "importing: $mod"
  time python -m exegete.text.ingest."$mod" "$arg"
}

ingest netbible /data/exegete-data/NET-bible/json/
ingest sblgnt /data/exegete-data/SBLGNT/
ingest njps /data/exegete-data/NJPS/

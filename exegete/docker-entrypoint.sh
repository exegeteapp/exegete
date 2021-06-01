#!/bin/bash

function postgres_ready(){
python << END
import sys
import psycopg2
from os import getenv
try:
    conn = psycopg2.connect(dbname=getenv("DB_NAME"), user=getenv("DB_USERNAME"), password=getenv("DB_PASSWORD"), host=getenv("DB_HOST"))
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

waitfordb()
{
  until postgres_ready; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done

  >&2 echo "Postgres is up - continuing..."

  sleep 2
}

CMD="$1"
echo "command is: " $CMD
if [ "$CMD" = "uvicorn" ]; then
   waitfordb
   python manage.py migrate
   python manage.py check --deploy
   uvicorn exegete.asgi:application --host 0.0.0.0 --port 8000 --reload
   exit
fi
if [ "$CMD" = "test" ]; then
   python manage.py test
   exit
fi

exec "$@"


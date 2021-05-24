#!/bin/sh

function postgres_ready(){
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME", user="$DB_USERNAME", password="$DB_PASSWORD", host="$DB_HOST")
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
if [ "$CMD" = "runserver" ]; then
   waitfordb
   python manage.py migrate
   python manage.py check
   python manage.py runserver 0.0.0.0:8000
   exit
fi
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


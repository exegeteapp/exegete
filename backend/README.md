## running data ingests

```bash
python3 -m exegete.text.ingest.sblgnt /data/exegete-data/SBLGNT/
python3 -m exegete.text.ingest.netbible /data/exegete-data/NET-bible/json/
python3 -m exegete.text.ingest.njps /data/exegete-data/NJPS/
```

## creating and running database migrations

```bash
alembic revision --autogenerate
alembic upgrade head
```

# exegete.app: an open source environment for Biblical Studies

Under active development.

See our [about page](https://exegete.app/about) for more information.

## Importing biblical data

1. clone https://github.com/exegeteapp/exegete-data in `data/`

2. run up the `docker-compose` environment.

3. Import the NET Bible and the SBL-GNT

```bash
docker compose exec backend bash
python -m exegete.text.ingest.netbible /data/exegete-data/NET-bible/json/
python -m exegete.text.ingest.sblgnt /data/exegete-data/SBLGNT/
```


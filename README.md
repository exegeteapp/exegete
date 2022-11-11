# exegete.app: an open source environment for Biblical Studies

Under active development.

See our [about page](https://exegete.app/about) for more information.

## Importing biblical data

1. clone https://github.com/exegeteapp/exegete-data in `data/`

2. run up the `docker-compose` environment.

3. Import the basic Biblical texts.

```bash
docker-compose exec backend bash
./scripts/run-import.sh
```


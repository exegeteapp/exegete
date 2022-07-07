# utility functions for interacting with exegete from the command line

import code
import sqlalchemy
from exegete.settings import settings
import readline
import rlcompleter  # noqa


def main():
    readline.parse_and_bind("tab: complete")
    vars = {
        "sqlalchemy": sqlalchemy,
        "engine": settings.create_engine(echo=True),
    }
    code.interact(local=vars)


if __name__ == "__main__":
    main()

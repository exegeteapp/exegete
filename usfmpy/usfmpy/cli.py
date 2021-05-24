import pkg_resources
import argparse
from .usfm import Stylesheet, Document


def cli():
    parser = argparse.ArgumentParser()
    parser.add_argument("files", help="USFM file to parse", nargs="+")
    args = parser.parse_args()
    sty = Stylesheet(pkg_resources.resource_filename(__name__, "data/usfm.sty"))
    for file in args.files:
        doc = Document(sty, file)
        print(doc)

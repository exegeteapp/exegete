from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Ingests the NET Bible(R) into an exegete package"

    def add_arguments(self, parser):
        parser.add_argument("path")

    def handle(self, *args, **options):
        path = options["path"]

import json
import os
import jsonschema


class WorkspaceManager:
    def __init__(self):
        self._object_schema = self._load_object_schema()
        pass

    def _load_object_schema(self):
        schema_file = os.path.join(os.path.dirname(__file__), "v1_workspace.json")
        with open(schema_file) as fd:
            return json.load(fd)

    def validate(self, obj):
        return jsonschema.validate(obj, self._object_schema)

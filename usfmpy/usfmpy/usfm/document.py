from .tokenizer import tokenize
from collections import namedtuple


class DocumentState:
    def __init__(self, parent, cls, **attrs):
        self._cls = cls
        self._parent = parent
        self._attrs = attrs

    def flatten(self):
        state = {}
        if self._parent:
            state.update(self._parent.flatten())
        state.update(self._attrs)
        return state


class Document:
    def __init__(self, stylesheet, path):
        self._stylesheet = stylesheet
        self._path = path
        self._document = self._parse()

    def _parse(self):
        root = DocumentState(None, "root")
        state = [root]
        text_buffer = []

        with open(self._path) as fd:
            text = fd.read()

        for (typ, val) in tokenize(text):
            if typ != "marker":
                text_buffer.append((typ, val))
                continue

            style = self._stylesheet[val.lower()]

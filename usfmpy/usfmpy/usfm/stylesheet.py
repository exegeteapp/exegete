from .tokenizer import tokenize


class Stylesheet:
    def __init__(self, path):
        self._path = path
        self._markers = self._parse()

    def __iter__(self):
        return iter(self._markers)

    def __getitem__(self, *args, **kwargs):
        return self._markers.__getitem__(*args, **kwargs)

    def _parse(self):
        def normalise_noop(v):
            return v

        def normalise_flag(v):
            return True

        def normalise_name(v):
            return [t.strip() for t in v.split("-")]

        def normalise_int(v):
            return int(v)

        def normalise_float(v):
            return float(v)

        def normalise_words(v):
            return [t.strip() for t in v.split()]

        normalisers = {
            "name": normalise_name,
            "description": normalise_noop,
            "styletype": normalise_noop,
            "texttype": normalise_noop,
            "fontsize": normalise_int,
            "rank": normalise_int,
            "textproperties": normalise_words,
            "occursunder": normalise_words,
            "attributes": normalise_words,
            "italic": normalise_flag,
            "bold": normalise_flag,
            "underline": normalise_flag,
            "smallcaps": normalise_flag,
            "superscript": normalise_flag,
            "color": normalise_int,
            "colorname": normalise_noop,
            "justification": normalise_noop,
            "spacebefore": normalise_int,
            "spaceafter": normalise_int,
            "leftmargin": normalise_float,
            "rightmargin": normalise_float,
            "firstlineindent": normalise_float,
            "endmarker": normalise_noop,
        }

        # there are comments in stylesheets, we strip those out so we
        # can use the shared tokeniser
        with open(self._path) as fd:
            lines = [t.split("#", 1)[0] for t in fd]
            text = "\n".join(lines)

        # each stanza starts with a \Marker which gives us the marker name
        # following that we get a bunch of attributes, not all of which have
        # an explicit value

        # step 1: match up markers and their attributes
        def resolve_markers():
            tokens = list(tokenize(text))
            markers = []
            current_marker = None
            upto = 0

            def save_marker():
                if current_marker is None:
                    return
                val = "".join(t[1] for t in tokens[upto:idx])
                if "\n" in val:
                    val = val[: val.find("\n")]
                markers.append((current_marker, val))

            for idx, (typ, val) in enumerate(tokens):
                if typ != "marker":
                    continue
                save_marker()
                name = val.lower()
                current_marker = name
                upto = idx + 1
            return markers

        # step 2: build this up into a description of markers
        def build_description(markers):
            objs = {}
            current_obj = None

            for name, val in markers:
                if name == "marker":
                    objs[val] = current_obj = {"marker": val}
                else:
                    # flag fields
                    if val == "":
                        val = True
                    current_obj[name] = normalisers[name](val)

            return objs

        return build_description(resolve_markers())

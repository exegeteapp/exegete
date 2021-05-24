import string


class USFMLexerException(Exception):
    def __init__(self, line, col, mesg):
        super().__init__("line {}, col {}: {}".format(line + 1, col + 1, mesg))


def _tokenize(data: str):
    WHITESPACE = set("\n\t ")
    MARKER_CHARS = set("".join(string.ascii_letters + string.digits) + "+" + "*")
    buffer = []
    state = {}

    def reset():
        state["in_marker"] = state["in_whitespace"] = False

    def set_backslash():
        assert not state["in_whitespace"]
        state["in_marker"] = True

    def set_whitespace():
        assert not state["in_marker"]
        state["in_whitespace"] = True

    def outbuffer():
        s = "".join(buffer)
        buffer.clear()
        if state["in_marker"]:
            tok = "marker"
        elif state["in_whitespace"]:
            tok = "whitespace"
        else:
            tok = "text"
        reset()
        if not s:
            return None
        yield from ((tok, t) for t in s.splitlines(True))

    # normalise '\r\n' newlines to '\n'
    data = data.replace("\r\n", "\n")
    # normalise '\r' newlines to '\n'
    data = data.replace("\r", "\n")

    reset()
    for s in data:
        if s == "\\":
            yield from outbuffer()
            set_backslash()
            continue

        if s in WHITESPACE:
            if state["in_whitespace"]:
                buffer.append(s)
            else:
                was_in_marker = state["in_marker"]
                yield from outbuffer()
                set_whitespace()
                # whichever whitespace character ends a marker is not significant
                if not was_in_marker:
                    buffer.append(s)
            continue

        if state["in_marker"] and s not in MARKER_CHARS:
            yield from outbuffer()
            buffer.append(s)
            continue

        if state["in_whitespace"]:
            yield from outbuffer()
        buffer.append(s)

    yield from outbuffer()


def tokenize(data: str):
    """
    lex a unicode string into:
      - USFM markers
      - whitespace
      - text

    returns an iterator of (token_type, value) tuples.
    no value will contain more than one newline

    can also be used for parsing Paratext STY files.
    https://ubsicap.github.io/usfm/about/syntax.html
    """
    yield from (t for t in _tokenize(data) if t)

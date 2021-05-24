from .tokenizer import tokenize


def test_emptydoc():
    tokens = list(tokenize(""))
    assert len(tokens) == 0


def test_standalone_token():
    tokens = list(tokenize("\\hello"))
    assert tokens == [("marker", "hello")]


def test_token_token():
    tokens = list(tokenize("\\hello \\world"))
    assert tokens == [("marker", "hello"), ("marker", "world")]


def test_token_ws_token():
    tokens = list(tokenize("\\hello  \\world"))
    assert tokens == [("marker", "hello"), ("whitespace", " "), ("marker", "world")]


def test_token_runon():
    tokens = list(tokenize("\\hello\\world"))
    assert tokens == [("marker", "hello"), ("marker", "world")]


def test_token_text():
    tokens = list(tokenize("\\hello my name is grahame"))
    assert tokens == [
        ("marker", "hello"),
        ("text", "my"),
        ("whitespace", " "),
        ("text", "name"),
        ("whitespace", " "),
        ("text", "is"),
        ("whitespace", " "),
        ("text", "grahame"),
    ]


def test_token_comma_token():
    tokens = list(tokenize("\\hello,\\world"))
    assert tokens == [
        ("marker", "hello"),
        ("text", ","),
        ("marker", "world"),
    ]


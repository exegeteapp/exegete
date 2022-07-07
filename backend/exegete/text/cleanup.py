import re
import string
from nltk.stem import SnowballStemmer

whitespace_re = re.compile(r"^\s*$")


def introduce_spaces(s):
    pad = ["—"]
    for c in pad:
        s = s.replace(c, c + " ")
    # we might have duplicated some spaces, so remove them
    while True:
        s_s = s.replace("  ", " ")
        if s_s == s:
            break
        s = s_s
    return s


def clean_words(fragments_iter, stem=False):
    # NOTE: exegete in its frontend stores annotation against (chapter, verse, word offset) targets.
    # if this function is changed and those offsets are affected, annotations in the frontend will break.
    # Update only with caution.

    # Our goal here is to turn the annotated words coming out of our ingest code into a list of
    # single words with attributes rolled up, and punctuation annealed into them. Then when the
    # frontend is annotating words, it doesn't have to worry about any tricky details, such as a fragment
    # sharing one strong's number comprising more than one English word.

    # We also apply stemming here, as this is the place where we have the best picture of what our
    # words actually are.

    words = []
    buf = []

    def buf_to_word(buf):
        if len(buf) == 0:
            return {"value": ""}
        # take the attributes from the first character
        a = buf[0][0]
        return {**a, "value": "".join(t[1] for t in buf)}

    def scan_word(buf):
        for idx, (_, c) in enumerate(buf):
            if c.isspace():
                return buf[idx + 1 :], buf_to_word(buf[:idx])
        return buf, None

    for fragment in fragments_iter:
        # we emit a new word when we hit whitespace
        attrs = fragment.copy()
        value = attrs.pop("value")
        buf += [(attrs, t) for t in value]

        while True:
            buf, next_word = scan_word(buf)
            if next_word is not None:
                if next_word["value"]:
                    words.append(next_word)
            else:
                break

    if len(buf) > 0:
        words.append(buf_to_word(buf))

    if stem:
        stemmer = SnowballStemmer("english")
        trans = str.maketrans("", "", string.punctuation + "‘’“”\"'—,…")
        for word in words:
            word["s-snowball"] = stemmer.stem(word["value"].translate(trans))

    return words

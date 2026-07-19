#!/usr/bin/env python3
"""Controlli minimi pre-push per unitizy.com: parse HTML, asset referenziati, stringhe vietate."""
import re, sys, pathlib
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "brand.html", "social.html", "privacy.html"]
FORBIDDEN = [
    ("fonts.googleapis", "richiesta a Google Fonts: i font sono self-hostati"),
    ("unpkg.com", "dipendenza CDN esterna: le librerie sono self-hostate"),
    ("userSpaace", "typo noto in gradientUnits"),
]
REQUIRED_IN_INDEX = ["M61903504J", "og:image", "u-glyph", "privacy.html"]

class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("src", "href") and v and not v.startswith(("http", "#", "mailto:", "data:", "//")):
                self.refs.append(v.split("#")[0].split("?")[0])

errors = []
for page in PAGES:
    p = ROOT / page
    if not p.exists():
        errors.append(f"{page}: file mancante"); continue
    text = p.read_text(encoding="utf-8", errors="replace")
    c = Checker()
    try:
        c.feed(text); c.close()
    except Exception as e:
        errors.append(f"{page}: HTML non parsabile — {e}")
    for ref in c.refs:
        if ref and not (ROOT / ref).exists():
            errors.append(f"{page}: riferimento a file inesistente — {ref}")
    for needle, why in FORBIDDEN:
        if needle in text:
            errors.append(f"{page}: stringa vietata '{needle}' ({why})")

index = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")
for needle in REQUIRED_IN_INDEX:
    if needle not in index:
        errors.append(f"index.html: manca '{needle}'")

if errors:
    print("CHECK FALLITO:")
    for e in errors: print("  -", e)
    sys.exit(1)
print(f"check ok — {len(PAGES)} pagine, riferimenti e vincoli verificati")

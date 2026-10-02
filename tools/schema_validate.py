#!/usr/bin/env python3
"""Send a page's HTML to https://validator.schema.org/ and print what it parsed.

    tools/schema_validate.py [index.html]

Prints every node, its properties and their errors as the validator saw them,
and exits 1 on any error or warning. Sends the file as it is in the repo, so
it checks a change before it is pushed (the page is public once pushed anyway).
"""
import json, sys, urllib.parse, urllib.request

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
body = urllib.parse.urlencode({"html": open(path, encoding="utf-8").read()}).encode()
raw = urllib.request.urlopen("https://validator.schema.org/validate", body, timeout=60).read().decode()
d = json.loads(raw[raw.index("{"):])  # the reply starts with )]}'

def walk(n, ind=0):
    print(" " * ind + n["typeGroup"], (n.get("idProperty") or {}).get("value") or "",
          f"errors={n['numErrors']} warnings={n['numWarnings']}")
    for p in n["properties"]:
        print(" " * ind + "  " + p["pred"], "=", str(p["value"])[:70], p["errors"] or "")
    for x in n["nodeProperties"]:
        print(" " * ind + "  " + x["pred"], "->", x["errors"] or "")
        walk(x["target"], ind + 4)

for g in d.get("tripleGroups", []):
    for n in g["nodes"]:
        walk(n)
print(f"{path}: {d['numObjects']} object(s), {d['totalNumErrors']} error(s), {d['totalNumWarnings']} warning(s)")
sys.exit(1 if d["totalNumErrors"] or d["totalNumWarnings"] or not d["numObjects"] else 0)

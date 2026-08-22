#!/usr/bin/env python3
"""Inflate a captured layout payload into server/data/layouts/<templateId>.json.

Usage: ingest-b64.py <templateId> <base64-file>
The payload is deflate-compressed JSON produced by tools/capture-layout.js.
"""
import base64, json, sys, zlib, pathlib

template_id, src = sys.argv[1], sys.argv[2]
raw = zlib.decompress(base64.b64decode(pathlib.Path(src).read_text().strip()))
payload = json.loads(raw)
out = pathlib.Path(__file__).resolve().parent.parent / "data" / "layouts" / f"{template_id}.json"
out.write_text(json.dumps(payload, indent=1))
screens = payload.get("screens", [])
elements = sum(len(g) for s in screens for g in s["groups"])
print(f"{template_id}: {len(screens)} screens, {elements} elements -> {out.name}")

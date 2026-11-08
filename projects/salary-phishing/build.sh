#!/bin/bash
# Concatenates the shared helper lib into each scene file.
cd "$(dirname "$0")"
for f in scenes_src/*.js; do b=$(basename "$f"); [ "$b" = _lib.js ] && continue; cat scenes_src/_lib.js "$f" > "scenes/$b"; done

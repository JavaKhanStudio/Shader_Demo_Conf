#!/usr/bin/env bash
# Follows README.md on a scratch copy: runs its "Run it locally" command, checks it serves
# index.html, then adds a shader by the "Add a shader" steps and checks galleryAI.html shows it.
# Usage: tools/readme-probe.sh   (needs python3, curl, google-chrome)
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
scratch=$(mktemp -d)
trap 'kill $server 2>/dev/null || true; rm -rf "$scratch"' EXIT
git -C "$root" archive HEAD | tar -x -C "$scratch"
cp "$root/README.md" "$scratch/README.md"

# The run command, taken from the README's sh block as written.
cmd=$(awk '/^```sh$/{f=1;next} /^```$/{f=0} f' "$scratch/README.md" | head -1)
port=$(sed -n 's/.*http\.server \([0-9]*\).*/\1/p' <<<"$cmd")
echo "run: $cmd"
(cd "$scratch" && exec $cmd >/dev/null 2>&1) & server=$!
for _ in $(seq 50); do curl -sf "http://localhost:$port/" >/dev/null && break; sleep 0.1; done
curl -sf "http://localhost:$port/" | grep -q '<title>Shader Shop</title>' \
  && echo "PASS index.html served on :$port" || { echo "FAIL index.html"; exit 1; }

# Add a shader: 1. copy a file of the same folder, 2. import it in the list.
d="$scratch/js/aiMadeShaderMaterials"
sed "s/name: 'AuroraDream'/name: 'ReadmeProbeShader'/" "$d/GPT_2025.js" > "$d/ReadmeProbe.js"
sed -i '1i import READMEPROBE from "./ReadmeProbe.js";' "$d/ZShadersList.js"
sed -i 's/export const shaders = \[/&\n    READMEPROBE,/' "$d/ZShadersList.js"
# 3. open the page.
dom=$(google-chrome --headless=new --disable-gpu --enable-unsafe-swiftshader \
  --virtual-time-budget=5000 --dump-dom "http://localhost:$port/galleryAI.html" 2>/dev/null)
grep -q 'ReadmeProbeShader' <<<"$dom" \
  && echo "PASS galleryAI.html shows the added shader" || { echo "FAIL added shader not shown"; exit 1; }

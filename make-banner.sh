#!/usr/bin/env bash
# Rebuilds assets/share-banner.jpg (1200x630) from assets/poster.jpeg.
#
# Run this after swapping poster.jpeg. LinkedIn and Facebook crop link previews
# to 1.91:1 on their own servers and no meta tag can tell them where your face
# is, so the framing has to be baked into the file they download.
#
#   ./make-banner.sh
#
set -euo pipefail
cd "$(dirname "$0")"

[ -f assets/poster.jpeg ] || { echo "assets/poster.jpeg not found"; exit 1; }

CHROME=""
for c in google-chrome chromium chromium-browser /opt/google/chrome/chrome; do
  command -v "$c" >/dev/null 2>&1 && { CHROME="$c"; break; }
done
[ -n "$CHROME" ] || { echo "No Chrome/Chromium found — install one, or open"; \
                      echo "assets/share-banner.source.html and screenshot it at 1200x630."; exit 1; }

# a local server is needed so the page can load poster.jpeg
python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1.5

TMP="$(mktemp -d)"
"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=12000 --window-size=1200,630 \
  --screenshot="$TMP/banner.png" \
  "http://127.0.0.1:8765/assets/share-banner.source.html" >/dev/null 2>&1

python3 - "$TMP/banner.png" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
assert im.size == (1200, 630), f"expected 1200x630, got {im.size}"
im.save("assets/share-banner.jpg", quality=88, optimize=True, progressive=True)
print("assets/share-banner.jpg rebuilt", im.size)
PY

rm -rf "$TMP"
echo
echo "Now commit and push, then clear the platform caches:"
echo "  LinkedIn : https://www.linkedin.com/post-inspector/"
echo "  Facebook : https://developers.facebook.com/tools/debug/"
echo "  WhatsApp : no tool — share light567482.github.io/?v=2 to bypass its cache"

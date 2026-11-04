#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for file in functions.php header.php footer.php style.css inc/seo-meta.php dist/afct.min.js dist/bundle.min.css js/countries-50m.json js/countries-110m.json js/youtube-consent.js js/admin-history.js; do
    test -s "build/afct/$file" || { echo "Missing required theme file: $file" >&2; exit 1; }
done
if find build/afct \( -name '.git' -o -name '.claude' -o -name '.env*' -o -name '*.zip' -o -name '*.pem' -o -name '*.key' -o -name 'node_modules' -o -name 'vendor' \) -print | grep -q .; then
    echo 'Unexpected development files in the production package.' >&2
    exit 1
fi
# All runtime imports from the main script must be shipped alongside it.
find build/afct/dist -name '*.chunk.min.js' -print | grep -q .
echo 'Production package verified.'

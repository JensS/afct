#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
while IFS= read -r -d '' file; do
    php -l "$file"
done < <(find . -type d \( -name .git -o -name vendor -o -name node_modules -o -name build \) -prune -o -type f -name '*.php' -print0)

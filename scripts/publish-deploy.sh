#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/check-package.sh
: "${GITHUB_REPOSITORY:?Required repository name}"
: "${GITHUB_SHA:?Required source revision}"
: "${RUNNER_TEMP:?Required temporary directory}"

latest_main=$(git ls-remote "https://github.com/${GITHUB_REPOSITORY}.git" refs/heads/main | cut -f1)
if [[ "$latest_main" != "$GITHUB_SHA" ]]; then
    echo 'A newer main revision exists; refusing to publish an older release.' >&2
    exit 1
fi

deploy_checkout=$(mktemp -d "${RUNNER_TEMP}/afct-deploy.XXXXXX")
trap 'rm -rf "$deploy_checkout"' EXIT
git init --quiet "$deploy_checkout"
git -C "$deploy_checkout" remote add origin "https://github.com/${GITHUB_REPOSITORY}.git"
if git ls-remote --exit-code "https://github.com/${GITHUB_REPOSITORY}.git" refs/heads/deploy >/dev/null; then
    git -C "$deploy_checkout" fetch --quiet --depth=1 origin deploy
    git -C "$deploy_checkout" checkout --quiet -b deploy FETCH_HEAD
else
    git -C "$deploy_checkout" checkout --quiet --orphan deploy
fi
rsync -a --delete --exclude=.git build/afct/ "$deploy_checkout/"
printf '%s\n' "$GITHUB_SHA" > "$deploy_checkout/.release"
git -C "$deploy_checkout" config user.name 'github-actions[bot]'
git -C "$deploy_checkout" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$deploy_checkout" add --all
if ! git -C "$deploy_checkout" diff --cached --quiet; then
    git -C "$deploy_checkout" commit --quiet -m "Deploy ${GITHUB_SHA}"
    gh auth setup-git
    git -C "$deploy_checkout" push --quiet origin HEAD:deploy
fi

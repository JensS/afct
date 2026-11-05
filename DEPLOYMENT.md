# GitHub Actions → Plesk

The public repository contains theme source and build instructions. Deployment
uses a separate `deploy` branch containing only the production theme files.
Plesk pulls this public branch over HTTPS. Hosting passwords, SSH private keys,
database credentials and personal access tokens are not required by the workflow.

## How it works

1. Pull requests run PHP syntax/regression checks on PHP 7.4, 8.4 and 8.5, plus
   JavaScript linting and a reproducible Node 24 production build.
2. Successful main builds publish only `build/afct/` to `deploy`. The `.release`
   file records the source revision. Failed checks cannot trigger deployment.
3. The workflow calls Plesk's secret HTTPS trigger URL. Plesk pulls `deploy` and
   writes it into the existing `wp-content/themes/afct` directory.
4. Public HTTP checks verify canonical output, headings, indexability, the CMS
   sitemap and the actual deployed CSS/JS bytes.

Only the deploy job has write access to repository contents or production secrets.
It runs only for main, never for pull requests. Actions are pinned to commit SHAs.
Deployment jobs run one at a time. A stale run must not overwrite a newer main
revision. The `deploy` branch retains release history; no force push is used.

## Initial setup

- Create a GitHub environment named `production` restricted to the `main` branch.
- In Plesk, open the site's **Git** page and add `https://github.com/JensS/afct.git`.
  Initially select **No deployment**, so cloning cannot write source files into
  the live site.
- Once the first tested `deploy` branch exists, choose it in Plesk and set the
  target to the existing theme folder. Never use the ClassicPress root folder.
- Back up that theme folder before the first live deployment. Keep the backup
  outside the public document root. Database/uploads are not part of deployment.
- In Plesk repository settings, copy the generated webhook URL into GitHub's
  **production environment secret** `PLESK_WEBHOOK_URL`, using HTTPS.
- Enable Plesk automatic deployment only after the branch/path are verified.
- Merge the reviewed source pull request into main, or run the workflow manually
  on main. Verify the workflow and the live site before calling setup complete.

Do not create a separate GitHub push webhook: the workflow calls Plesk only after
checks pass. Do not paste the Plesk URL into source, issues, PRs or public logs.

## Public repository privacy

The workflow, theme source, deployment branch, artifacts, commit IDs and routine
CI logs are public. The build package is an explicit allowlist and excludes local
agent configuration, `.env` files, credentials, dependencies and development logs.
Encrypted environment secrets are not part of Git and are unavailable to PR jobs.
Never print secrets. Anyone who can change trusted main workflow code could
attempt to use its secrets, so review changes to `.github/workflows/` carefully.

Removing a file in a new commit does not erase old public Git history. If an old
commit contains an actual credential, revoke/rotate it first and then arrange
history cleanup separately. Do not rewrite repository history as routine cleanup.

## Backups and rollback

Before the first deployment, use Plesk File Manager to archive the current theme
outside the site's public document root. Keep that backup until the first release
has been checked. This deployment updates theme code only; it does not migrate
content, uploads, plugins, CMS files or the database.

For a source-code rollback, revert the problematic source commit on main; CI will
build, test and deploy the reverted source. If the site is broken and checks cannot
run quickly, disable automatic deployment in Plesk, restore the saved theme folder,
then fix/revert main before re-enabling automation. Plesk deployment is a file copy,
not an atomic directory swap; brief mixed-file states are possible during a copy.

Keep old hashed JS chunks on the server for a while so already-open pages can
finish lazy loading. Do not routinely delete all files from the target directory.
Plesk may leave files that no longer exist in Git; remove known obsolete files
only after checking references and taking a backup.

## After deployment

Submit `/wp-sitemap.xml` in Google Search Console. Inspect key standalone page
URLs and review the Pages report's exclusion reasons. Section anchors are not
separate pages. Indexing and video eligibility are search-engine decisions;
correct theme metadata cannot guarantee inclusion or rankings.

## Bunny CDN

The theme routes public static assets on `africanface.org` and
`www.africanface.org` through `https://africanface.b-cdn.net`. The pull zone origin
must be the production site root (`https://www.africanface.org`), preserving paths
such as `/wp-content/themes/afct/style.css` and `/wp-content/uploads/...`.
Local/staging sites and the admin area retain origin URLs. Navigation, canonical
URLs, REST requests and third-party embeds also stay on their own domains.
CMS media metadata is not changed. The history JSON remains same-origin because
the current pull zone does not send CORS headers for JSON.

Before deploying the CDN integration:

1. In the pull zone's **Caching → Vary Cache**, enable **URL Query String**
   (`IgnoreQueryStrings: false`). If limiting which parameters vary the cache,
   include `ver`. The theme and CMS use version queries to invalidate CSS/JS.
   Public checks on 2026-11-05 found different `ver` values hitting the same
   existing cache entry; this setting must change before deployment.
2. Keep CORS enabled for fonts, including `woff2`. Verify the response includes
   `Access-Control-Allow-Origin: *` or the production origin. CSS references fonts
   relative to its CDN URL; font preloads use the exact same URLs.
3. Keep static browser caching enabled. Public responses currently specify
   `Cache-Control: public, max-age=2592000` (30 days), including video and images.
   Use Smart Cache/static extension rules; do not apply a long cache lifetime to
   HTML, login, admin, PHP, or REST endpoints. Enable compression for CSS/JS.
4. Purge the pull zone once after changing cache settings and deploying, then
   verify the **actual versioned URLs from the homepage** return the deployed
   CSS/JS. A second request should be a CDN cache hit. The existing deployment
   verification compares these bytes with the production package.

Upload replacement media under new filenames, or purge the affected CDN URLs.
A CDN purge cannot clear a browser's already-cached file. Treat font files the
same way if their contents change. For immediate origin-only rollback, add
`define( 'AFCT_CDN_URL', '' );` to production `wp-config.php`, then clear any HTML
page cache. No Bunny API key or other credentials belong in this theme.

The gallery and support carousel use CMS attachment rendering for dimensions,
responsive image sources and existing WebP variants. A missing/invalid attachment
renders no image instead of an empty `src`. The podcast iframe loads lazily;
its third-party cache policy is controlled by its host.

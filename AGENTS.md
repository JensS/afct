# AFCT theme contributor guidance

This replaces the former CLAUDE.md. Apply it to this ClassicPress theme for
[africanface.org](https://africanface.org/). Preserve existing local work.

## Development

- Local ClassicPress site: `http://afct.test`, served by Laravel Herd when running.
- Theme directory: `wp-content/themes/afct`.
- Runtime PHP: 7.4 or newer; production currently uses PHP 8.4. Test compatibility
  on PHP 7.4, 8.4 and 8.5. Keep WordPress/ClassicPress API conventions.
- Node: version in `.nvmrc` (24). Install exact dependencies with `npm ci`.
- `npm run build`: production webpack JS/CSS. `npm run dev`: watch source.
- `npm run lint:js`: ESLint for source and webpack configuration.
- `composer install` then `composer run lint:php`: PHP syntax checks.
- `npm test` and `php tests/regression.php --empty-menu`: targeted regression checks.
- `npm run dist` then `bash scripts/check-package.sh`: production theme directory
  at `build/afct/` and ZIP at `build/afct-VERSION.zip`.
- Do not add Sass or RTL scripts unless their source files actually exist.

## Homepage architecture

`template-homepage.php` composes public WordPress pages from the primary menu
(`menu-1`), in menu order. `afct_get_homepage_sections()` is the shared source of
sections: it deduplicates pages and excludes custom/external links, drafts,
password-protected pages, missing pages and recursive homepage templates.
Experimental items are excluded by default and included only for preview.

Each section has ID `section-{page-slug}`. `IN_ONEPAGER` tells templates to omit
their own header/footer and use h2 section headings. The homepage has one h1 with
the site name; standalone sections have their own h1. Keep the split headline
design through `afct_render_section_headline()` and `afct_split_headline()`.
`afct_lowercase_articles()` affects display casing, not saved page titles.
Always set up and reset post data when including section templates.

Menu items may be external links. Intercept clicks only when the hash points to
an existing section on the current page. Never prevent normal page navigation.

## Templates and content

- `template-herovideo.php`: hero video and brand display.
- `template-intro.php`: project statement.
- `template-aboutserati.php`: biography and portrait.
- `template-film.php`: YouTube consent placeholder.
- `template-essay.php`: essay.
- `template-podcast.php`: Castopod embed, guests, audio and chapters.
- `template-history.php`: map/timeline plus server-rendered full transcript.
- `template-gallery.php`: flexible photography layout.
- `template-credits.php`: team data from `credits.json`.
- `template-prospect.php`: support carousel.
- `template-awards.php`: awards and press.
- `template-imprint.php`, `page-generic.php`: legal and general content.
- `author.php`: author biography, custom profile fields and post list.

`functions.php` loads `inc/admin-*.php`, meta-box registration and save handlers,
template helpers, the history REST endpoint and SEO modules. Editors manage
section content in template-specific meta boxes. Keep existing stored meta keys.
Every save needs the matching nonce, capability checks and autosave protection;
unrelated saves must preserve existing metadata. Chapter time `0` is valid.

## Frontend and assets

`js/afct.js` imports GSAP/ScrollTrigger and the prospect carousel. D3/topojson and
`history-timeline.js` are dynamically imported near the history section. Embedded
history metadata is preferred to the public REST fallback. Refresh ScrollTrigger
after layout changes. YouTube must load only after consent. Browser storage may
be disabled: failed reads/writes must not prevent page initialization.

Webpack emits `dist/afct.min.js`, `dist/bundle.min.css` and content-hashed dynamic
chunks. All required build plugins are direct dev dependencies. Keep the lockfile.
`dist/`, `build/` and release ZIPs are generated, not source-controlled on main.
Admin JS, YouTube consent, and the two country maps ship directly from `js/`.

Use `afct_get_version_string()` for static assets. Keep layout CSS render-blocking
to prevent unstyled output/layout shifts. Use CMS-provided jQuery for plugin
compatibility. Configure static cache/compression headers on the web server;
never cache dynamic HTML for a year based on a substring in the request URL.

The design is light-only, with responsive CSS variables. Keep the serif/sans split
headlines, `section-*` anchors, mobile menu ARIA state and keyboard access intact.

## SEO

Use native page title, excerpt and featured image. The front page uses its own
fields; individual pages use queried objects rather than the current loop post.
Emit exactly one canonical, using CMS permalink APIs (no tracking parameters).
Core owns `/wp-sitemap.xml`; `/sitemap.xml` redirects to it. Never use fragment
URLs as sitemap entries. The old editable custom sitemap is retired; its saved
option is not deleted. Keep ordinary published generic pages discoverable.

`inc/seo-meta.php` emits social metadata and Organization/WebPage/Movie/video/
podcast/person structured data. Defer to recognized SEO plugins. JSON-LD must use
JSON_HEX_* escaping so stored text cannot close the script tag. A webpage is not
a video `contentUrl`; unknown durations must be omitted rather than fabricated.
`afct_get_youtube_id()` is shared by video markup and schema.

`/llms.txt` is informational; it is not a substitute for crawlable pages and a
canonical sitemap. It lists public menu sections, excluding experiments.
Author profile fields live in `inc/user-profile-fields.php`.

## Deployment and credentials

Source: public `JensS/afct` GitHub repository. GitHub Actions checks pull requests
and main. Only successful main builds may update the `deploy` branch, which
contains the allowlisted production package, compiled assets and `.release`.
Plesk pulls that branch over HTTPS into the existing theme directory. Never point
Plesk at main or at the ClassicPress installation root. See `DEPLOYMENT.md`.

Keep the Plesk trigger URL only in the production environment's encrypted
`PLESK_WEBHOOK_URL` secret. No hosting passwords, SSH keys or PATs are needed.
Never print the URL, publish local agent settings, `.env` files, personal paths,
database dumps, logs, or credentials. No secrets in pull-request jobs; do not use
`pull_request_target`. Pin Actions to verified commit SHAs.

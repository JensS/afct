# African Face, Colonial Tongue — WordPress Theme

Theme for [africanface.org](https://africanface.org). One-page architecture assembling WordPress pages into a continuous scroll experience via the primary menu.

See [AGENTS.md](AGENTS.md) for contributor and architecture guidance and
[DEPLOYMENT.md](DEPLOYMENT.md) for deployment, privacy and rollback instructions.

## Build and checks

Use Node 24 (`.nvmrc`), then run `npm ci`, `npm run lint:js`, `npm test`,
`php tests/regression.php --empty-menu`, and `npm run dist`.
The production package is `build/afct/`; the installable ZIP is `build/afct-VERSION.zip`.
`composer run lint:php` checks PHP syntax. No Composer packages are needed on the server.

## SEO

Set descriptive page titles, excerpts and featured images in ClassicPress.
Submit `/wp-sitemap.xml` in Search Console. `/sitemap.xml` now redirects to the
CMS sitemap; the old hand-edited fragment sitemap is retired. Standalone public
pages keep their own canonical URLs. The historical timeline is readable in the
initial HTML, and the one-page homepage uses a clear heading hierarchy.

The Search Console overview alone does not establish why URLs disappeared.
Review the Pages report's exclusion reasons and inspect important page URLs after
deployment. Google may consolidate overlapping sections with the homepage;
a separate rich video result also requires an eligible video watch page.

---

## Server Configuration

The theme handles asset versioning via `filemtime()` query strings (e.g. `style.css?ver=1234567890`), so long cache lifetimes on static assets are safe — browsers fetch fresh automatically on deploy.

### Apache `.htaccess`

Place this in the **WordPress root** (not the theme directory). It combines the standard WordPress rewrite rules with performance headers.

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress

# Browser caching — safe at 1 year, cache-busted via ?ver=filemtime on deploy
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType font/otf               "access plus 1 year"
    ExpiresByType font/ttf               "access plus 1 year"
    ExpiresByType font/woff              "access plus 1 year"
    ExpiresByType font/woff2             "access plus 1 year"
    ExpiresByType application/font-woff  "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    ExpiresByType image/jpeg             "access plus 1 year"
    ExpiresByType image/png              "access plus 1 year"
    ExpiresByType image/gif              "access plus 1 year"
    ExpiresByType image/webp             "access plus 1 year"
    ExpiresByType image/avif             "access plus 1 year"
    ExpiresByType image/svg+xml          "access plus 1 year"
    ExpiresByType image/x-icon           "access plus 1 year"
    ExpiresByType video/mp4              "access plus 1 year"
    ExpiresByType video/webm             "access plus 1 year"
    ExpiresByType text/css               "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/javascript        "access plus 1 year"
    ExpiresByType text/html              "access plus 0 seconds"
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\.(otf|ttf|woff|woff2|eot|ico|gif|png|jpg|jpeg|webp|avif|svg|mp4|webm)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    <FilesMatch "\.(css|js)$">
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE font/woff
    AddOutputFilterByType DEFLATE font/woff2
</IfModule>

ServerSignature Off
```

Required Apache modules: `mod_rewrite` (mandatory for WP), `mod_expires`, `mod_headers`, `mod_deflate` — all enabled by default on most shared hosting.

### nginx equivalent

```nginx
location ~* \.(otf|ttf|woff|woff2|eot|ico|gif|png|jpg|jpeg|webp|avif|svg|mp4|webm)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000";
}
gzip on;
gzip_types text/html text/css application/javascript application/json image/svg+xml font/otf font/ttf font/woff font/woff2;
gzip_min_length 256;
```

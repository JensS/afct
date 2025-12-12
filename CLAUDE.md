# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress/ClassicPress theme for africanface.org, a non-profit project. The theme uses a unique one-page architecture where the homepage assembles content from individual WordPress pages configured via the primary menu.

## Development Environment

The project uses **Laravel Herd** for local development:
- **Local URL**: http://afct.test
- Theme directory: `/wp-content/themes/afct`

Herd provides a local PHP environment for WordPress/ClassicPress development.

## Development Commands

### Build and Development
```bash
# Production build (webpack bundles JS/CSS)
npm run build

# Development mode with watch
npm run dev

# CSS compilation
npm run compile:css      # Compile SASS to CSS
npm run watch           # Watch SASS files for changes
npm run compile:rtl     # Compile RTL styles

# Linting
npm run lint:scss       # Lint SASS files
npm run lint:js         # Lint JavaScript files

# Create distribution bundle
npm run bundle
```

### PHP Linting
```bash
# Using Composer
composer run lint:wpcs  # WordPress coding standards
composer run lint:php   # PHP syntax checking
```

## Architecture

### One-Page Homepage System

**This is the most important architectural pattern in the theme.**

The homepage is NOT a single page with sections written in it. Instead, it dynamically assembles multiple WordPress pages into one continuous scrolling experience.

**How it works** (`template-homepage.php`):

1. Get the primary menu (`menu-1`) from WordPress
2. Loop through each menu item in order
3. For each menu item:
   - Get the actual WordPress page that the menu item links to
   - Create a `<section>` wrapper with ID: `section-{page-slug}`
   - Check if the page has a custom template (e.g., `template-history.php`)
   - If yes: Include and execute that entire template file
   - If no: Just output the page's content
   - Close the `</section>` wrapper
4. Repeat for all menu items

**Critical implementation details**:

- **Menu order = section order**: Rearranging the menu in WordPress admin changes the order of sections on the homepage
- **IN_ONEPAGER constant**: Set to `true` before the loop. Individual templates check `defined('IN_ONEPAGER')` to skip their own `get_header()` and `get_footer()` calls, preventing duplicate headers/footers
- **Section IDs**: Always formatted as `section-{$post->post_name}` - this is used by navigation to link menu items to their corresponding sections
- **Template loading**: Uses `locate_template($template_file, true, true)` which includes and executes the template in the current context

**Example flow**:

```
Homepage loads → Gets menu items: [Intro, History, Gallery, Credits]
  ↓
  Outputs: <section id="section-intro">
            [Entire template-intro.php executes here]
           </section>
           <section id="section-history">
            [Entire template-history.php executes here]
           </section>
           <section id="section-gallery">
            [Entire template-gallery.php executes here]
           </section>
           <section id="section-credits">
            [Entire template-credits.php executes here]
           </section>
```

**Why this matters**:

- Content editors manage each section as a separate page in WordPress
- Each section can have its own custom template with unique functionality
- Changing site structure = rearranging menu items, no code changes needed
- Navigation links can use hash fragments to jump to sections (e.g., `#section-history`)
- Individual templates MUST be aware they're being included (check `IN_ONEPAGER`)

### Asset Pipeline

**Webpack** (webpack.config.js):
- Entry point: `js/afct.js` → `dist/afct.min.js`
- CSS bundle: `css/history.css` + `css/responsive.css` → `dist/bundle.min.css`
- Babel transpilation for ES6+ support
- Minification via TerserPlugin and CssMinimizerPlugin

**Scripts are loaded in footer** with deferred loading for performance.

### Key Dependencies

- **GSAP 3.12.7**: Animation library with ScrollTrigger and ScrollSmoother plugins
- **Locomotive Scroll 5.0.0-beta.21**: Smooth scrolling (being migrated to GSAP ScrollSmoother)
- **D3.js 7.9.0**: Data visualization for history timeline
- **jQuery 3.6.3**: Loaded from CDN in footer

### Scroll Architecture

The site implements sophisticated scroll-based interactions:

1. **Scroll Snapping**: `scroll-snap-type: y proximity` on body creates natural section navigation
2. **Split Headlines**: Each section has text in upper-left and lower-right corners that fade based on scroll position
3. **GSAP ScrollSmoother**: Provides smooth scrolling with `smooth: 2` and `speed: 3` settings
4. **Captive Scroll Sections**: Some sections (history timeline) trap scrolling for internal animations before releasing
5. **Section Navigation**: IntersectionObserver detects section visibility and updates navigation state

### Page Templates

All custom templates start with `template-*.php`:

- `template-homepage.php` - Main one-page assembly template
- `template-intro.php` - Fullscreen background video intro
- `template-gallery.php` - Photography display with flexible layouts
- `template-history.php` - Interactive D3.js timeline with map visualization
- `template-podcast.php` - Custom audio player with chapter navigation
- `template-prospect.php` - Image carousel with gradient masks
- `template-credits.php` - Team information display
- `template-essay.php` - Long-form content
- `template-film.php` - Video content
- `template-aboutserati.php` - About Serati with scaling image effect
- `template-herovideo.php` - Hero video section
- `template-imprint.php` - Imprint/legal

### Author Pages

**Custom Author Template** (`author.php`):
- Clean, compact bio page design
- Displays author avatar (Gravatar)
- Shows author bio, tagline, and social links
- Lists all posts by the author
- Automatically included in sitemap

**Custom User Profile Fields** (`inc/user-profile-fields.php`):
- Tagline field - Short description/title
- Twitter URL - Full profile URL
- LinkedIn URL - Full profile URL
- Instagram URL - Full profile URL
- Person schema (JSON-LD) for AI/SEO optimization

**How to set up author page:**
1. Go to WordPress Admin → Users → Your Profile
2. Update "Biographical Info" - main bio text
3. Fill in custom "Author Information" fields:
   - Tagline (e.g., "Documentary Filmmaker")
   - Social media URLs (full URLs)
4. Upload profile picture via Gravatar (gravatar.com)
5. Author page available at: `/author/username/`

### Theme Functions Organization

**Main functions.php** includes specialized modules from `/inc`:

- `custom-meta-boxes.php` - Meta box registration framework
- `custom-add-metaboxes.php` - Meta box field definitions
- `template-helpers.php` - Utility functions for templates
- `rest-api-history.php` - REST endpoint `/wp-json/afct/v1/history` for timeline data
- `class-afct-menu-walker.php` - Custom menu walker
- `admin-*.php` files - Admin interfaces for each content type (gallery, history, podcast, prospect, etc.)

### JavaScript Architecture

**Main entry point**: `js/afct.js`
- Initializes GSAP ScrollSmoother
- Conditionally initializes history timeline and prospect carousel
- Handles theme toggling (dark/light)
- Manages section IntersectionObserver for navigation
- Handles YouTube cookie consent

**Modular components**:
- `history-timeline.js` - D3.js visualization with map and timeline markers
- `prospect-carousel.js` - Custom carousel with prev/next gradient masks
- `youtube-consent.js` - GDPR-compliant YouTube embedding

**Admin scripts** (loaded only in WP admin):
- `admin-history.js` - D3.js preview in admin for history entries
- `admin-history-json-upload.js` - Bulk import history data
- `admin-prospect-carousel.js` - Sortable carousel slide management

### CSS Architecture

**Mobile-first approach** with CSS variables for theming:

```css
--background: var(--bg-dark)
--text-color: var(--text-dark)
--red: rgb(255,0,0)
```

**Breakpoints**:
- Mobile: base styles
- Mobile landscape: 768px+
- Desktop: 1025px+
- Desktop L: 1281px+
- Desktop XL: 1441px+
- Desktop XXL: 1921px+

**Theme switching**: Body class `.light-theme` or `.dark-theme` controls CSS variable values. Preference saved to localStorage.

### Custom Meta Boxes System

The theme uses a meta box framework for content management:

1. **Registration**: `custom-add-metaboxes.php` defines which templates get which meta boxes
2. **Fields**: Meta boxes define various field types (text, textarea, image, repeater, etc.)
3. **Admin UI**: Each template type has its own admin file (e.g., `admin-history.php`, `admin-podcast.php`)
4. **Data Storage**: Saved as post meta with prefixed keys

**Key meta box features**:
- History entries: Year, location, visualization type, map zoom level
- Gallery: Layout configuration (row/column structure)
- Podcast: Audio file, chapters (timestamp + description), guest images
- Prospect: Carousel slides with images and CTA buttons

### Performance Optimizations

The theme implements several PageSpeed optimizations:

1. **Asset versioning**: Uses `filemtime()` for cache-busting based on file modification time
2. **Critical CSS**: Inlined in `<head>` via `afct_inline_critical_css()`
3. **Async CSS loading**: Non-critical CSS loaded with `rel="preload"` + onload fallback
4. **Deferred scripts**: JS loaded in footer with `defer` attribute
5. **Cache headers**: 1-year cache for static assets (fonts, images, CSS, JS)
6. **Emoji removal**: Disables WordPress emoji detection scripts
7. **jQuery optimization**: Loads from CDN in footer instead of WP bundled version

### Split Headlines Function

`afct_split_headline($title)` is a critical utility that splits page titles for the two-part display:

- Splits on comma (`,`) if present: `"Part A, Part B"`
- Otherwise splits at word midpoint
- Returns array: `['upper' => 'Part A', 'lower' => 'Part B']`

Used throughout templates for the signature split headline layout.

### REST API

**History endpoint**: `GET /wp-json/afct/v1/history`
- Returns all history entries with location coordinates, visualization data, and metadata
- Used by D3.js timeline visualization
- Requires nonce for security (passed via `afctSettings.historyNonce`)

### Admin Experience

**Key admin features**:
- Content editor disabled for templated pages (only meta boxes shown)
- Custom admin styles for history preview (`css/admin-history.css`)
- Sortable interfaces for repeater fields (chapters, carousel slides)
- Media uploader integration for images
- D3.js preview in history admin matching frontend visualization

### SEO & AI Optimization

The theme includes built-in SEO and AI/LLM optimization features:

**WordPress Native Fields for SEO:**
- **Page Title** → Used for meta title and og:title
- **Page Excerpt** → Used for meta description (enabled for all pages)
- **Featured Image** → Used for og:image and Twitter cards (enabled for all pages)

**SEO Meta Tags** (`inc/seo-meta.php`):
- Meta description
- Open Graph tags (og:title, og:description, og:image, og:url, og:site_name)
- Twitter Card tags (summary_large_image)
- Canonical URL

**Structured Data (JSON-LD):**
- Organization schema (site-wide)
- WebPage schema (per page)
- All structured data outputted in header

**How to optimize a page for SEO:**
1. Edit the page in WordPress admin
2. Set a clear, descriptive page title
3. Add an excerpt (appears as "Excerpt" field below editor) - this becomes the meta description
4. Set a featured image (appears as "Featured Image" in sidebar) - this becomes the social share image
5. All meta tags and structured data are generated automatically

**For the homepage/one-pager:**
- Uses the "Homepage" page settings (the page assigned as front page)
- Homepage excerpt = site-wide meta description
- Homepage featured image = default og:image for social shares

**Sitemap (WordPress Built-in Enhanced):**
- Automatic sitemap at `/wp-sitemap.xml`
- Custom priorities: Homepage (1.0), Menu pages (0.8), Others (0.5)
- Automatically excludes Generic Page template pages
- No custom sitemap generator needed - WordPress handles it

### Important Patterns

1. **Template Detection**: Use `get_page_template_slug($post)` to get template file
2. **Version Strings**: Use `afct_get_version_string($path)` for all enqueued assets
3. **One-pager Context**: Check `defined('IN_ONEPAGER')` to conditionally load headers/footers
4. **Theme Toggle**: Store preference in localStorage as 'theme' key ('light' or 'dark')
5. **Section IDs**: Always format as `section-{$post->post_name}` for navigation consistency
6. **SEO Fields**: Use WordPress native excerpt and featured image for SEO - don't create custom meta boxes

### Common Pitfalls

- Don't add content editor to templated pages - use meta boxes instead
- Always use `afct_get_version_string()` for cache-busting, not theme version constant
- Remember ScrollTrigger.refresh() after DOM changes
- Check for section existence before initializing component JS
- The theme expects a specific menu structure - homepage assembly depends on primary menu

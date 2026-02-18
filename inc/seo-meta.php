<?php
/**
 * SEO Meta Tags and Structured Data
 *
 * @package AFCT
 */

/**
 * Get the SEO meta title
 */
function afct_get_seo_title() {
    if (is_front_page()) {
        $site_name = get_bloginfo('name');
        $site_description = get_bloginfo('description');
        return $site_name . ($site_description ? ' - ' . $site_description : '');
    }

    return wp_get_document_title();
}

/**
 * Get the SEO meta description
 */
function afct_get_seo_description() {
    if (is_front_page()) {
        $homepage_id = get_option('page_on_front');
        if ($homepage_id) {
            $excerpt = get_the_excerpt($homepage_id);
            if ($excerpt) {
                return wp_strip_all_tags($excerpt);
            }
        }
        // Fallback to site description
        return get_bloginfo('description');
    }

    if (is_singular()) {
        $excerpt = get_the_excerpt();
        if ($excerpt) {
            return wp_strip_all_tags($excerpt);
        }
    }

    return get_bloginfo('description');
}

/**
 * Get the SEO image URL
 */
function afct_get_seo_image() {
    // Try homepage featured image first
    if (is_front_page()) {
        $homepage_id = get_option('page_on_front');
        if ($homepage_id && has_post_thumbnail($homepage_id)) {
            return get_the_post_thumbnail_url($homepage_id, 'large');
        }
    }

    // Try current page featured image
    if (is_singular() && has_post_thumbnail()) {
        return get_the_post_thumbnail_url(null, 'large');
    }

    // Fallback to site logo or default image
    $custom_logo_id = get_theme_mod('custom_logo');
    if ($custom_logo_id) {
        $logo = wp_get_attachment_image_src($custom_logo_id, 'large');
        if ($logo) {
            return $logo[0];
        }
    }

    // Use afct-poster.png as default fallback
    // To use a different image, replace 'afct-poster.png' with your preferred image filename
    $default_image = get_template_directory_uri() . '/img/afct-poster.png';

    // Check if the file exists, otherwise return empty (no og:image is better than broken link)
    $default_image_path = get_template_directory() . '/img/afct-poster.png';
    if (file_exists($default_image_path)) {
        return $default_image;
    }

    return '';
}

/**
 * Output SEO meta tags
 */
function afct_output_seo_meta_tags() {
    $title = afct_get_seo_title();
    $description = afct_get_seo_description();
    $image = afct_get_seo_image();
    $url = home_url($_SERVER['REQUEST_URI']);
    $site_name = get_bloginfo('name');

    ?>
    <!-- SEO Meta Tags -->
    <meta name="description" content="<?php echo esc_attr($description); ?>">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo esc_url($url); ?>">
    <meta property="og:title" content="<?php echo esc_attr($title); ?>">
    <meta property="og:description" content="<?php echo esc_attr($description); ?>">
    <?php if ($image) : ?>
    <meta property="og:image" content="<?php echo esc_url($image); ?>">
    <?php endif; ?>
    <meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>">
    <meta property="og:locale" content="en_US">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?php echo esc_url($url); ?>">
    <meta name="twitter:title" content="<?php echo esc_attr($title); ?>">
    <meta name="twitter:description" content="<?php echo esc_attr($description); ?>">
    <?php if ($image) : ?>
    <meta name="twitter:image" content="<?php echo esc_url($image); ?>">
    <?php endif; ?>

    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo esc_url($url); ?>">
    <?php
}

/**
 * Generate Organization schema
 */
function afct_get_organization_schema() {
    $logo = afct_get_seo_image();

    $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'NGO',
        'name' => get_bloginfo('name'),
        'url' => home_url('/'),
        'logo' => $logo,
        'description' => get_bloginfo('description'),
        'sameAs' => array(
            'https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7',
            'https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874',
        ),
        'knowsAbout' => array(
            'Post-Apartheid South Africa',
            'Language and cultural identity',
            'Documentary film',
            'African languages',
        ),
    );

    return $schema;
}

/**
 * Find a menu page by template name
 */
function afct_get_menu_page_by_template( $template_slug ) {
    $menu_locations = get_nav_menu_locations();
    $menu_id        = $menu_locations['menu-1'] ?? 0;
    if ( ! $menu_id ) {
        return null;
    }
    $menu_items = wp_get_nav_menu_items( $menu_id );
    if ( ! $menu_items ) {
        return null;
    }
    foreach ( $menu_items as $item ) {
        $tpl = get_post_meta( $item->object_id, '_wp_page_template', true );
        if ( $tpl === $template_slug ) {
            return get_post( $item->object_id );
        }
    }
    return null;
}

/**
 * Generate Movie schema for the documentary film
 */
function afct_get_film_schema() {
    $page = afct_get_menu_page_by_template( 'template-film.php' );
    if ( ! $page ) {
        return null;
    }

    $title       = $page->post_title;
    $description = wp_strip_all_tags( get_the_excerpt( $page->ID ) ) ?: get_bloginfo( 'description' );
    $image       = get_the_post_thumbnail_url( $page->ID, 'large' ) ?: afct_get_seo_image();

    return array(
        '@context'    => 'https://schema.org',
        '@type'       => 'Movie',
        'name'        => $title,
        'description' => $description,
        'image'       => $image,
        'url'         => home_url( '/' ) . '#section-' . $page->post_name,
        'genre'       => 'Documentary',
        'inLanguage'  => 'en',
        'about'       => array(
            '@type' => 'Thing',
            'name'  => 'Post-Apartheid South Africa — Language and Identity',
        ),
    );
}

/**
 * Generate PodcastSeries schema
 */
function afct_get_podcast_schema() {
    $page = afct_get_menu_page_by_template( 'template-podcast.php' );
    if ( ! $page ) {
        return null;
    }

    $title       = $page->post_title;
    $description = wp_strip_all_tags( get_the_excerpt( $page->ID ) ) ?: get_bloginfo( 'description' );
    $image       = get_the_post_thumbnail_url( $page->ID, 'large' ) ?: afct_get_seo_image();

    return array(
        '@context'    => 'https://schema.org',
        '@type'       => 'PodcastSeries',
        'name'        => $title,
        'description' => $description,
        'image'       => $image,
        'url'         => home_url( '/' ) . '#section-' . $page->post_name,
        'sameAs'      => array(
            'https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7',
            'https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874',
        ),
        'inLanguage'  => 'en',
        'author'      => afct_get_organization_schema(),
    );
}

/**
 * Generate Person schema for Serati Maseko
 */
function afct_get_serati_schema() {
    $page = afct_get_menu_page_by_template( 'template-aboutserati.php' );
    if ( ! $page ) {
        return null;
    }

    $bio        = wp_strip_all_tags( get_post_meta( $page->ID, '_afct_about_serati', true ) );
    $image_data = get_post_meta( $page->ID, '_afct_about_serati_image', true );
    $image_url  = is_array( $image_data ) && ! empty( $image_data['url'] ) ? $image_data['url'] : afct_get_seo_image();

    $schema = array(
        '@context'    => 'https://schema.org',
        '@type'       => 'Person',
        'name'        => 'Serati Maseko',
        'nationality' => array(
            '@type' => 'Country',
            'name'  => 'South Africa',
        ),
        'image'       => $image_url,
        'url'         => home_url( '/' ) . '#section-' . $page->post_name,
    );

    if ( $bio ) {
        $schema['description'] = wp_trim_words( $bio, 55 );
    }

    return $schema;
}

/**
 * Generate WebPage schema
 */
function afct_get_webpage_schema() {
    $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'WebPage',
        'name' => afct_get_seo_title(),
        'description' => afct_get_seo_description(),
        'url' => home_url($_SERVER['REQUEST_URI']),
        'image' => afct_get_seo_image(),
        'publisher' => afct_get_organization_schema()
    );

    return $schema;
}

/**
 * Output structured data (JSON-LD)
 */
function afct_output_structured_data() {
    $schemas = array();

    // Always include Organization schema
    $schemas[] = afct_get_organization_schema();

    // Add WebPage schema
    $schemas[] = afct_get_webpage_schema();

    // On the front page (one-pager) include all content-type schemas
    if ( is_front_page() ) {
        $film    = afct_get_film_schema();
        $podcast = afct_get_podcast_schema();
        $person  = afct_get_serati_schema();

        if ( $film )    $schemas[] = $film;
        if ( $podcast ) $schemas[] = $podcast;
        if ( $person )  $schemas[] = $person;
    }

    // Output as JSON-LD
    echo '<script type="application/ld+json">' . "\n";
    echo wp_json_encode($schemas, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    echo "\n" . '</script>' . "\n";
}

/**
 * Customize WordPress sitemap priorities
 */
function afct_sitemap_priority($priority, $type, $post) {
    // Homepage gets highest priority
    if ($post->ID == get_option('page_on_front')) {
        return 1.0;
    }

    // Pages in the primary menu get high priority
    $menu_items = wp_get_nav_menu_items(get_nav_menu_locations()['menu-1']);
    if ($menu_items) {
        foreach ($menu_items as $item) {
            if ($item->object_id == $post->ID) {
                return 0.8; // High priority for menu pages
            }
        }
    }

    // Other pages get default priority
    return 0.5;
}
add_filter('wp_sitemaps_posts_entry', function($entry, $post) {
    $entry['priority'] = afct_sitemap_priority($entry['priority'], 'post', $post);
    return $entry;
}, 10, 2);

/**
 * Auto-generate llms.txt content from WordPress data.
 * Called as a fallback when no custom content has been saved.
 */
function afct_auto_generate_llms_txt() {
    $site_name = get_bloginfo( 'name' );
    $site_desc = get_bloginfo( 'description' );
    $home_url  = home_url( '/' );

    // Homepage description
    $homepage_id = get_option( 'page_on_front' );
    $intro = $homepage_id
        ? wp_strip_all_tags( get_the_excerpt( $homepage_id ) )
        : $site_desc;

    $lines = array();
    $lines[] = '# ' . $site_name;
    $lines[] = '';
    if ( $intro ) {
        $lines[] = '> ' . $intro;
        $lines[] = '';
    }

    // Build sections from primary menu
    $menu_locations = get_nav_menu_locations();
    $menu_id        = $menu_locations['menu-1'] ?? 0;
    $menu_items     = $menu_id ? wp_get_nav_menu_items( $menu_id ) : array();

    if ( $menu_items ) {
        $lines[] = '## Sections';
        $lines[] = '';
        foreach ( $menu_items as $item ) {
            $page    = get_post( $item->object_id );
            if ( ! $page ) continue;
            $excerpt = wp_strip_all_tags( get_the_excerpt( $page->ID ) );
            $url     = $home_url . '#section-' . $page->post_name;
            $label   = $item->title ?: $page->post_title;
            $line    = '- [' . $label . '](' . $url . ')';
            if ( $excerpt ) {
                $line .= ': ' . $excerpt;
            }
            $lines[] = $line;
        }
        $lines[] = '';
    }

    // Podcast external links
    $lines[] = '## The Podcast';
    $lines[] = '';
    $lines[] = '- [Listen on Spotify](https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7): African Face, Colonial Tongue podcast series on Spotify';
    $lines[] = '- [Listen on Apple Podcasts](https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874): African Face, Colonial Tongue podcast series on Apple Podcasts';
    $lines[] = '';

    // Sitemap reference
    $lines[] = '## Sitemap';
    $lines[] = '';
    $lines[] = '- [XML Sitemap](' . home_url( '/wp-sitemap.xml' ) . ')';
    $lines[] = '';

    return implode( "\n", $lines );
}

/**
 * Get llms.txt content: returns saved custom content if set, otherwise auto-generates.
 */
function afct_get_llms_txt_content() {
    $saved = get_option( 'afct_llms_txt_content', '' );
    return $saved !== '' ? $saved : afct_auto_generate_llms_txt();
}

/**
 * Serve /llms.txt for AI/LLM crawlers
 */
add_action( 'init', function () {
    if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
        return;
    }
    $path = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
    $home = parse_url( home_url( '/' ), PHP_URL_PATH );
    $file = ltrim( str_replace( rtrim( $home, '/' ), '', $path ), '/' );
    if ( $file !== 'llms.txt' ) {
        return;
    }
    status_header( 200 );
    header( 'Content-Type: text/plain; charset=utf-8' );
    header( 'Cache-Control: public, max-age=86400' );
    echo afct_get_llms_txt_content();
    exit;
} );

/**
 * Auto-generate sitemap XML from WordPress data.
 * Includes the homepage and each primary-menu section as an anchor URL.
 */
function afct_auto_generate_sitemap_xml() {
    $home_url    = rtrim( home_url( '/' ), '/' );
    $homepage_id = get_option( 'page_on_front' );
    $home_mod    = $homepage_id
        ? get_post_modified_time( 'Y-m-d', true, $homepage_id )
        : gmdate( 'Y-m-d' );

    $lines   = array();
    $lines[] = '<?xml version="1.0" encoding="UTF-8"?>';
    $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Homepage
    $lines[] = '  <url>';
    $lines[] = '    <loc>' . esc_url( $home_url . '/' ) . '</loc>';
    $lines[] = '    <lastmod>' . $home_mod . '</lastmod>';
    $lines[] = '    <changefreq>weekly</changefreq>';
    $lines[] = '    <priority>1.0</priority>';
    $lines[] = '  </url>';

    // Primary-menu sections
    $menu_locations = get_nav_menu_locations();
    $menu_id        = $menu_locations['menu-1'] ?? 0;
    $menu_items     = $menu_id ? wp_get_nav_menu_items( $menu_id ) : array();

    foreach ( $menu_items as $item ) {
        $page = get_post( $item->object_id );
        if ( ! $page ) {
            continue;
        }
        $modified = get_post_modified_time( 'Y-m-d', true, $page->ID );
        $url      = $home_url . '/#section-' . $page->post_name;

        $lines[] = '  <url>';
        $lines[] = '    <loc>' . esc_url( $url ) . '</loc>';
        $lines[] = '    <lastmod>' . $modified . '</lastmod>';
        $lines[] = '    <changefreq>monthly</changefreq>';
        $lines[] = '    <priority>0.8</priority>';
        $lines[] = '  </url>';
    }

    $lines[] = '</urlset>';

    return implode( "\n", $lines );
}

/**
 * Get sitemap XML: returns saved custom content if set, otherwise auto-generates.
 */
function afct_get_sitemap_xml_content() {
    $saved = get_option( 'afct_sitemap_xml_content', '' );
    return $saved !== '' ? $saved : afct_auto_generate_sitemap_xml();
}

/**
 * Serve /sitemap.xml
 * Hooks into 'init' (before wp_loaded / parse_request) to intercept the
 * request before WordPress's own sitemap feature redirects it to wp-sitemap.xml.
 */
add_action( 'init', function () {
    if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
        return;
    }
    $path = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
    $home = parse_url( home_url( '/' ), PHP_URL_PATH );
    $file = ltrim( str_replace( rtrim( $home, '/' ), '', $path ), '/' );
    if ( $file !== 'sitemap.xml' ) {
        return;
    }
    status_header( 200 );
    header( 'Content-Type: application/xml; charset=utf-8' );
    header( 'Cache-Control: public, max-age=86400' );
    echo afct_get_sitemap_xml_content();
    exit;
} );

/**
 * Exclude certain pages from sitemap
 */
function afct_sitemap_exclude_posts($args, $post_type) {
    if ($post_type !== 'page') {
        return $args;
    }

    // Exclude pages with Generic Page template
    $args['meta_query'] = array(
        array(
            'key' => '_wp_page_template',
            'value' => 'page-generic.php',
            'compare' => '!='
        )
    );

    return $args;
}
add_filter('wp_sitemaps_posts_query_args', 'afct_sitemap_exclude_posts', 10, 2);

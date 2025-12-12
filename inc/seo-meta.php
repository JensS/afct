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
        '@type' => 'Organization',
        'name' => get_bloginfo('name'),
        'url' => home_url('/'),
        'logo' => $logo,
        'description' => get_bloginfo('description'),
        'sameAs' => array()
    );

    // Add social media profiles if available
    // You can add custom fields for these in the future

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

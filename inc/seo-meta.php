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
    $description = '';
    if ( is_author() ) {
        $description = get_the_author_meta( 'description', get_queried_object_id() );
    }
    if ( is_singular() && ! post_password_required( get_queried_object_id() ) ) {
        $page = get_post( get_queried_object_id() );
        if ( $page ) {
            $description = $page->post_excerpt;
            if ( ! $description ) {
                $description = strip_shortcodes( $page->post_content );
            }
        }
    }
    if ( ! $description ) {
        $description = get_bloginfo( 'description' );
    }

    return wp_trim_words( trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( $description ) ) ), 35, '' );
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

    // Author page: use Gravatar
    if (is_author()) {
        $author_id  = get_queried_object_id();
        $avatar_url = get_avatar_url($author_id, array('size' => 512));
        if ($avatar_url) {
            return $avatar_url;
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
    $url = afct_get_canonical_url();
    $site_name = get_bloginfo('name');

    ?>
    <!-- SEO Meta Tags -->
    <meta name="description" content="<?php echo esc_attr($description); ?>">

    <!-- Open Graph / Facebook -->
    <?php if (is_author()) :
        $og_author = get_queried_object();
    ?>
    <meta property="og:type" content="profile">
    <meta property="profile:first_name" content="<?php echo esc_attr(get_the_author_meta('first_name', $og_author->ID)); ?>">
    <meta property="profile:last_name" content="<?php echo esc_attr(get_the_author_meta('last_name', $og_author->ID)); ?>">
    <meta property="profile:username" content="<?php echo esc_attr($og_author->user_nicename); ?>">
    <?php else : ?>
    <meta property="og:type" content="website">
    <?php endif; ?>
    <meta property="og:url" content="<?php echo esc_url($url); ?>">
    <meta property="og:title" content="<?php echo esc_attr($title); ?>">
    <meta property="og:description" content="<?php echo esc_attr($description); ?>">
    <?php if ($image) : ?>
    <meta property="og:image" content="<?php echo esc_url($image); ?>">
    <?php endif; ?>
    <meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>">
    <meta property="og:locale" content="<?php echo esc_attr( get_locale() ); ?>">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?php echo esc_url($url); ?>">
    <meta name="twitter:title" content="<?php echo esc_attr($title); ?>">
    <meta name="twitter:description" content="<?php echo esc_attr($description); ?>">
    <?php if ($image) : ?>
    <meta name="twitter:image" content="<?php echo esc_url($image); ?>">
    <?php endif; ?>

    <!-- Canonical URL -->
    <?php if ( $url ) : ?>
    <link rel="canonical" href="<?php echo esc_url($url); ?>">
    <?php endif; ?>
    <?php
}

/**
 * Generate Organization schema
 */
function afct_get_organization_schema() {
    $logo_id = get_theme_mod( 'custom_logo' );
    $logo = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : '';

    $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
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

    if ( ! $logo ) {
        unset( $schema['logo'] );
    }

    return $schema;
}

/**
 * Find a menu page by template name
 */
function afct_get_menu_page_by_template( $template_slug ) {
    $menu_items = afct_get_homepage_sections();
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
 * Generate VideoObject schema for the documentary film
 */
function afct_get_video_schema() {
    $page = afct_get_menu_page_by_template( 'template-film.php' );
    if ( ! $page ) {
        return null;
    }

    $youtube_url = get_post_meta( $page->ID, '_afct_youtube_embed', true );
    if ( ! $youtube_url ) {
        return null;
    }

    $video_id = afct_get_youtube_id( $youtube_url );
    if ( ! $video_id ) {
        return null;
    }

    $title       = $page->post_title;
    $description = wp_strip_all_tags( get_the_excerpt( $page->ID ) ) ?: get_bloginfo( 'description' );
    $thumb_url   = get_the_post_thumbnail_url( $page->ID, 'large' );
    if ( ! $thumb_url ) {
        $thumb_url = 'https://img.youtube.com/vi/' . $video_id . '/maxresdefault.jpg';
    }
    $upload_date = get_the_date( 'c', $page->ID );
    $duration = get_post_meta( $page->ID, '_afct_video_duration', true );

    // Publisher
    $org       = afct_get_organization_schema();
    $publisher = array(
        '@type' => 'Organization',
        'name'  => $org['name'],
        'url'   => $org['url'],
    );
    if ( ! empty( $org['logo'] ) ) {
        $publisher['logo'] = array(
            '@type' => 'ImageObject',
            'url'   => $org['logo'],
        );
    }

    // Creator: Serati Maseko
    $serati_page = afct_get_menu_page_by_template( 'template-aboutserati.php' );
    $creator     = array( '@type' => 'Person', 'name' => 'Serati Maseko' );
    if ( $serati_page ) {
        $serati_job = get_post_meta( $serati_page->ID, '_afct_serati_job_title', true );
        if ( $serati_job ) {
            $creator['jobTitle'] = $serati_job;
        }
    }

    // Director: Jens Sage (from WP user)
    $director = array( '@type' => 'Person', 'name' => 'Jens Sage' );
    $jens     = get_user_by( 'slug', 'jens' ) ?: get_user_by( 'login', 'jens' );
    if ( $jens ) {
        $director['url'] = get_author_posts_url( $jens->ID );
        $tagline         = get_the_author_meta( 'tagline', $jens->ID );
        if ( $tagline ) {
            $director['jobTitle'] = $tagline;
        }
    }

    $schema = array(
        '@context'     => 'https://schema.org',
        '@type'        => 'VideoObject',
        'name'         => $title,
        'description'  => $description,
        'thumbnailUrl' => array( $thumb_url ),
        'uploadDate'   => $upload_date,
        'url'          => get_permalink( $page ),
        'embedUrl'     => 'https://www.youtube-nocookie.com/embed/' . $video_id,
        'publisher'    => $publisher,
        'creator'      => $creator,
        'director'     => $director,
        'keywords'     => 'Artivism, South Africa, Linguistic Identity, Post-Colonialism, African Film',
        'about'        => array(
            array( '@type' => 'Thing', 'name' => 'Post-colonialism' ),
            array( '@type' => 'Thing', 'name' => 'Linguistic Identity' ),
            array( '@type' => 'Thing', 'name' => 'African Languages' ),
        ),
        'inLanguage'   => 'en',
    );
    if ( is_string( $duration ) && preg_match( '/^PT(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?$/', $duration ) ) {
        $schema['duration'] = $duration;
    }

    return $schema;
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

    $job_title = get_post_meta( $page->ID, '_afct_serati_job_title', true );
    $website   = get_post_meta( $page->ID, '_afct_serati_website',   true );
    $instagram = get_post_meta( $page->ID, '_afct_serati_instagram', true );
    $spotify   = get_post_meta( $page->ID, '_afct_serati_spotify',   true );
    $twitter   = get_post_meta( $page->ID, '_afct_serati_twitter',   true );

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
        'subjectOf'   => array(
            '@type' => 'Movie',
            'name'  => get_bloginfo('name'),
            'url'   => home_url('/'),
        ),
    );

    if ( $job_title ) {
        $schema['jobTitle'] = $job_title;
    }

    if ( $bio ) {
        $schema['description'] = wp_trim_words( $bio, 55 );
    }

    $same_as = array_filter( array( $website, $instagram, $spotify, $twitter ) );
    if ( ! empty( $same_as ) ) {
        $schema['sameAs'] = array_values( $same_as );
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
        'url' => afct_get_canonical_url(),
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
    if ( is_front_page() || is_page_template( 'template-film.php' ) ) {
        $film    = afct_get_film_schema();
        $video   = afct_get_video_schema();
        $podcast = is_front_page() ? afct_get_podcast_schema() : null;
        $person = is_front_page() ? afct_get_serati_schema() : null;

        foreach ( array( $film, $video, $podcast, $person ) as $schema ) {
            if ( $schema ) {
                $schemas[] = $schema;
            }
        }
    }

    // Output as JSON-LD
    echo '<script type="application/ld+json">' . "\n";
    echo wp_json_encode($schemas, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    echo "\n" . '</script>' . "\n";
}

/**
 * Auto-generate llms.txt content from WordPress data.
 * Called as a fallback when no custom content has been saved.
 */
function afct_auto_generate_llms_txt() {
    $site_name = get_bloginfo( 'name' );
    $site_desc = get_bloginfo( 'description' );
    $home_url  = trailingslashit( home_url() );

    // Blockquote summary: prefer homepage excerpt, fall back to tagline
    $homepage_id = get_option( 'page_on_front' );
    $intro = $homepage_id
        ? wp_strip_all_tags( get_the_excerpt( $homepage_id ) )
        : $site_desc;

    $lines   = array();
    $lines[] = '# ' . $site_name;
    $lines[] = '';
    if ( $intro ) {
        $lines[] = '> ' . $intro;
        $lines[] = '';
    }

    // Thematic context — appears in the body before H2 sections
    $lines[] = 'African Face, Colonial Tongue is a South African artivism project exploring linguistic identity, cultural belonging, and the legacy of Apartheid. Writer and performer Serati Maseko examines how the language you speak — or fail to speak — shapes your place in post-Apartheid South Africa. The project spans a short film, a companion podcast series, an interactive historical timeline, and a photography collection.';
    $lines[] = '';

    // ── Sections ─────────────────────────────────────────────────────────
    $menu_items = afct_get_homepage_sections();

    // Categorise menu items by template for grouped sections
    $film_items      = array();
    $podcast_items   = array();
    $history_items   = array();
    $gallery_items   = array();
    $other_items     = array();

    $film_templates    = array( 'template-film.php', 'template-herovideo.php' );
    $podcast_templates = array( 'template-podcast.php' );
    $history_templates = array( 'template-history.php' );
    $gallery_templates = array( 'template-gallery.php' );

    foreach ( $menu_items as $item ) {
        $page = get_post( $item->object_id );
        if ( ! $page ) continue;
        $tpl = get_page_template_slug( $page->ID );
        if ( in_array( $tpl, $film_templates, true ) ) {
            $film_items[] = $item;
        } elseif ( in_array( $tpl, $podcast_templates, true ) ) {
            $podcast_items[] = $item;
        } elseif ( in_array( $tpl, $history_templates, true ) ) {
            $history_items[] = $item;
        } elseif ( in_array( $tpl, $gallery_templates, true ) ) {
            $gallery_items[] = $item;
        } else {
            $other_items[] = $item;
        }
    }

    // Helper: emit a list item for a menu item
    $emit_item = function( $item ) use ( $home_url ) {
        $page    = get_post( $item->object_id );
        $excerpt = wp_strip_all_tags( get_the_excerpt( $page->ID ) );
        $url     = $home_url . '#section-' . $page->post_name;
        $label   = $item->title ?: $page->post_title;
        $line    = '- [' . $label . '](' . $url . ')';
        if ( $excerpt ) {
            $line .= ': ' . $excerpt;
        }
        return $line;
    };

    // ── The Film ─────────────────────────────────────────────────────────
    $lines[] = '## The Film';
    $lines[] = '';
    $lines[] = 'A short narrative film written and performed by Serati Maseko, directed by Jens Sage, shot on location in South Africa. The film confronts the tensions of navigating Afrikaans, English, and indigenous languages as markers of identity, belonging, and power.';
    $lines[] = '';
    foreach ( $film_items as $item ) {
        $lines[] = $emit_item( $item );
    }
    // About Serati belongs here too — pull from other_items if present
    foreach ( $other_items as $item ) {
        $page = get_post( $item->object_id );
        if ( $page && strpos( $page->post_name, 'serati' ) !== false ) {
            $lines[] = $emit_item( $item );
        }
    }
    $lines[] = '';

    // ── The Podcast ──────────────────────────────────────────────────────
    $lines[] = '## The Podcast';
    $lines[] = '';
    $lines[] = 'A companion podcast series hosted by Serati Maseko. Four conversations with South Africans who share similar upbringings but vastly different relationships to language, identity, and culture.';
    $lines[] = '';
    foreach ( $podcast_items as $item ) {
        $lines[] = $emit_item( $item );
    }
    $lines[] = '- [Listen on Spotify](https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7): Full podcast series';
    $lines[] = '- [Listen on Apple Podcasts](https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874): Full podcast series';
    $lines[] = '';

    // ── History Timeline ─────────────────────────────────────────────────
    if ( $history_items ) {
        $lines[] = '## The History';
        $lines[] = '';
        $lines[] = 'An interactive visual timeline mapping key events in South Africa\'s linguistic and cultural history — from colonisation through Apartheid to the present day.';
        $lines[] = '';
        foreach ( $history_items as $item ) {
            $lines[] = $emit_item( $item );
        }
        $lines[] = '';
    }

    // ── Photography ──────────────────────────────────────────────────────
    if ( $gallery_items ) {
        $lines[] = '## Photography';
        $lines[] = '';
        $lines[] = 'Production stills photographed by Steve Marais during the film shoot in South Africa.';
        $lines[] = '';
        foreach ( $gallery_items as $item ) {
            $lines[] = $emit_item( $item );
        }
        $lines[] = '';
    }

    // ── Other sections ───────────────────────────────────────────────────
    $remaining = array_filter( $other_items, function( $item ) {
        $page = get_post( $item->object_id );
        return $page && strpos( $page->post_name, 'serati' ) === false;
    } );
    if ( $remaining ) {
        $lines[] = '## More';
        $lines[] = '';
        foreach ( $remaining as $item ) {
            $lines[] = $emit_item( $item );
        }
        $lines[] = '';
    }

    // ── Credits ──────────────────────────────────────────────────────────
    $credits_file = get_template_directory() . '/credits.json';
    if ( file_exists( $credits_file ) ) {
        $credits = json_decode( file_get_contents( $credits_file ), true );
        if ( $credits ) {
            $lines[] = '## Credits';
            $lines[] = '';
            if ( ! empty( $credits['film_team'] ) ) {
                $lines[] = '**Film**';
                $lines[] = '';
                foreach ( $credits['film_team'] as $role => $name ) {
                    $lines[] = '- ' . $role . ': ' . $name;
                }
                $lines[] = '';
            }
            if ( ! empty( $credits['podcast_team'] ) ) {
                $lines[] = '**Podcast**';
                $lines[] = '';
                foreach ( $credits['podcast_team'] as $role => $name ) {
                    $lines[] = '- ' . $role . ': ' . $name;
                }
                $lines[] = '';
            }
        }
    }

    // ── Optional (skippable for LLMs) ────────────────────────────────────
    $lines[] = '## Optional';
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

/** Redirect the legacy sitemap to the CMS's paginated canonical sitemap. */
add_action( 'template_redirect', function () {
    $path = wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
    if ( $path !== wp_parse_url( home_url( '/sitemap.xml' ), PHP_URL_PATH ) ) {
        return;
    }
    wp_safe_redirect( home_url( '/wp-sitemap.xml' ), 301 );
    exit;
} );

function afct_get_canonical_url() {
    if ( is_404() || is_search() ) {
        return '';
    }
    if ( is_singular() ) {
        return wp_get_canonical_url( get_queried_object_id() ) ?: get_permalink( get_queried_object_id() );
    }

    return preg_replace( '/[?#].*$/', '', get_pagenum_link( max( 1, (int) get_query_var( 'paged' ) ), false ) );
}

add_action( 'wp', function () {
    foreach ( array( 'WPSEO_VERSION', 'RANK_MATH_VERSION', 'AIOSEO_VERSION', 'SEOPRESS_VERSION' ) as $plugin ) {
        if ( defined( $plugin ) ) {
            return;
        }
    }
    remove_action( 'wp_head', 'rel_canonical' );
    add_action( 'wp_head', 'afct_output_seo_meta_tags', 5 );
    add_action( 'wp_head', 'afct_output_structured_data', 6 );
} );

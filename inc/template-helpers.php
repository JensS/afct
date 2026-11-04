<?php
// Helper functions for templates

/** Public page sections, shared by rendering, navigation and structured data. */
function afct_get_homepage_sections( $include_experimental = false ) {
    static $sections = array();
    $key = (int) $include_experimental;
    if ( isset( $sections[ $key ] ) ) {
        return $sections[ $key ];
    }

    $locations = get_nav_menu_locations();
    $items = empty( $locations['menu-1'] ) ? array() : wp_get_nav_menu_items( $locations['menu-1'] );
    $sections[ $key ] = array();
    $seen = array();

    foreach ( (array) $items as $item ) {
        if ( $item->type !== 'post_type' || $item->object !== 'page' ) {
            continue;
        }
        if ( ! $include_experimental && get_post_meta( $item->ID, '_afct_menu_experimental', true ) === '1' ) {
            continue;
        }

        $page = get_post( $item->object_id );
        if ( ! $page || $page->post_status !== 'publish' || $page->post_password !== '' || isset( $seen[ $page->ID ] ) ) {
            continue;
        }
        if ( get_page_template_slug( $page ) === 'template-homepage.php' ) {
            continue;
        }

        $sections[ $key ][] = $item;
        $seen[ $page->ID ] = true;
    }

    return $sections[ $key ];
}

/** Accept supported YouTube URLs and return a validated video identifier. */
function afct_get_youtube_id( $url ) {
    $parts = wp_parse_url( (string) $url );
    if ( ! is_array( $parts ) || empty( $parts['host'] ) ) {
        return '';
    }

    $host = strtolower( $parts['host'] );
    $path = trim( $parts['path'] ?? '', '/' );
    $video_id = '';
    if ( in_array( $host, array( 'youtu.be', 'www.youtu.be' ), true ) ) {
        $video_id = $path;
    }
    if ( in_array( $host, array( 'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com' ), true ) ) {
        parse_str( $parts['query'] ?? '', $query );
        $video_id = $query['v'] ?? '';
        if ( preg_match( '~^(?:embed|shorts|live)/([^/]+)$~', $path, $matches ) ) {
            $video_id = $matches[1];
        }
    }

    return is_string( $video_id ) && preg_match( '/^[a-zA-Z0-9_-]{11}$/', $video_id ) ? $video_id : '';
}

/**
 * Render the v2 centered section headline.
 *
 * Line 1 (upper) is Gambetta serif, flush left of the group.
 * Line 2 (lower) is Gill Sans, flush right of the group.
 * Pass $variant = 'serif' for sections whose second line stays serif
 * (About Serati, Support Serati, Read the Essay).
 */
function afct_render_section_headline( $title, $variant = 'sans' ) {
    // Serif-line-2 headlines carry a middle article on the upper line
    // ("Read the | Essay"); sans ones lead the lower line with it
    // ("Watch | the Film").
    $article_break = ( 'serif' === $variant ) ? 'upper' : 'lower';
    $parts = afct_split_headline( afct_lowercase_articles( $title ), $article_break );
    $class = 'section-headline' . ( 'serif' === $variant ? ' section-headline--serif' : '' );
    $tag = defined( 'IN_ONEPAGER' ) ? 'h2' : 'h1';
    ?>
    <div class="<?php echo esc_attr( $class ); ?>">
        <<?php echo $tag; ?>>
            <span class="hl-a"><?php echo esc_html( $parts['upper'] ); ?></span>
            <span class="hl-b"><?php echo esc_html( $parts['lower'] ); ?></span>
        </<?php echo $tag; ?>>
    </div>
    <?php
}

/**
 * Lowercase articles/short connectors after the first word, matching the
 * design's headline casing ("Watch the Film", "Listen to the Podcast").
 * Page titles in WP stay title-case; this only affects display.
 */
function afct_lowercase_articles( $title ) {
    $words = preg_split( '/\s+/', trim( $title ) );
    foreach ( $words as $i => $word ) {
        if ( $i > 0 && preg_match( '/^(The|To|A|An|Of|And|In|On)$/', $word ) ) {
            $words[ $i ] = strtolower( $word );
        }
    }
    return implode( ' ', $words );
}

function afct_get_team_credits() {
    $credits_file = get_template_directory() . '/credits.json';
    if (file_exists($credits_file)) {
        $credits_json = file_get_contents($credits_file);
        $credits = json_decode($credits_json, true);
        return is_array($credits) ? $credits : array();
    }
    return array();
}

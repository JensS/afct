<?php
/** Static asset delivery. Stored media URLs and CMS endpoints stay on the origin. */

function afct_get_cdn_url() {
    if ( is_admin() ) {
        return '';
    }

    $host = strtolower( (string) wp_parse_url( home_url( '/' ), PHP_URL_HOST ) );
    if ( ! in_array( $host, array( 'africanface.org', 'www.africanface.org' ), true ) ) {
        return '';
    }

    // An empty value in wp-config.php provides an immediate origin-only rollback.
    $url = defined( 'AFCT_CDN_URL' ) ? AFCT_CDN_URL : 'https://africanface.b-cdn.net';
    return is_string( $url ) ? rtrim( $url, '/' ) : '';
}

/** Rewrite only public static files, preserving version queries and fragments. */
function afct_cdn_url( $url ) {
    $cdn = afct_get_cdn_url();
    if ( ! $cdn || ! is_string( $url ) || $url === '' ) {
        return $url;
    }

    $parts = wp_parse_url( $url );
    if ( ! is_array( $parts ) || isset( $parts['user'] ) || isset( $parts['pass'] ) || isset( $parts['port'] ) ) {
        return $url;
    }
    if ( isset( $parts['scheme'] ) && ! in_array( strtolower( $parts['scheme'] ), array( 'http', 'https' ), true ) ) {
        return $url;
    }
    if ( isset( $parts['host'] ) && ! in_array( strtolower( $parts['host'] ), array( 'africanface.org', 'www.africanface.org' ), true ) ) {
        return $url;
    }

    $path = $parts['path'] ?? '';
    $decoded_path = rawurldecode( $path );
    if ( ! preg_match( '~^/(?:wp-content/(?:themes|plugins|uploads)/|wp-includes/).+\.(?:css|js|json|jpe?g|png|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|m4a|ogg|wav|pdf)$~i', $decoded_path )
        || preg_match( '~(?:^|/)\.{1,2}(?:/|$)|[\\\\\x00-\x20]~', $decoded_path ) ) {
        return $url;
    }

    return $cdn . $path
        . ( isset( $parts['query'] ) ? '?' . $parts['query'] : '' )
        . ( isset( $parts['fragment'] ) ? '#' . $parts['fragment'] : '' );
}
add_filter( 'script_loader_src', 'afct_cdn_url', 20 );
add_filter( 'style_loader_src', 'afct_cdn_url', 20 );

/** Run after the WebP wrapper, so filesystem checks still use origin URLs. */
function afct_cdn_media_html( $html ) {
    if ( ! afct_get_cdn_url() ) {
        return $html;
    }

    return preg_replace_callback( '~(?<![\w:-])(?:src|srcset|poster)\s*=\s*([\'"])(.*?)\1~is', function ( $attribute ) {
        return str_replace( $attribute[2], afct_cdn_srcset( $attribute[2] ), $attribute[0] );
    }, $html );
}
add_filter( 'wp_get_attachment_image', 'afct_cdn_media_html', 20 );
add_filter( 'the_content', 'afct_cdn_media_html', 20 );

function afct_cdn_srcset( $srcset ) {
    return preg_replace_callback( '~(?:https?:)?//[^\s,\'"]+|(?<![^\s])/[^\s,\'"]+~i', function ( $match ) {
        return afct_cdn_url( $match[0] );
    }, $srcset );
}

/** Start the CDN connection and discover the two above-the-fold fonts early. */
function afct_preload_fonts() {
    $cdn = afct_get_cdn_url();
    if ( $cdn ) {
        echo '<link rel="preconnect" href="' . esc_url( $cdn ) . '" crossorigin>' . "\n";
        echo '<link rel="preconnect" href="' . esc_url( $cdn ) . '">' . "\n";
    }
    foreach ( array( '/fonts/gambetta/Gambetta-Variable.woff2', '/fonts/gill-sans/Gill-Sans.woff2' ) as $font ) {
        echo '<link rel="preload" href="' . esc_url( afct_cdn_url( get_template_directory_uri() . $font ) ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
    }
}
add_action( 'wp_head', 'afct_preload_fonts', 2 );

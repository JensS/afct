<?php
/**
 * AFCT functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package AFCT
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '4' );
}


function afct_setup() {
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'afct' ),
		)
	);

	add_theme_support(
		'html5',
		array(
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	add_theme_support( 'title-tag' );
	add_theme_support( 'responsive-embeds' );

	// Enable featured images (thumbnails) for posts and pages
	add_theme_support( 'post-thumbnails' );

	// Enable excerpt field for pages (for meta descriptions)
	add_post_type_support( 'page', 'excerpt' );
}
add_action( 'after_setup_theme', 'afct_setup' );
add_filter( 'show_admin_bar', '__return_false' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function afct_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'afct_content_width', 640 );
}
add_action( 'after_setup_theme', 'afct_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function afct_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'afct' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'afct' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'afct_widgets_init' );

/**
 * Get version string for asset files
 * Uses file modification time to bypass browser caching
 */
function afct_get_version_string($file_path) {
    // Get the absolute path to the file
    $absolute_path = get_template_directory() . $file_path;
    
    // Check if file exists and get its modification time
    if (file_exists($absolute_path)) {
        // Use file modification time as version
        return filemtime($absolute_path);
    }
    
    // Fallback to theme version if file doesn't exist
    return wp_get_theme()->get('Version');
}

/**
 * Add cache headers for static assets
 */
function afct_add_cache_headers() {
    // Only add cache headers for static assets
    if (is_admin() || is_user_logged_in()) {
        return;
    }
    
    // Set cache headers for static assets
    $cache_time = 31536000; // 1 year in seconds
    
    // Add cache headers for CSS and JS files
    add_action('wp_loaded', function() use ($cache_time) {
        if (strpos($_SERVER['REQUEST_URI'], '.css') !== false || 
            strpos($_SERVER['REQUEST_URI'], '.js') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.woff') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.woff2') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.ttf') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.eot') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.svg') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.png') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.jpg') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.jpeg') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.gif') !== false ||
            strpos($_SERVER['REQUEST_URI'], '.webp') !== false) {
            
            header('Cache-Control: public, max-age=' . $cache_time);
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $cache_time) . ' GMT');
            header('Pragma: cache');
        }
    });
}
add_action('init', 'afct_add_cache_headers');

/**
 * Add defer attribute to scripts for better performance
 */
function afct_defer_scripts($tag, $handle, $src) {
    // List of scripts to defer
    $defer_scripts = array('afct', 'youtube-consent');
    
    if (in_array($handle, $defer_scripts)) {
        return str_replace('<script ', '<script defer ', $tag);
    }
    
    return $tag;
}
add_filter('script_loader_tag', 'afct_defer_scripts', 10, 3);

/**
 * Optimize jQuery loading to reduce forced reflow
 */
function afct_optimize_jquery() {
    if (!is_admin()) {
        // Deregister default jQuery and register optimized version
        wp_deregister_script('jquery');
        wp_deregister_script('jquery-migrate');
        
        // Register jQuery from CDN with defer attribute for better performance
        wp_register_script('jquery', 'https://code.jquery.com/jquery-3.6.3.min.js', array(), '3.6.3', true);
        wp_enqueue_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'afct_optimize_jquery', 1);

/**
 * Inline critical CSS to reduce render blocking
 */
function afct_inline_critical_css() {
    // Only inline on front-end
    if (is_admin()) {
        return;
    }
    
    // Critical CSS for above-the-fold content
    $critical_css = '
    <style id="critical-css">
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .global-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    h1.headline-a, h1.headline-b { font-size: 48px; line-height: 1.2; margin: 0 0 1rem 0; }
    .hero-wrapper { min-height: 50vh; display: flex; align-items: center; }
    @media (min-width: 768px) {
        h1.headline-a, h1.headline-b { font-size: 64px; }
    }
    @media (min-width: 992px) {
        h1.headline-a, h1.headline-b { font-size: 96px; }
    }
    </style>
    ';
    
    echo $critical_css;
}
add_action('wp_head', 'afct_inline_critical_css', 1);

/**
 * Load non-critical CSS asynchronously
 */
function afct_async_css($tag, $handle, $href, $media) {
    // List of stylesheets to load asynchronously
    $async_styles = array('afct-style', 'afct-bundle');
    
    if (in_array($handle, $async_styles)) {
        // Load CSS asynchronously with fallback
        return '<link rel="preload" href="' . $href . '" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" id="' . $handle . '-css">' . 
               '<noscript><link rel="stylesheet" href="' . $href . '" id="' . $handle . '-css-noscript"></noscript>';
    }
    
    return $tag;
}
add_filter('style_loader_tag', 'afct_async_css', 10, 4);

/**
 * Enqueue scripts and styles.
 */
function afct_scripts() {
    // Enqueue styles (will be loaded asynchronously via filter)
    wp_enqueue_style('afct-style', get_stylesheet_uri(), array(), afct_get_version_string("/style.css"));
    wp_enqueue_style('afct-bundle', get_template_directory_uri() . "/dist/bundle.min.css", array(), afct_get_version_string("/dist/bundle.min.css"));

    // Use original bundled JS with GSAP libraries included and performance optimizations applied
    wp_enqueue_script('afct', get_template_directory_uri() . '/dist/afct.min.js', array('jquery'), afct_get_version_string('/dist/afct.min.js'), true);
	wp_localize_script('afct', 'afctSettings', array(
		'templateUrl' => get_template_directory_uri(),
		"historyDataUrl" => rest_url('afct/v1/history'),
		"historyNonce" => wp_create_nonce('wp_rest')
	));
	
	// Enqueue YouTube consent script in footer
	wp_enqueue_script('youtube-consent', get_template_directory_uri() . '/js/youtube-consent.js', array(), afct_get_version_string('/js/youtube-consent.js'), true);

   

}
add_action('wp_enqueue_scripts', 'afct_scripts');


// ---------------------------------------------------------------------------
// WebP Image Conversion
// ---------------------------------------------------------------------------

/**
 * Convert a single image file to WebP and save it alongside the original.
 *
 * @param string $source_path Absolute path to the source image.
 * @param string $mime_type   MIME type of the source image.
 */
function afct_convert_image_to_webp( $source_path, $mime_type ) {
    $webp_path = preg_replace( '/\.[^.]+$/', '.webp', $source_path );
    if ( file_exists( $webp_path ) || ! function_exists( 'imagewebp' ) ) {
        return;
    }
    switch ( $mime_type ) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg( $source_path );
            break;
        case 'image/png':
            $image = imagecreatefrompng( $source_path );
            if ( $image ) {
                imagealphablending( $image, false );
                imagesavealpha( $image, true );
            }
            break;
        default:
            return;
    }
    if ( ! $image ) {
        return;
    }
    imagewebp( $image, $webp_path, 82 );
    imagedestroy( $image );
}

/**
 * Generate WebP versions for all sizes when an image is uploaded.
 */
function afct_generate_webp_on_upload( $metadata, $attachment_id ) {
    $mime_type = get_post_mime_type( $attachment_id );
    if ( ! in_array( $mime_type, array( 'image/jpeg', 'image/png' ), true ) ) {
        return $metadata;
    }

    $upload_dir = wp_upload_dir();
    $base_dir   = $upload_dir['basedir'];

    // Full-size image
    if ( ! empty( $metadata['file'] ) ) {
        afct_convert_image_to_webp( $base_dir . '/' . $metadata['file'], $mime_type );
    }

    // Intermediate sizes
    if ( ! empty( $metadata['sizes'] ) && ! empty( $metadata['file'] ) ) {
        $sub_dir = trailingslashit( $base_dir . '/' . dirname( $metadata['file'] ) );
        foreach ( $metadata['sizes'] as $size ) {
            if ( ! empty( $size['file'] ) ) {
                afct_convert_image_to_webp( $sub_dir . $size['file'], $mime_type );
            }
        }
    }

    return $metadata;
}
add_filter( 'wp_generate_attachment_metadata', 'afct_generate_webp_on_upload', 10, 2 );

/**
 * Wrap attachment images in <picture><source type="image/webp"> for browsers
 * that support WebP. Only runs on the front end. Falls back silently when the
 * WebP counterpart does not exist on disk.
 */
function afct_wrap_image_in_picture( $html, $attachment_id, $size, $icon ) {
    if ( is_admin() || $icon ) {
        return $html;
    }

    $mime_type = get_post_mime_type( $attachment_id );
    if ( ! in_array( $mime_type, array( 'image/jpeg', 'image/png' ), true ) ) {
        return $html;
    }

    // Extract the img src
    if ( ! preg_match( '/src=["\']([^"\']+)["\']/', $html, $src_match ) ) {
        return $html;
    }

    $upload_dir  = wp_upload_dir();
    $base_url    = untrailingslashit( $upload_dir['baseurl'] );
    $base_dir    = untrailingslashit( $upload_dir['basedir'] );
    $img_url     = $src_match[1];
    $rel         = str_replace( $base_url, '', $img_url );
    $webp_rel    = preg_replace( '/\.[^.]+$/', '.webp', $rel );

    if ( ! file_exists( $base_dir . $webp_rel ) ) {
        return $html;
    }

    $webp_url = $base_url . $webp_rel;

    // Build WebP srcset when present
    $webp_srcset = '';
    if ( preg_match( '/srcset=["\']([^"\']+)["\']/', $html, $srcset_match ) ) {
        $entries = array_map( 'trim', explode( ',', $srcset_match[1] ) );
        $webp_entries = array();
        foreach ( $entries as $entry ) {
            $parts      = preg_split( '/\s+/', $entry, 2 );
            $entry_url  = $parts[0];
            $descriptor = isset( $parts[1] ) ? ' ' . $parts[1] : '';
            $entry_rel  = str_replace( $base_url, '', $entry_url );
            $entry_webp = preg_replace( '/\.[^.]+$/', '.webp', $entry_rel );
            if ( file_exists( $base_dir . $entry_webp ) ) {
                $webp_entries[] = $base_url . $entry_webp . $descriptor;
            }
        }
        if ( ! empty( $webp_entries ) ) {
            $webp_srcset = implode( ', ', $webp_entries );
        }
    }

    $source = '<source type="image/webp"';
    if ( $webp_srcset ) {
        $source .= ' srcset="' . esc_attr( $webp_srcset ) . '"';
        if ( preg_match( '/sizes=["\']([^"\']+)["\']/', $html, $sizes_match ) ) {
            $source .= ' sizes="' . esc_attr( $sizes_match[1] ) . '"';
        }
    } else {
        $source .= ' srcset="' . esc_url( $webp_url ) . '"';
    }
    $source .= '>';

    return '<picture>' . $source . $html . '</picture>';
}
add_filter( 'wp_get_attachment_image', 'afct_wrap_image_in_picture', 10, 4 );

// ---------------------------------------------------------------------------

require_once get_template_directory() . '/inc/class-afct-menu-walker.php';
require_once get_template_directory() . '/inc/admin-menu-experimental.php';
require_once get_template_directory() . '/inc/admin-webp-convert.php';
require_once get_template_directory() . '/inc/admin-awards.php';
require_once get_template_directory() . '/inc/admin-llms-txt.php';
require_once get_template_directory() . '/inc/admin-sitemap-xml.php';
require_once get_template_directory() . '/inc/admin-serati.php';

function afct_body_classes( $classes ) {
	// Adds a class of hfeed to non-singular pages.
	if ( ! is_singular() ) {
		$classes[] = 'hfeed';
	}

	// Adds a class of no-sidebar when there is no sidebar present.
	if ( ! is_active_sidebar( 'sidebar-1' ) ) {
		$classes[] = 'no-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'afct_body_classes' );

/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function afct_pingback_header() {
	if ( is_singular() && pings_open() ) {
		printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
	}
}
add_action( 'wp_head', 'afct_pingback_header' );


/**
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function afct_customize_register( $wp_customize ) {
	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
	$wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';

	if ( isset( $wp_customize->selective_refresh ) ) {
		$wp_customize->selective_refresh->add_partial(
			'blogname',
			array(
				'selector'        => '.site-title a',
				'render_callback' => 'afct_customize_partial_blogname',
			)
		);
		$wp_customize->selective_refresh->add_partial(
			'blogdescription',
			array(
				'selector'        => '.site-description',
				'render_callback' => 'afct_customize_partial_blogdescription',
			)
		);
	}
}
add_action( 'customize_register', 'afct_customize_register' );

/**
 * Render the site title for the selective refresh partial.
 *
 * @return void
 */
function afct_customize_partial_blogname() {
	bloginfo( 'name' );
}

/**
 * Render the site tagline for the selective refresh partial.
 *
 * @return void
 */
function afct_customize_partial_blogdescription() {
	bloginfo( 'description' );
}

/**
 * Disable the emoji's
 */
function disable_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );	
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );	
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'disable_emojis' );

function afct_remove_editor_for_templates() {
    $post_id = null;
    if (isset($_GET['post'])) {
        $post_id = $_GET['post'];
    } else if (isset($_POST['post_ID'])) {
        $post_id = $_POST['post_ID'];
    }

    if ($post_id) {
        $template_file = get_post_meta($post_id, '_wp_page_template', true);
        if ($template_file !== 'page-generic.php') {
            remove_post_type_support('page', 'editor');
        }
    } 
}
add_action('admin_init', 'afct_remove_editor_for_templates');
/**	
 * hide footer cause it overlays some of our forms
 */
function my_footer_shh() {
        remove_filter( 'update_footer', 'core_update_footer' ); 
}
add_action( 'admin_menu', 'my_footer_shh' );
/**	
 * hide the other footer cause it overlays some of our forms
 */
function remove_footer_admin () 
{
    echo '';
}
 
add_filter('admin_footer_text', 'remove_footer_admin');

add_action('check_ajax_referer', 'prevent_meta_box_order');
function prevent_meta_box_order($action)
{
    if ('meta-box-order' == $action /* && $wp_user == 'santa claus' */) {
        die('-1');
    }
}

function fb_remove_postbox() {
    wp_deregister_script('postbox');
}
// add_action( 'admin_init', 'fb_remove_postbox' );


// Include admin files
require_once get_template_directory() . '/inc/admin-homepage.php';


function afct_enqueue_admin_scripts() {
    global $typenow;
    global $post;
    
    // Always enqueue these scripts for admin
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
    wp_enqueue_script('jquery-ui-dialog');
    wp_enqueue_style('jquery-ui-styles', get_template_directory_uri() . '/css/jquery-ui.css');
    
    // Always enqueue the prospect carousel admin script on post/page edit screens
    // Check if we're on a post or page edit screen using the pagenow global
    $pagenow = isset($GLOBALS['pagenow']) ? $GLOBALS['pagenow'] : '';
    
    if (is_admin() && ($pagenow == 'post.php' || $pagenow == 'post-new.php')) {
        // Enqueue the script for all post/page edit screens
        wp_enqueue_script(
            'afct-prospect-carousel-admin',
            get_template_directory_uri() . '/js/admin-prospect-carousel.js',
            array('jquery', 'jquery-ui-sortable', 'wp-util'),
            filemtime(get_template_directory() . '/js/admin-prospect-carousel.js'),
            true
        );
    }
    
    // Check if we are on the History page template edit screen
    $template_file = $post ? get_post_meta($post->ID, '_wp_page_template', true) : '';
    if ($post && $template_file === 'template-history.php') {
                                                     
        wp_enqueue_script('d3', 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', array(), '7.9.0', true);
        wp_enqueue_script('topojson', 'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js', array('d3'), '3.0.2', true);

            // Enqueue History Admin CSS                                                                                                                                                      
            wp_enqueue_style(                                                                                                                                                                 
                'afct-admin-history-style',                                                                                                                                                   
                get_template_directory_uri() . '/css/admin-history.css',                                                                                                                      
                [], // Dependencies                                                                                                                                                           
                filemtime(get_template_directory() . '/css/admin-history.css') // Versioning                                                                                                  
            );                                                                                                                                                                                
                                                                                                                                                                                              
            // Enqueue History Admin JS                                                                                                                                                       
            wp_enqueue_script(                                                                                                                                                                
                'afct-admin-history-script',                                                                                                                                                  
                get_template_directory_uri() . '/js/admin-history.js',                                                                                                                        
                ['jquery', 'jquery-ui-sortable', 'd3', 'topojson'], // Dependencies already enqueued above                                                                                    
                filemtime(get_template_directory() . '/js/admin-history.js'), // Versioning                                                                                                   
                true // Load in footer                                                                                                                                                        
            );
            
            // Enqueue History JSON Upload JS
            wp_enqueue_script(
                'afct-history-json-upload',
                get_template_directory_uri() . '/js/admin-history-json-upload.js',
                ['jquery', 'wp-util'], // Dependencies
                filemtime(get_template_directory() . '/js/admin-history-json-upload.js'), // Versioning
                true // Load in footer
            );
            
            // Enqueue Dashicons for the upload button
            wp_enqueue_style('dashicons');
                                                                                                                                                                                              
            // Localize Data for History Admin JS                                                                                                                                             
            $zoom_options = [                                                                                                                                                                 
                'south_africa' => 'South Africa',                                                                                                                                             
                'africa' => 'Africa',                                                                                                                                                         
                'europe_and_africa' => 'Europe and Africa'                                                                                                                                    
            ];                                                                                                                                                                                
            $visualization_types = [                                                                                                                                                          
                'arrow' => 'Arrow (Origin → Destination)',                                                                                                                                    
                'dot' => 'Single Point',                                                                                                                                                      
                'dots' => 'Multiple Points'                                                                                                                                                   
            ];                                                                                                                                                                                
            $topojson_url = get_template_directory_uri() . '/js/countries-110m.json'; // Adjust path if needed                                                                                
                                                                                                                                                                                              
            wp_localize_script(                                                                                                                                                               
                'afct-admin-history-script', // Handle for the script that needs the data                                                                                                     
                'afctHistoryAdminData',    // JavaScript object name                                                                                                                          
                [                                                                                                                                                                             
                    'zoomOptions'        => $zoom_options,                                                                                                                                    
                    'visualizationTypes' => $visualization_types,                                                                                                                             
                    'topoJsonUrl'        => $topojson_url,                                                                                                                                    
                    // 'nonce' => wp_create_nonce('your_ajax_nonce_action') // Add nonce if needed later                                                                                      
                ]                                                                                                                                                                             
            );                                                                                                                                                                                
        }        
}
add_action('admin_enqueue_scripts', 'afct_enqueue_admin_scripts');

require_once get_template_directory() . '/inc/custom-meta-boxes.php';
require_once get_template_directory() . '/inc/custom-add-metaboxes.php';
require_once get_template_directory() . '/inc/template-helpers.php';
require_once get_template_directory() . '/inc/admin-gallery.php';
require_once get_template_directory() . '/inc/admin-intro.php';
require_once get_template_directory() . '/inc/admin-herovideo.php';
require_once get_template_directory() . '/inc/admin-podcasts.php';
require_once get_template_directory() . '/inc/admin-history.php';
require_once get_template_directory() . '/inc/rest-api-history.php';
require_once get_template_directory() . '/inc/admin-prospect.php';
require_once get_template_directory() . '/inc/seo-meta.php';
require_once get_template_directory() . '/inc/user-profile-fields.php';

/**
 * Split page title into two parts for the two-part headline display
 * 
 * @param string $title The page title to split
 * @return array Array with 'upper' and 'lower' parts of the headline
 */
function afct_split_headline($title) {
    // Remove any HTML and decode entities
    $clean_title = wp_strip_all_tags(html_entity_decode($title));
    
    // Check for forward slash delimiter
    if (strpos($clean_title, ',') !== false) {
        $parts = array_map('trim', explode(',', $clean_title));
        return array(
            'upper' => $parts[0],
            'lower' => $parts[1] ?? ''
        );
    }
    
    // Split into words
    $words = array_filter(explode(' ', $clean_title));
    $word_count = count($words);
    
    // Handle single word
    if ($word_count === 1) {
        return array(
            'upper' => 'The',
            'lower' => $clean_title
        );
    }
    
    // Handle multiple words
    // For two words, split them
    // For more than two words, split at midpoint
    $midpoint = ceil($word_count / 2);
    $upper_words = array_slice($words, 0, $midpoint);
    $lower_words = array_slice($words, $midpoint);
    
    return array(
        'upper' => implode(' ', $upper_words),
        'lower' => implode(' ', $lower_words)
    );
}

function afct_remove_protected_prefix( $format ) {
    return '%s';
}
add_filter( 'protected_title_format', 'afct_remove_protected_prefix' );

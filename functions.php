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
}
add_action( 'after_setup_theme', 'afct_setup' );

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
 * Enqueue scripts and styles.
 */
function afct_scripts() {
    // Enqueue modular CSS files
    wp_enqueue_style('afct-components', get_template_directory_uri() . '/css/components.css', array(), afct_get_version_string('/css/components.css'));
    wp_enqueue_style('afct-responsive', get_template_directory_uri() . '/css/responsive.css', array(), afct_get_version_string('/css/responsive.css'));
	wp_enqueue_style('afct-history', get_template_directory_uri() . '/css/history.css', array(), afct_get_version_string('/css/history.css'));
    
    // Main stylesheet
    wp_enqueue_style('afct', get_stylesheet_uri(), array(), afct_get_version_string('/style.css'));
    wp_enqueue_script('headline-positioning', get_template_directory_uri() . '/js/headline-positioning.js', array(), afct_get_version_string('/js/headline-positioning.js'), true);
    wp_enqueue_script('youtube-consent', get_template_directory_uri() . '/js/youtube-consent.js', array(), afct_get_version_string('/js/youtube-consent.js'), true);
	wp_enqueue_script('d3', get_template_directory_uri() . '/js/d3.min.js', array(), '7.9', true);
	wp_enqueue_script('topojson',  get_template_directory_uri() . '/js/topojson.min.js', array('d3'), '3.0', true);
	


    wp_enqueue_script('afct', get_template_directory_uri() . '/js/afct.js', array('jquery',"d3","topojson"), afct_get_version_string('/js/afct.js'), false);
	wp_localize_script('afct', 'afctSettings', array(
		'templateUrl' => get_template_directory_uri(),
		"historyDataUrl" => rest_url('afct/v1/history'),
		"historyNonce" => wp_create_nonce('wp_rest')
	));

}
add_action('wp_enqueue_scripts', 'afct_scripts');


require_once get_template_directory() . '/inc/class-afct-menu-walker.php';

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


function afct_remove_editor_for_templates() {
      remove_post_type_support('page', 'editor');
}
add_action('admin_init', 'afct_remove_editor_for_templates');

// Include admin files
require_once get_template_directory() . '/inc/admin-homepage.php';


function afct_enqueue_admin_scripts() {
    global $typenow;
    if ($typenow == 'page') {
        wp_enqueue_media();
        // Enqueue jQuery UI Sortable and Dialog
        wp_enqueue_script('jquery-ui-sortable');
        wp_enqueue_script('jquery-ui-dialog');

        // Enqueue jQuery UI styles
        wp_enqueue_style('jquery-ui-styles', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');
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

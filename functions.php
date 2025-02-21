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
 * Adds random number in debug mode to prevent caching
 */
function afct_get_version_string() {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        return wp_get_theme()->get('Version') . '.' . mt_rand();
    }
    return wp_get_theme()->get('Version');
}

/**
 * Enqueue scripts and styles.
 */
function afct_scripts() {
    wp_enqueue_style('afct', get_stylesheet_uri(), array(), afct_get_version_string());


    wp_enqueue_script('afct', get_template_directory_uri() . '/js/afct.js', array('jquery'), afct_get_version_string(), true);
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
require_once get_template_directory() . '/inc/admin-podcasts.php';

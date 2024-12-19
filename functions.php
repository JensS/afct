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

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function afct_setup() {
	/*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on AFCT, use a find and replace
		* to change 'afct' to the name of your theme in all the template files.
		*/
	load_theme_textdomain( 'afct', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support( 'title-tag' );

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'afct' ),
		)
	);

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
	add_theme_support(
		'html5',
		array(
			'search-form',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);



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
    wp_enqueue_style('afct-style', get_stylesheet_uri(), array(), afct_get_version_string());
    // Remove enqueues of unused fonts
    wp_enqueue_script('afct-script', get_template_directory_uri() . '/js/afct.js', array('jquery'), afct_get_version_string(), true);
}
add_action('wp_enqueue_scripts', 'afct_scripts');

// Register navigation menus
register_nav_menus(array(
    'primary' => __('Primary Menu', 'afct'),
));

class AFCT_Menu_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        $output .= '<div class="menu-item" style="height:16px">';
        $output .= '<a href="' . $item->url . '" style="opacity:0" class="nav-link">' . $item->title . '</a>';
        $output .= '<div class="embed-menu-line"><svg width="24" height="1" viewBox="0 0 24 1" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="1" transform="matrix(1 0 0 -1 0 1)" fill="currentColor"/></svg></div>';
        $output .= '</div>';
    }
}


/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
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
 * Displays the post thumbnail
 */
function afct_post_thumbnail() {
    if (post_password_required() || is_attachment() || !has_post_thumbnail()) {
        return;
    }

    if (is_singular()) :
        ?>
        <div class="post-thumbnail">
            <?php the_post_thumbnail(); ?>
        </div>
    <?php else : ?>
        <a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php
            the_post_thumbnail('post-thumbnail', array(
                'alt' => the_title_attribute(array(
                    'echo' => false,
                )),
            ));
            ?>
        </a>
    <?php
    endif;
}



/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
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


function afct_podcast_guests_meta_box_callback($post) {
    wp_nonce_field('afct_save_podcast_guests_meta_box_data', 'afct_podcast_guests_meta_box_nonce');
    $podcast_guests = get_post_meta($post->ID, '_afct_podcast_guests', true);
    ?>
    <div id="podcast-guests-wrapper">
        <?php if (!empty($podcast_guests)) : ?>
            <?php foreach ($podcast_guests as $guest) : ?>
                <div class="podcast-guest">
                    <label for="guest_image">Guest Image:</label>
                    <input type="hidden" name="guest_image[]" value="<?php echo esc_attr($guest['image']); ?>" />
                    <button type="button" class="upload_image_button button">Upload Image</button>
                    <?php if ($guest['image']) : ?>
                        <img src="<?php echo esc_url($guest['image']); ?>" alt="<?php echo esc_attr($guest['alt']); ?>" style="max-width: 100px; display: block;" />
                    <?php endif; ?>
                    <label for="guest_alt">Guest Alt Text:</label>
                    <input type="text" name="guest_alt[]" value="<?php echo esc_attr($guest['alt']); ?>" />
                    <button type="button" class="remove-guest">Remove</button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <button type="button" id="add-guest">Add Guest</button>
    <script>
        jQuery(document).ready(function($) {
            $('#add-guest').on('click', function() {
                $('#podcast-guests-wrapper').append('<div class="podcast-guest"><label for="guest_image">Guest Image:</label><input type="hidden" name="guest_image[]" /><button type="button" class="upload_image_button button">Upload Image</button><label for="guest_alt">Guest Alt Text:</label><input type="text" name="guest_alt[]" value="" /><button type="button" class="remove-guest">Remove</button></div>');
            });
            $(document).on('click', '.remove-guest', function() {
                $(this).closest('.podcast-guest').remove();
            });
            $(document).on('click', '.upload_image_button', function(e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    title: 'Select Image',
                    button: {
                        text: 'Use this image'
                    },
                    multiple: false
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    button.prev('input').val(attachment.url);
                    button.next('img').remove();
                    button.after('<img src="' + attachment.url + '" style="max-width: 100px; display: block;" />');
                }).open();
            });
        });
    </script>
    <?php
}

function afct_gallery_images_meta_box_callback($post) {
    wp_nonce_field('afct_save_gallery_images_meta_box_data', 'afct_gallery_images_meta_box_nonce');
    $gallery_images = get_post_meta($post->ID, '_afct_gallery_images', true);
    ?>
    <div id="gallery-images-wrapper">
        <?php if (!empty($gallery_images)) : ?>
            <?php foreach ($gallery_images as $image) : ?>
                <div class="gallery-image">
                    <label for="image_url">Image:</label>
                    <input type="hidden" name="image_url[]" value="<?php echo esc_attr($image['url']); ?>" />
                    <button type="button" class="upload_image_button button">Upload Image</button>
                    <?php if ($image['url']) : ?>
                        <img src="<?php echo esc_url($image['url']); ?>" alt="<?php echo esc_attr($image['alt']); ?>" style="max-width: 100px; display: block;" />
                    <?php endif; ?>
                    <label for="image_alt">Image Alt Text:</label>
                    <input type="text" name="image_alt[]" value="<?php echo esc_attr($image['alt']); ?>" />
                    <button type="button" class="remove-image">Remove</button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <button type="button" id="add-image">Add Image</button>
    <script>
        jQuery(document).ready(function($) {
            $('#add-image').on('click', function() {
                $('#gallery-images-wrapper').append('<div class="gallery-image"><label for="image_url">Image:</label><input type="hidden" name="image_url[]" /><button type="button" class="upload_image_button button">Upload Image</button><label for="image_alt">Image Alt Text:</label><input type="text" name="image_alt[]" value="" /><button type="button" class="remove-image">Remove</button></div>');
            });
            $(document).on('click', '.remove-image', function() {
                $(this).closest('.gallery-image').remove();
            });
            $(document).on('click', '.upload_image_button', function(e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    title: 'Select Image',
                    button: {
                        text: 'Use this image'
                    },
                    multiple: false
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    button.prev('input').val(attachment.url);
                    button.next('img').remove();
                    button.after('<img src="' + attachment.url + '" style="max-width: 100px; display: block;" />');
                }).open();
            });
        });
    </script>
    <?php
}



/**
 * Remove the default editor for the homepage template.
 */
function afct_remove_homepage_editor() {
    if (is_admin()) {
        $post_id = isset($_GET['post']) ? $_GET['post'] : null;
        $template = get_post_meta($post_id, '_wp_page_template', true);
        if ($template == 'template-homepage.php') {
            remove_post_type_support('page', 'editor');
        }
    }
}
add_action('init', 'afct_remove_homepage_editor');



function afct_register_page_templates($templates) {
    $templates['template-podcast.php'] = 'Podcast Template';
    $templates['template-film.php'] = 'Film Template';
    $templates['template-team.php'] = 'Team Template';
    // Add other templates as needed
    return $templates;
}
add_filter('theme_page_templates', 'afct_register_page_templates');
// Add custom meta boxes for the Podcast template
function afct_add_podcast_meta_boxes() {
    global $post;
    $template_file = get_post_meta($post->ID, '_wp_page_template', true);
    if ($template_file == 'template-podcast.php') {
        add_meta_box(
            'podcast_audio_meta_box',
            'Podcast Audio',
            'afct_podcast_audio_meta_box_callback',
            'page',
            'normal',
            'high'
        );
        add_meta_box(
            'podcast_guests_meta_box',
            'Podcast Guests',
            'afct_podcast_guests_meta_box_callback',
            'page',
            'normal',
            'high'
        );
    }
}
add_action('add_meta_boxes', 'afct_add_podcast_meta_boxes');


// Remove the Gutenberg editor for specific templates
function afct_remove_editor_for_templates() {
    global $post;
    if (!$post) {
        return;
    }
    $template_file = get_post_meta($post->ID, '_wp_page_template', true);
    $templates_to_remove_editor = array(
        'template-podcast.php',
        'template-film.php',
        'template-homepage.php',
        'template-aboutserati.php',
    );
    if (in_array($template_file, $templates_to_remove_editor)) {
        remove_post_type_support('page', 'editor');
    }
}
add_action('admin_init', 'afct_remove_editor_for_templates');

require_once get_template_directory() . '/inc/custom-meta-boxes.php';
require_once get_template_directory() . '/inc/homepage-sections.php';
require_once get_template_directory() . '/inc/template-helpers.php';

<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 */
get_header();

define("IN_ONEPAGER", true);

$menu_items = wp_get_nav_menu_items(get_nav_menu_locations()['menu-1']);

if (count($menu_items)) {
    foreach ($menu_items as $menu_item) {
        if ( get_post_meta( $menu_item->ID, '_afct_menu_experimental', true ) === '1' && ! afct_is_experimental_mode() ) {
            continue;
        }
        global $post;
        $post = get_post($menu_item->object_id);
      
        echo '<section id="section-' . $post->post_name . '" data-scroll >';
        $template_file = get_page_template_slug($post);
        
        if ($template_file) {
            setup_postdata($post);
            locate_template($template_file, true, true);
        } else {
            if (is_object($post)) {
                echo apply_filters('the_content', $post->post_content);
            }
        }
        echo '</section>';
        
        wp_reset_postdata();
    }
}

get_footer();
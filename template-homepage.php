<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 */
get_header();

define("IN_ONEPAGER", true);

$menu_items = wp_get_nav_menu_items(get_nav_menu_locations()['menu-1']); // Get primary menu items by location

if (count($menu_items)) {
    foreach ($menu_items as $post) {
        global $post;
        $post = get_post($post->object_id);
        echo '<div id="section-' . $post->object_id . '">';
        $template_file = get_page_template_slug($post);
        
        if ($template_file) {
            setup_postdata($post);
            locate_template($template_file, true, true);
        } else {
            if (is_object($post)) {
                echo apply_filters('the_content', $post->post_content);
            }
        }
        echo '</div>';
        
        wp_reset_postdata();
    }
}

get_footer();

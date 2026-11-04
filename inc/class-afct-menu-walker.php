<?php
class AFCT_Menu_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        $is_homepage = is_page_template('template-homepage.php');
        $unique_id = uniqid('menu-line-');
        
        $output .= '<li class="menu-item">';
        $section_ids = array_map( 'intval', wp_list_pluck( afct_get_homepage_sections( afct_is_experimental_mode() ), 'object_id' ) );
        if($is_homepage && $item->type === 'post_type' && $item->object === 'page' && in_array( (int) $item->object_id, $section_ids, true )) {
            // If on homepage, use anchor link
            // Get the post object to retrieve the post_name (slug)
            $post_obj = get_post($item->object_id);
            $post_slug = $post_obj ? $post_obj->post_name : '';
            $output .= '<a href="#section-' . esc_attr($post_slug) . '" data-target="#section-' . esc_attr($post_slug) . '" class="nav-link scroll-link">' . esc_html($item->title) . '</a>';
        } else {
            // Regular page link
            $output .= '<a href="' . esc_url($item->url) . '" class="nav-link">' . esc_html($item->title) . '</a>';
        }
        
        // Add the SVG line element
        $output .= '<div bind="' . esc_attr($unique_id) . '" class="embed-menu-line w-embed"><svg width="24" height="1" viewBox="0 0 24 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="1" transform="matrix(1 0 0 -1 0 1)" fill="currentColor"></rect>
            </svg></div>';
            
    }
}

add_filter( 'wp_nav_menu_objects', function ( $items, $args ) {
    if ( ( $args->theme_location ?? '' ) !== 'menu-1' || afct_is_experimental_mode() ) {
        return $items;
    }
    return array_values( array_filter( $items, function ( $item ) {
        return get_post_meta( $item->ID, '_afct_menu_experimental', true ) !== '1';
    } ) );
}, 10, 2 );

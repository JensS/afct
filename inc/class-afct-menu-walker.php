<?php
class AFCT_Menu_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        $is_homepage = is_page_template('template-homepage.php');
        $unique_id = uniqid('menu-line-');
        
        $output .= '<div class="menu-item">';
        if($is_homepage) {
            // If on homepage, use anchor link
            // Get the post object to retrieve the post_name (slug)
            $post_obj = get_post($item->object_id);
            $post_slug = $post_obj ? $post_obj->post_name : '';
            $output .= '<a href="#section-' . $post_slug . '" data-target="#section-' . $post_slug . '" class="nav-link scroll-link">' . $item->title . '</a>';
        } else {
            // Regular page link
            $output .= '<a href="' . $item->url . '" class="nav-link">' . $item->title . '</a>';
        }
        
        // Add the SVG line element
        $output .= '<div bind="' . $unique_id . '" class="embed-menu-line w-embed"><svg width="24" height="1" viewBox="0 0 24 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="1" transform="matrix(1 0 0 -1 0 1)" fill="currentColor"></rect>
            </svg></div>';
            
        $output .= '</div>';
    }
}

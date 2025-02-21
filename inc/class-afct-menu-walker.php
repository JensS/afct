<?php
class AFCT_Menu_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        $is_homepage = is_page_template('template-homepage.php');
        
        $output .= '<div class="menu-item" style="height:16px">';
        
        if($is_homepage) {
            // If on homepage, use anchor link
            $output .= '<a href="#section-' . $item->object_id . '" style="opacity:0.8" class="nav-link scroll-link">' . $item->title . '</a>';
        } else {
            // Regular page link
            $output .= '<a href="' . $item->url . '" style="opacity:0.8" class="nav-link">' . $item->title . '</a>';
        }
        $output .= '<div class="embed-menu-line"><svg width="24" height="1" viewBox="0 0 24 1" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="1" transform="matrix(1 0 0 -1 0 1)" fill="currentColor"/></svg></div>';
        $output .= '</div>';
    }
}

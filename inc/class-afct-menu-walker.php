<?php
class AFCT_Menu_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        $is_homepage = is_page_template('template-homepage.php');
        
        $output .= '<div class="menu-item" style="height:auto; margin-bottom: 20px;">';
        
        if($is_homepage) {
            // If on homepage, use anchor link
            $output .= '<a href="#section-' . $item->object_id . '" style="opacity:1; color: var(--red);" class="nav-link scroll-link">' . $item->title . '</a>';
        } else {
            // Regular page link
            $output .= '<a href="' . $item->url . '" style="opacity:1; color: var(--red);" class="nav-link">' . $item->title . '</a>';
        }
        $output .= '</div>';
    }
}

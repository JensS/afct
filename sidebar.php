<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package AFCT
 */

if ( ! is_active_sidebar( 'sidebar-1' ) ) {
	return;
}

// Get the list of page IDs from the homepage
$homepage_id = get_option('page_on_front');
$page_ids = get_post_meta($homepage_id, '_afct_homepage_sections', true);

if ($page_ids) {
    echo '<nav class="sidebar"><ul>';
    foreach ($page_ids as $page_id) {
        $page = get_post($page_id);
        echo '<li><a href="#section-' . esc_attr($page_id) . '">' . esc_html($page->post_title) . '</a></li>';
    }
    echo '</ul></nav>';
}
?>

<aside id="secondary" class="widget-area">
	<?php dynamic_sidebar( 'sidebar-1' ); ?>
</aside><!-- #secondary -->

<?php
/**
 * Template Name: Film Template
 * Template Post Type: page
 */

get_header();

// Get the list of page IDs to display, in the desired order
$page_ids = get_post_meta(get_the_ID(), '_afct_homepage_sections', true);

if ($page_ids) {
    $pages = get_pages(array(
        'include' => $page_ids,
        'orderby' => 'post__in', // Preserve the order of IDs
    ));

    foreach ($pages as $page) {
        setup_postdata($page);

        // Load the template part for the page's template
        $template_file = get_page_template_slug($page->ID);

        if ($template_file) {
            include(locate_template($template_file));
        } else {
            // Fallback to default page content
            ?>
            <section id="section-<?php echo $page->ID; ?>" class="section">
                <?php echo apply_filters('the_content', $page->post_content); ?>
            </section>
            <?php
        }
        wp_reset_postdata();
    }
} else {
    // No sections selected, display default content
    ?>
    <main id="primary" class="site-main">
        <?php
        while (have_posts()) : the_post();
            the_content();
        endwhile;
        ?>
    </main>
    <?php
}

$credits = afct_get_team_credits();

// Display credits
if (!empty($credits['film_team'])) {
    echo '<section id="credits" class="section">';
    echo '<h2>Credits</h2>';
    echo '<ul>';
    foreach ($credits['film_team'] as $role => $name) {
        echo '<li><strong>' . esc_html($role) . ':</strong> ' . esc_html($name) . '</li>';
    }
    echo '</ul>';
    echo '</section>';
}

get_sidebar();
get_footer();

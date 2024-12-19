<?php

function afct_add_page_templates_meta_box() {
    global $post;
    if (!$post) return;

    // Add more conditions for other templates as needed
    $template_file = get_post_meta($post->ID, '_wp_page_template', true);
    if (get_post_type() == 'page') {
        if ($template_file != 'template-podcast.php' && $template_file != 'template-film.php' && $template_file != 'template-homepage.php') {
            add_meta_box(
                'custom_fields',
                __('Custom Fields'),
                'afct_custom_fields_callback',
                'page',
                'normal',
                'high'
            );
        }
    }

    // Add meta box to select homepage sections
    if (get_post_type() == 'page' && $template_file == 'template-homepage.php') {
        add_meta_box(
            'homepage_sections_meta_box',
            'Homepage Sections',
            'afct_homepage_sections_meta_box_callback',
            'page',
            'normal',
            'high'
        );
    }
}
add_action('wp_loaded', 'afct_add_page_templates_meta_box');

function afct_homepage_sections_meta_box_callback($post) {
    wp_nonce_field('afct_save_homepage_sections_meta_box_data', 'afct_homepage_sections_meta_box_nonce');
    $selected_pages = get_post_meta($post->ID, '_afct_homepage_sections', true);

    // Get pages that use the custom templates
    $args = array(
        'post_type' => 'page',
        'meta_key' => '_wp_page_template',
        'meta_value' => array(
            'template-podcast.php',
            'template-film.php',
            'template-team.php',
            // Add other template files here
        ),
        'posts_per_page' => -1,
    );
    $pages = get_posts($args);

    ?>
    <label for="afct_homepage_sections">Select Sections to Display:</label>
    <select id="afct_homepage_sections" name="afct_homepage_sections[]" multiple style="width:100%;">
        <?php
        foreach ($pages as $page) {
            $selected = in_array($page->ID, (array)$selected_pages) ? 'selected' : '';
            echo '<option value="' . esc_attr($page->ID) . '" ' . $selected . '>' . esc_html($page->post_title) . '</option>';
        }
        ?>
    </select>
    <p>Drag to reorder the sections.</p>
    <script>
        jQuery(document).ready(function($) {
            $('#afct_homepage_sections').sortable({
                placeholder: 'ui-state-highlight'
            });
        });
    </script>
    <?php
}

function afct_save_homepage_sections_meta_box_data($post_id) {
    if (!isset($_POST['afct_homepage_sections_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_homepage_sections_meta_box_nonce'], 'afct_save_homepage_sections_meta_box_data')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if ('page' != $_POST['post_type'] || !current_user_can('edit_page', $post_id)) {
        return;
    }

    if (isset($_POST['afct_homepage_sections'])) {
        $sections = array_map('intval', $_POST['afct_homepage_sections']);
        update_post_meta($post_id, '_afct_homepage_sections', $sections);
    } else {
        delete_post_meta($post_id, '_afct_homepage_sections');
    }
}
add_action('save_post', 'afct_save_homepage_sections_meta_box_data');


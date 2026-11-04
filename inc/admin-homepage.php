<?php
/**
 * Admin interface for the Homepage Sections
 */

function afct_homepage_sections_meta_box_callback($post) {
    wp_nonce_field('afct_save_homepage_sections_meta_box_data', 'afct_homepage_sections_meta_box_nonce');
    $homepage_sections = get_post_meta($post->ID, '_afct_homepage_sections', true);

    if (empty($homepage_sections)) {
        // Default empty structure
        $homepage_sections = [];
    }
    ?>
    <div class="homepage-sections-container">
        <p>Configure the sections that appear on the homepage. These typically correspond to the pages in your primary menu.</p>
        <p>The homepage template automatically displays all pages from the primary menu in the order they appear in the menu.</p>
        <p>Use the WordPress Menu settings to control which pages appear and their order.</p>
    </div>
    <?php
}

/**
 * Save homepage sections meta box data
 */
function afct_save_homepage_sections($post_id) {
    // Skip if doing autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Verify user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save homepage sections
    if (isset($_POST['afct_homepage_sections_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_homepage_sections_meta_box_nonce'], 'afct_save_homepage_sections_meta_box_data')) {
        
        // Process and save homepage sections data if needed
        $sections = [];
        
        // For now, we're just saving an empty array as the homepage uses the menu items
        // This can be expanded later if specific section settings are needed
        
        update_post_meta($post_id, '_afct_homepage_sections', $sections);
    }
}
add_action('save_post', 'afct_save_homepage_sections');
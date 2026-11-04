<?php

function afct_about_intro_meta_box_callback($post) {
    afct_textarea_meta_box_callback($post, 'about_intro_part1', 'About Intro Part 1');
    afct_textarea_meta_box_callback($post, 'about_intro_part2', 'About Intro Part 2');
}

/**
 * Save intro page meta box data
 */
function afct_save_intro_meta_boxes($post_id) {
    // Skip if doing autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Verify user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Any additional intro-specific meta box saving would go here
}
add_action('save_post', 'afct_save_intro_meta_boxes');

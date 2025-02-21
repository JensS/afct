<?php

function afct_background_video_meta_box_callback($post) {
    wp_nonce_field('afct_save_background_video_meta_box_data', 'afct_background_video_meta_box_nonce');
    $background_video = get_post_meta($post->ID, '_afct_background_video', true);
    ?>
    <label for="background_video">Background Video:</label>
    <input type="hidden" id="background_video" name="background_video" value="<?php echo esc_url($background_video); ?>" />
    <button type="button" class="upload_video_button button">Upload Video</button>
    <?php if ($background_video) : ?>
        <video controls style="display: block; margin-top: 10px; max-width: 100%;">
            <source src="<?php echo esc_url($background_video); ?>" type="video/mp4">
            Your browser does not support the video element.
        </video>
    <?php endif; ?>
    <script>
        jQuery(document).ready(function($) {
            $('.upload_video_button').on('click', function(e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    title: 'Select Video',
                    button: {
                        text: 'Use this video'
                    },
                    multiple: false
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    button.prev('input').val(attachment.url);
                    button.next('video').remove();
                    button.after('<video controls style="display: block; margin-top: 10px; max-width: 100%;"><source src="' + attachment.url + '" type="video/mp4">Your browser does not support the video element.</video>');
                }).open();
            });
        });
    </script>
    <?php
}


function afct_video_cover_image_meta_box_callback($post) {
    wp_nonce_field('afct_save_video_cover_image_meta_box_data', 'afct_video_cover_image_meta_box_nonce');
    $video_cover_image = get_post_meta($post->ID, '_afct_video_cover_image', true);
    ?>
    <label for="video_cover_image">Video Cover Image:</label>
    <input type="hidden" id="video_cover_image" name="video_cover_image" value="<?php echo esc_url($video_cover_image); ?>" />
    <button type="button" class="upload_image_button button">Upload Image</button>
    <?php if ($video_cover_image) : ?>
        <img src="<?php echo esc_url($video_cover_image); ?>" alt="" style="max-width: 100%; display: block; margin-top: 10px;" />
    <?php endif; ?>
    <script>
        jQuery(document).ready(function($) {
            $('.upload_image_button').on('click', function(e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    title: 'Select Image',
                    button: {
                        text: 'Use this image'
                    },
                    multiple: false
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    $('#video_cover_image').val(attachment.url);
                    button.next('img').remove();
                    button.after('<img src="' + attachment.url + '" style="max-width: 100%; display: block; margin-top: 10px;" />');
                }).open();
            });
        });
    </script>
    <?php
}


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

    // Save background video
    if (isset($_POST['afct_background_video_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_background_video_meta_box_nonce'], 'afct_save_background_video_meta_box_data')) {
        if (isset($_POST['background_video'])) {
            update_post_meta($post_id, '_afct_background_video', esc_url_raw($_POST['background_video']));
        } else {
            delete_post_meta($post_id, '_afct_background_video');
        }
    }

    // Save video cover image
    if (isset($_POST['afct_video_cover_image_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_video_cover_image_meta_box_nonce'], 'afct_save_video_cover_image_meta_box_data')) {
        if (isset($_POST['video_cover_image'])) {
            update_post_meta($post_id, '_afct_video_cover_image', esc_url_raw($_POST['video_cover_image']));
        } else {
            delete_post_meta($post_id, '_afct_video_cover_image');
        }
    }
}
add_action('save_post', 'afct_save_intro_meta_boxes');
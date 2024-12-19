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
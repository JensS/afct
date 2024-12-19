<?php
function afct_add_custom_meta_boxes() {
    global $post;
    if (!$post) {
        return;
    }
    $template_file = get_post_meta($post->ID, '_wp_page_template', true);

    if ($template_file == 'template-podcast.php') {
        add_meta_box(
            'podcast_guests_meta_box',
            'Podcast Guests',
            'afct_podcast_guests_meta_box_callback',
            'page',
            'normal',
            'high'
        );
    } elseif ($template_file == 'template-film.php') {
        add_meta_box(
            'gallery_images_meta_box',
            'Gallery Images',
            'afct_gallery_images_meta_box_callback',
            'page',
            'normal',
            'high'
        );
    } elseif ($template_file == 'template-homepage.php') {
        add_meta_box(
            'homepage_sections_meta_box',
            'Homepage Sections',
            'afct_homepage_sections_meta_box_callback',
            'page',
            'normal',
            'high'
        );
    }
    // Add more conditions for other templates as needed
}
add_action('add_meta_boxes', 'afct_add_custom_meta_boxes');


function afct_textarea_meta_box_callback($post, $meta_key, $label) {
    wp_nonce_field("afct_save_{$meta_key}_meta_box_data", "afct_{$meta_key}_meta_box_nonce");
    $value = get_post_meta($post->ID, "_afct_{$meta_key}", true);
    ?>
    <label for="<?php echo $meta_key; ?>"><?php echo $label; ?>:</label>
    <textarea id="<?php echo $meta_key; ?>" name="<?php echo $meta_key; ?>" rows="4" style="width:100%;"><?php echo esc_textarea($value); ?></textarea>
    <?php
}

function afct_about_intro_meta_box_callback($post) {
    afct_textarea_meta_box_callback($post, 'about_intro_part1', 'About Intro Part 1');
    afct_textarea_meta_box_callback($post, 'about_intro_part2', 'About Intro Part 2');
}

function afct_about_serati_meta_box_callback($post) {
    afct_textarea_meta_box_callback($post, 'about_serati', 'About Serati');
}

function afct_podcast_audio_meta_box_callback($post) {
    wp_nonce_field('afct_save_podcast_audio_meta_box_data', 'afct_podcast_audio_meta_box_nonce');
    $podcast_audio = get_post_meta($post->ID, '_afct_podcast_audio', true);
    ?>
    <label for="podcast_audio">Podcast Audio:</label>
    <input type="hidden" id="podcast_audio" name="podcast_audio" value="<?php echo esc_url($podcast_audio); ?>" />
    <button type="button" class="upload_audio_button button">Upload Audio</button>
    <?php if ($podcast_audio) : ?>
        <audio controls style="display: block; margin-top: 10px;">
            <source src="<?php echo esc_url($podcast_audio); ?>" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    <?php endif; ?>
    <script>
        jQuery(document).ready(function($) {
            $('.upload_audio_button').on('click', function(e) {
                e.preventDefault();
                var button = $(this);
                var custom_uploader = wp.media({
                    title: 'Select Audio',
                    button: {
                        text: 'Use this audio'
                    },
                    multiple: false
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    button.prev('input').val(attachment.url);
                    button.next('audio').remove();
                    button.after('<audio controls style="display: block; margin-top: 10px;"><source src="' + attachment.url + '" type="audio/mpeg">Your browser does not support the audio element.</audio>');
                }).open();
            });
        });
    </script>
    <?php
}

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

function afct_youtube_embed_meta_box_callback($post) {
    wp_nonce_field('afct_save_youtube_embed_meta_box_data', 'afct_youtube_embed_meta_box_nonce');
    $youtube_embed = get_post_meta($post->ID, '_afct_youtube_embed', true);
    ?>
    <label for="youtube_embed">YouTube Video URL:</label>
    <input type="text" id="youtube_embed" name="youtube_embed" value="<?php echo esc_url($youtube_embed); ?>" style="width:100%;" />
    <p>Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID).</p>
    <?php
}

function afct_credits_meta_box_callback($post) {
    wp_nonce_field('afct_save_credits_meta_box_data', 'afct_credits_meta_box_nonce');
    $credits = get_post_meta($post->ID, '_afct_credits', true);

    if (empty($credits)) {
        // Read default credits from credits.json
        $credits_file = get_template_directory() . '/credits.json';
        if (file_exists($credits_file)) {
            $credits_json = file_get_contents($credits_file);
            $credits = json_decode($credits_json, true);
        } else {
            $credits = array();
        }
    }
    ?>
    <label for="credits">Credits:</label>
    <textarea id="credits" name="credits" rows="10" style="width:100%;"><?php echo esc_textarea(json_encode($credits, JSON_PRETTY_PRINT)); ?></textarea>
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

function afct_save_custom_meta_box_data($post_id) {
    $meta_boxes = [
        'about_intro_part1',
        'about_intro_part2',
        'about_serati',
        'podcast_audio',
        'background_video',
        'youtube_embed',
        'credits'
    ];

    foreach ($meta_boxes as $meta_key) {
        if (!isset($_POST["afct_{$meta_key}_meta_box_nonce"]) || !wp_verify_nonce($_POST["afct_{$meta_key}_meta_box_nonce"], "afct_save_{$meta_key}_meta_box_data")) {
            continue;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            continue;
        }

        if (!current_user_can('edit_post', $post_id)) {
            continue;
        }

        if (isset($_POST[$meta_key])) {
            if ($meta_key === 'credits') {
                update_post_meta($post_id, "_afct_{$meta_key}", wp_kses_post($_POST[$meta_key]));
            } else {
                update_post_meta($post_id, "_afct_{$meta_key}", sanitize_text_field($_POST[$meta_key]));
            }
        }
    }

    if (!isset($_POST['afct_podcast_guests_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_podcast_guests_meta_box_nonce'], 'afct_save_podcast_guests_meta_box_data')) {
        return;
    }

    if (!isset($_POST['afct_gallery_images_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_gallery_images_meta_box_nonce'], 'afct_save_gallery_images_meta_box_data')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $podcast_guests = array();
    if (isset($_POST['guest_image']) && isset($_POST['guest_alt'])) {
        $guest_images = $_POST['guest_image'];
        $guest_alts = $_POST['guest_alt'];
        for ($i = 0; $i < count($guest_images); $i++) {
            if ($guest_images[$i]) {
                $podcast_guests[] = array(
                    'image' => esc_url_raw($guest_images[$i]),
                    'alt' => sanitize_text_field($guest_alts[$i]),
                );
            }
        }
    }
    update_post_meta($post_id, '_afct_podcast_guests', $podcast_guests);

    $gallery_images = array();
    if (isset($_POST['image_url']) && isset($_POST['image_alt'])) {
        $image_urls = $_POST['image_url'];
        $image_alts = $_POST['image_alt'];
        for ($i = 0; $i < count($image_urls); $i++) {
            if ($image_urls[$i]) {
                $gallery_images[] = array(
                    'url' => esc_url_raw($image_urls[$i]),
                    'alt' => sanitize_text_field($image_alts[$i]),
                );
            }
        }
    }
    update_post_meta($post_id, '_afct_gallery_images', $gallery_images);

    if (!isset($_POST['afct_about_intro_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_about_intro_meta_box_nonce'], 'afct_save_about_intro_meta_box_data')) {
        return;
    }

    if (!isset($_POST['afct_about_serati_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_about_serati_meta_box_nonce'], 'afct_save_about_serati_meta_box_data')) {
        return;
    }

    if (!isset($_POST['afct_podcast_audio_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_podcast_audio_meta_box_nonce'], 'afct_save_podcast_audio_meta_box_data')) {
        return;
    }

    if (!isset($_POST['afct_background_video_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_background_video_meta_box_nonce'], 'afct_save_background_video_meta_box_data')) {
        return;
    }

    if (!isset($_POST['afct_youtube_embed_meta_box_nonce']) || !wp_verify_nonce($_POST['afct_youtube_embed_meta_box_nonce'], 'afct_save_youtube_embed_meta_box_data')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (isset($_POST['about_intro_part1'])) {
        update_post_meta($post_id, '_afct_about_intro_part1', sanitize_textarea_field($_POST['about_intro_part1']));
    }

    if (isset($_POST['about_intro_part2'])) {
        update_post_meta($post_id, '_afct_about_intro_part2', sanitize_textarea_field($_POST['about_intro_part2']));
    }

    if (isset($_POST['about_serati'])) {
        update_post_meta($post_id, '_afct_about_serati', sanitize_textarea_field($_POST['about_serati']));
    }

    if (isset($_POST['podcast_audio'])) {
        update_post_meta($post_id, '_afct_podcast_audio', esc_url_raw($_POST['podcast_audio']));
    }

    if (isset($_POST['background_video'])) {
        update_post_meta($post_id, '_afct_background_video', esc_url_raw($_POST['background_video']));
    }

    if (isset($_POST['youtube_embed'])) {
        update_post_meta($post_id, '_afct_youtube_embed', esc_url_raw($_POST['youtube_embed']));
    }

    if (isset($_POST['credits'])) {
        update_post_meta($post_id, '_afct_credits', sanitize_textarea_field($_POST['credits']));
    }

    if (isset($_POST['afct_video_cover_image_meta_box_nonce']) && wp_verify_nonce($_POST['afct_video_cover_image_meta_box_nonce'], 'afct_save_video_cover_image_meta_box_data')) {
        if (isset($_POST['video_cover_image'])) {
            update_post_meta($post_id, '_afct_video_cover_image', esc_url_raw($_POST['video_cover_image']));
        }
    }
}
add_action('save_post', 'afct_save_custom_meta_box_data');
?>

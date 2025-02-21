<?php
function afct_textarea_meta_box_callback($post, $meta_key, $label) {
    wp_nonce_field("afct_save_{$meta_key}_meta_box_data", "afct_{$meta_key}_meta_box_nonce");
    $value = get_post_meta($post->ID, "_afct_{$meta_key}", true);
    ?>
    <label for="<?php echo $meta_key; ?>"><?php echo $label; ?>:</label>
    <textarea id="<?php echo $meta_key; ?>" name="<?php echo $meta_key; ?>" rows="4" style="width:100%;"><?php echo esc_textarea($value); ?></textarea>
    <?php
}

function afct_about_serati_meta_box_callback($post) {
    afct_textarea_meta_box_callback($post, 'about_serati', 'About Serati');
}

function afct_about_serati_image_meta_box_callback($post) {
    wp_nonce_field('afct_save_about_serati_image_meta_box_data', 'afct_about_serati_image_meta_box_nonce');
    $image_data = get_post_meta($post->ID, '_afct_about_serati_image', true);
    ?>
    <div class="about-serati-image-upload">
        <input type="hidden" name="about_serati_image" id="about_serati_image" 
               value="<?php echo esc_attr($image_data ? $image_data['url'] : ''); ?>" />
        <button type="button" class="upload_image_button button">
            <?php echo $image_data ? 'Change Image' : 'Upload Image'; ?>
        </button>
        
        <div class="image-preview" style="margin-top: 10px;">
            <?php if ($image_data) : ?>
                <img src="<?php echo esc_url($image_data['url']); ?>" 
                     alt="<?php echo esc_attr($image_data['alt']); ?>"
                     style="max-width: 300px; height: auto;" />
            <?php endif; ?>
        </div>
    </div>
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
                    $('#about_serati_image').val(attachment.url);
                    
                    // Update preview
                    $('.image-preview').html(
                        '<img src="' + attachment.url + '" alt="' + attachment.alt + '" style="max-width: 300px; height: auto;" />'
                    );
                    
                    button.text('Change Image');
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


function afct_save_custom_meta_box_data($post_id) {
    // Basic checks
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    // Save gallery images
    if (isset($_POST['afct_gallery_images_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_gallery_images_meta_box_nonce'], 'afct_save_gallery_images_meta_box_data')) {
        
        if (isset($_POST['gallery_images']) && is_array($_POST['gallery_images'])) {
            $gallery_images = [];
            foreach ($_POST['gallery_images'] as $url) {
                if (!empty($url)) {
                    $attachment_id = attachment_url_to_postid($url);
                    $alt_text = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
                    $gallery_images[] = [
                        'url' => esc_url_raw($url),
                        'alt' => sanitize_text_field($alt_text)
                    ];
                }
            }
            update_post_meta($post_id, '_afct_gallery_images', $gallery_images);
        } else {
            delete_post_meta($post_id, '_afct_gallery_images');
        }
    }

    // Save podcast guests
    if (isset($_POST['guest_image'])) {
        $podcast_guests = [];
        $guest_images = $_POST['guest_image'];
        foreach ($guest_images as $guest_image) {
            if ($guest_image) {
                $attachment_id = attachment_url_to_postid($guest_image);
                $alt_text = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
                $podcast_guests[] = [
                    'image' => esc_url_raw($guest_image),
                    'alt' => sanitize_text_field($alt_text),
                ];
            }
        }
        update_post_meta($post_id, '_afct_podcast_guests', $podcast_guests);
    } else {
        delete_post_meta($post_id, '_afct_podcast_guests');
    }

    // Save podcast chapters
    if (isset($_POST['chapter_time'], $_POST['chapter_title'])) {
        $chapters = [];
        $times = $_POST['chapter_time'];
        $titles = $_POST['chapter_title'];
        for ($i = 0; $i < count($times); $i++) {
            if (!empty($times[$i]) && !empty($titles[$i])) {
                $chapters[] = [
                    'time' => sanitize_text_field($times[$i]),
                    'title' => sanitize_text_field($titles[$i]),
                ];
            }
        }
        update_post_meta($post_id, '_afct_podcast_chapters', $chapters);
    } else {
        delete_post_meta($post_id, '_afct_podcast_chapters');
    }

    // Save other meta box data
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

        if (isset($_POST[$meta_key])) {
            if ($meta_key === 'credits') {
                update_post_meta($post_id, "_afct_{$meta_key}", wp_kses_post($_POST[$meta_key]));
            } else {
                update_post_meta($post_id, "_afct_{$meta_key}", sanitize_text_field($_POST[$meta_key]));
            }
        }
    }

    // Save about serati image
    if (isset($_POST['about_serati_image']) && 
        isset($_POST['afct_about_serati_image_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_about_serati_image_meta_box_nonce'], 'afct_save_about_serati_image_meta_box_data')) {
        
        if (!empty($_POST['about_serati_image'])) {
            $url = esc_url_raw($_POST['about_serati_image']);
            $attachment_id = attachment_url_to_postid($url);
            $alt_text = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
            
            $image_data = [
                'url' => $url,
                'alt' => sanitize_text_field($alt_text),
                'id' => $attachment_id
            ];
            
            update_post_meta($post_id, '_afct_about_serati_image', $image_data);
        } else {
            delete_post_meta($post_id, '_afct_about_serati_image');
        }
    }

    // Save homepage sections
    if (isset($_POST['afct_homepage_sections_meta_box_nonce']) && 
        wp_verify_nonce($_POST['afct_homepage_sections_meta_box_nonce'], 'afct_save_homepage_sections_meta_box_data')) {
        
        if (isset($_POST['homepage_section_pages']) && is_array($_POST['homepage_section_pages'])) {
            $sections = array_map('absint', $_POST['homepage_section_pages']);
            update_post_meta($post_id, '_afct_homepage_sections', $sections);
        } else {
            delete_post_meta($post_id, '_afct_homepage_sections');
        }
    }
}
add_action('save_post', 'afct_save_custom_meta_box_data');

<?php


function afct_podcast_guests_meta_box_callback($post) {
    wp_nonce_field('afct_save_podcast_guests_meta_box_data', 'afct_podcast_guests_meta_box_nonce');
    $podcast_guests = get_post_meta($post->ID, '_afct_podcast_guests', true);
    if (!is_array($podcast_guests)) {
        $podcast_guests = [];
    }
    ?>
    <style>
        .podcast-guest {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 10px;
            border: 1px solid #ddd;
            background: #fafafa;
            margin-bottom: 8px;
            border-radius: 3px;
        }
        .podcast-guest-thumb {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            cursor: pointer;
            border: 2px solid #ccc;
            display: block;
            flex-shrink: 0;
        }
        .podcast-guest-thumb:hover { border-color: #0073aa; }
        .podcast-guest-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px dashed #ccc;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 11px;
            color: #999;
            text-align: center;
            line-height: 1.4;
            flex-shrink: 0;
        }
        .podcast-guest-placeholder:hover { border-color: #0073aa; color: #0073aa; }
        .podcast-guest-actions { display: flex; flex-direction: column; gap: 6px; }
        .podcast-guest-remove {
            background: none;
            border: none;
            color: #a00;
            cursor: pointer;
            text-decoration: underline;
            font-size: 12px;
            padding: 0;
            text-align: left;
        }
    </style>

    <div id="podcast-guests-wrapper">
        <?php foreach ($podcast_guests as $guest) :
            // Prefer stored image_id; fall back to URL-based lookup for old data
            $image_id = isset($guest['image_id']) ? intval($guest['image_id']) : 0;
            if (!$image_id && !empty($guest['image'])) {
                $image_id = attachment_url_to_postid($guest['image']);
            }
            $thumb_url = $image_id ? wp_get_attachment_image_url($image_id, 'thumbnail') : '';
        ?>
            <div class="podcast-guest">
                <input type="hidden" name="guest_image_id[]" value="<?php echo esc_attr($image_id); ?>" />
                <?php if ($thumb_url) : ?>
                    <img class="podcast-guest-thumb" src="<?php echo esc_url($thumb_url); ?>" title="Click to change image" />
                <?php else : ?>
                    <div class="podcast-guest-placeholder">Click to<br>add image</div>
                <?php endif; ?>
                <div class="podcast-guest-actions">
                    <button type="button" class="button pick-guest-image">
                        <?php echo $thumb_url ? 'Change image' : 'Select image'; ?>
                    </button>
                    <button type="button" class="podcast-guest-remove remove-guest">Remove guest</button>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <button type="button" id="add-guest" class="button button-secondary" style="margin-top: 8px;">+ Add Guest</button>

    <script>
    jQuery(document).ready(function($) {
        function openMediaPicker(guestEl) {
            var frame = wp.media({
                title: 'Select Guest Image',
                button: { text: 'Use this image' },
                multiple: false,
                library: { type: 'image' }
            });
            frame.on('select', function() {
                var a = frame.state().get('selection').first().toJSON();
                var thumbUrl = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
                guestEl.find('input[name="guest_image_id[]"]').val(a.id);
                guestEl.find('.podcast-guest-placeholder').replaceWith(
                    '<img class="podcast-guest-thumb" src="' + thumbUrl + '" title="Click to change image" />'
                );
                // Replace existing thumb if already present
                var existing = guestEl.find('.podcast-guest-thumb');
                if (existing.length) {
                    existing.attr('src', thumbUrl);
                }
                guestEl.find('.pick-guest-image').text('Change image');
            });
            frame.open();
        }

        // Clicking the image or placeholder opens the picker
        $(document).on('click', '.podcast-guest-thumb, .podcast-guest-placeholder', function() {
            openMediaPicker($(this).closest('.podcast-guest'));
        });
        $(document).on('click', '.pick-guest-image', function() {
            openMediaPicker($(this).closest('.podcast-guest'));
        });

        $(document).on('click', '.remove-guest', function() {
            $(this).closest('.podcast-guest').remove();
        });

        $('#add-guest').on('click', function() {
            var tpl = '<div class="podcast-guest">' +
                '<input type="hidden" name="guest_image_id[]" value="" />' +
                '<div class="podcast-guest-placeholder">Click to<br>add image</div>' +
                '<div class="podcast-guest-actions">' +
                    '<button type="button" class="button pick-guest-image">Select image</button>' +
                    '<button type="button" class="podcast-guest-remove remove-guest">Remove guest</button>' +
                '</div>' +
                '</div>';
            $('#podcast-guests-wrapper').append(tpl);
        });
    });
    </script>
    <?php
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


function afct_podcast_chapters_meta_box_callback($post) {
    wp_nonce_field('afct_save_podcast_chapters_meta_box_data', 'afct_podcast_chapters_meta_box_nonce');
    $podcast_chapters = get_post_meta($post->ID, '_afct_podcast_chapters', true);

    if (empty($podcast_chapters)) {
        // Default chapters
        $podcast_chapters = [
            ['time' => '00:00', 'title' => 'Seratis story'],
            ['time' => '04:15', 'title' => 'Tshiamo on growing up during the end of Apartheid'],
            ['time' => '16:55', 'title' => 'Aphe on being a foreigner everywhere'],
            ['time' => '34:00', 'title' => 'Alfi on Finding your sense of belonging'],
        ];
    }
    ?>
    <style>
        .podcast-chapter {
            cursor: move;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 5px;
            background-color: #f9f9f9;
        }
        .sort-handle {
            cursor: move;
            margin-right: 10px;
        }
    </style>
    <div id="podcast-chapters-wrapper">
        <?php foreach ($podcast_chapters as $chapter): ?>
            <div class="podcast-chapter">
                <span class="sort-handle">☰</span>
                <label>Time:</label>
                <input type="text" name="chapter_time[]" value="<?php echo esc_attr($chapter['time']); ?>" />
                <label>Title:</label>
                <input type="text" name="chapter_title[]" value="<?php echo esc_attr($chapter['title']); ?>" />
                <button type="button" class="remove-chapter">Remove</button>
            </div>
        <?php endforeach; ?>
    </div>
    <button type="button" id="add-chapter">Add Chapter</button>
    <script>
        jQuery(document).ready(function($) {
            $('#podcast-chapters-wrapper').sortable({
                handle: '.sort-handle',
                items: '.podcast-chapter',
                cursor: 'move',
                opacity: 0.6
            });

            $('#add-chapter').on('click', function() {
                $('#podcast-chapters-wrapper').append(`
                    <div class="podcast-chapter">
                        <span class="sort-handle">☰</span>
                        <label>Time:</label>
                        <input type="text" name="chapter_time[]" value="" />
                        <label>Title:</label>
                        <input type="text" name="chapter_title[]" value="" />
                        <button type="button" class="remove-chapter">Remove</button>
                    </div>
                `);
            });
            $(document).on('click', '.remove-chapter', function() {
                $(this).closest('.podcast-chapter').remove();
            });
        });
    </script>
    <?php
}

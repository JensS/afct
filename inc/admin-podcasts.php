<?php


function afct_podcast_guests_meta_box_callback($post) {
    wp_nonce_field('afct_save_podcast_guests_meta_box_data', 'afct_podcast_guests_meta_box_nonce');
    $podcast_guests = get_post_meta($post->ID, '_afct_podcast_guests', true);
    ?>
    <div id="podcast-guests-wrapper">
        <?php if (!empty($podcast_guests)) : ?>
            <?php foreach ($podcast_guests as $guest) : ?>
                <div class="podcast-guest">
                    <label for="guest_image">Guest Image:</label>
                    <input type="hidden" name="guest_image[]" value="<?php echo esc_attr($guest['image']); ?>" />
                    <button type="button" class="upload_image_button button">Upload Image</button>
                    <?php if ($guest['image']) : ?>
                        <img src="<?php echo esc_url($guest['image']); ?>" alt="<?php echo esc_attr($guest['alt']); ?>" style="max-width: 100px; display: block;" />
                    <?php endif; ?>
                    <button type="button" class="remove-guest">Remove</button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <button type="button" id="add-guest">Add Image of Guest</button>
    <script>
        jQuery(document).ready(function($) {
            $('#add-guest').on('click', function() {
                $('#podcast-guests-wrapper').append('<div class="podcast-guest"><label for="guest_image">Guest Image:</label><input type="hidden" name="guest_image[]" /><button type="button" class="upload_image_button button">Upload Image</button><button type="button" class="remove-guest">Remove</button></div>');
            });
            $(document).on('click', '.remove-guest', function() {
                $(this).closest('.podcast-guest').remove();
            });
            $(document).on('click', '.upload_image_button', function(e) {
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
                    button.prev('input').val(attachment.url);
                    button.next('img').remove();
                    button.after('<img src="' + attachment.url + '" style="max-width: 100px; display: block;" />');
                }).open();
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

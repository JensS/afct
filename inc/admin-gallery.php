<?php
function afct_gallery_images_meta_box_callback($post) {
    wp_nonce_field('afct_save_gallery_images_meta_box_data', 'afct_gallery_images_meta_box_nonce');
    $gallery_images = get_post_meta($post->ID, '_afct_gallery_images', true);
    ?>
    <div id="gallery-images-wrapper">
        <?php if (!empty($gallery_images)) : ?>
            <?php foreach ($gallery_images as $image) : ?>
                <div class="gallery-image">
                    <label for="image_url">Image:</label>
                    <input type="hidden" name="image_url[]" value="<?php echo esc_attr($image['url']); ?>" />
                    <button type="button" class="upload_image_button button">Upload Image</button>
                    <?php if ($image['url']) : ?>
                        <img src="<?php echo esc_url($image['url']); ?>" alt="<?php echo esc_attr($image['alt']); ?>" style="max-width: 100px; display: block;" />
                    <?php endif; ?>
                    <label for="image_alt">Image Alt Text:</label>
                    <input type="text" name="image_alt[]" value="<?php echo esc_attr($image['alt']); ?>" />
                    <button type="button" class="remove-image">Remove</button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <button type="button" id="add-image">Add Image</button>
    <script>
        jQuery(document).ready(function($) {
            $('#add-image').on('click', function() {
                $('#gallery-images-wrapper').append('<div class="gallery-image"><label for="image_url">Image:</label><input type="hidden" name="image_url[]" /><button type="button" class="upload_image_button button">Upload Image</button><label for="image_alt">Image Alt Text:</label><input type="text" name="image_alt[]" value="" /><button type="button" class="remove-image">Remove</button></div>');
            });
            $(document).on('click', '.remove-image', function() {
                $(this).closest('.gallery-image').remove();
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

<?php
function afct_add_gallery_meta_box() {
    $screen = get_current_screen();
    if ($screen->post_type === 'page') {
        $post = get_post();
        if ($post && (stripos($post->post_title, 'stills') !== false || 
            stripos($post->post_name, 'stills') !== false)) {
            add_meta_box(
                'afct_gallery_meta_box',
                'Gallery Layout',
                'afct_gallery_meta_box_html',
                'page',
                'normal',
                'high'
            );
        }
    }
}
add_action('add_meta_boxes', 'afct_add_gallery_meta_box');

function afct_gallery_meta_box_html($post) {
    wp_nonce_field('afct_gallery_meta_box', 'afct_gallery_meta_box_nonce');
    $gallery_data = get_post_meta($post->ID, '_afct_gallery_layout', true) ?: ['rows' => []];
    ?>
    <div id="gallery_container">
        <div id="gallery_rows">
            <?php foreach ($gallery_data['rows'] as $row_index => $row): ?>
            <div class="gallery-row" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                <h4>Row <?php echo $row_index + 1; ?> 
                    <button type="button" class="button remove-row" style="float:right">Remove Row</button>
                </h4>
                <div class="row-columns" style="display: flex; gap: 10px;">
                    <?php foreach ($row['columns'] as $col_index => $column): ?>
                    <div class="gallery-column" style="flex: <?php echo $column['width']; ?>">
                        <input type="hidden" name="gallery_layout[<?php echo $row_index; ?>][columns][<?php echo $col_index; ?>][width]" 
                               value="<?php echo $column['width']; ?>">
                        <input type="hidden" name="gallery_layout[<?php echo $row_index; ?>][columns][<?php echo $col_index; ?>][image_id]" 
                               value="<?php echo $column['image_id'] ?? ''; ?>" class="image-id">
                        <input type="hidden" name="gallery_layout[<?php echo $row_index; ?>][columns][<?php echo $col_index; ?>][scroll_speed]" 
                               value="<?php echo $column['scroll_speed'] ?? '1'; ?>" class="scroll-speed">
                <div style="border: 1px dashed #999; padding: 10px; text-align: center;">
                    <div class="column-type-selector" style="margin-bottom: 10px">
                        <label>
                            <input type="radio" name="column_type_<?php echo $row_index; ?>_<?php echo $col_index; ?>" 
                                   value="image" <?php echo !isset($column['type']) || $column['type'] === 'image' ? 'checked' : ''; ?> 
                                   class="column-type-radio" data-type="image">
                            Image
                        </label>
                        <label style="margin-left: 10px">
                            <input type="radio" name="column_type_<?php echo $row_index; ?>_<?php echo $col_index; ?>" 
                                   value="space" <?php echo isset($column['type']) && $column['type'] === 'space' ? 'checked' : ''; ?> 
                                   class="column-type-radio" data-type="space">
                            Space
                        </label>
                    </div>
                    <input type="hidden" name="gallery_layout[<?php echo $row_index; ?>][columns][<?php echo $col_index; ?>][type]" 
                           value="<?php echo isset($column['type']) ? $column['type'] : 'image'; ?>" class="column-type">
                    <div class="image-controls" <?php echo isset($column['type']) && $column['type'] === 'space' ? 'style="display:none"' : ''; ?>>
                        <div class="image-preview" style="margin-bottom: 10px">
                            <?php if (!empty($column['image_id'])): ?>
                                <?php echo wp_get_attachment_image($column['image_id'], 'thumbnail', false, ['style' => 'cursor:pointer', 'title' => 'Click to change or edit image']); ?>
                            <?php endif; ?>
                        </div>
                        <button type="button" class="button select-image">Select Image</button>
                        <button type="button" class="button remove-image" <?php echo empty($column['image_id']) ? 'style="display:none"' : ''; ?>>Remove</button>
                    </div>
                    <div class="space-controls" <?php echo !isset($column['type']) || $column['type'] === 'image' ? 'style="display:none"' : ''; ?>>
                        <div style="background: #f0f0f0; height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px">
                            <span>Empty Space</span>
                        </div>
                    </div>
                    <div style="margin-top: 10px">
                                <label>Width: 
                                    <select class="column-width" onchange="updateColumnWidth(this)">
                                        <option value="1" <?php selected($column['width'], 1); ?>>10%</option>
                                        <option value="2" <?php selected($column['width'], 2); ?>>20%</option>
                                        <option value="3" <?php selected($column['width'], 3); ?>>30%</option>
                                        <option value="4" <?php selected($column['width'], 4); ?>>40%</option>
                                        <option value="5" <?php selected($column['width'], 5); ?>>50%</option>
                                        <option value="6" <?php selected($column['width'], 6); ?>>60%</option>
                                        <option value="7" <?php selected($column['width'], 7); ?>>70%</option>
                                        <option value="8" <?php selected($column['width'], 8); ?>>80%</option>
                                        <option value="9" <?php selected($column['width'], 9); ?>>90%</option>
                                        <option value="10" <?php selected($column['width'], 10); ?>>100%</option>
                                    </select>
                                </label>
                            </div>
                            <div style="margin-top: 10px">
                                <label>Scroll Speed: 
                                    <select class="scroll-speed-select" onchange="updateScrollSpeed(this)">
                                        <option value="0.5" <?php selected($column['scroll_speed'] ?? '1', '0.5'); ?>>0.5</option>
                                        <option value="0.6" <?php selected($column['scroll_speed'] ?? '1', '0.6'); ?>>0.6</option>
                                        <option value="0.7" <?php selected($column['scroll_speed'] ?? '1', '0.7'); ?>>0.7</option>
                                        <option value="0.8" <?php selected($column['scroll_speed'] ?? '1', '0.8'); ?>>0.8</option>
                                        <option value="0.9" <?php selected($column['scroll_speed'] ?? '1', '0.9'); ?>>0.9</option>
                                        <option value="1" <?php selected($column['scroll_speed'] ?? '1', '1'); ?>>1</option>
                                        <option value="1.1" <?php selected($column['scroll_speed'] ?? '1', '1.1'); ?>>1.1</option>
                                        <option value="1.2" <?php selected($column['scroll_speed'] ?? '1', '1.2'); ?>>1.2</option>
                                        <option value="1.3" <?php selected($column['scroll_speed'] ?? '1', '1.3'); ?>>1.3</option>
                                        <option value="1.4" <?php selected($column['scroll_speed'] ?? '1', '1.4'); ?>>1.4</option>
                                        <option value="1.5" <?php selected($column['scroll_speed'] ?? '1', '1.5'); ?>>1.5</option>
                                        <option value="1.8" <?php selected($column['scroll_speed'] ?? '1', '1.8'); ?>>1.8</option>
                                        <option value="2" <?php selected($column['scroll_speed'] ?? '1', '2'); ?>>2</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <button type="button" class="button add-column">+ Add Column</button>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <button type="button" class="button add-row">+ Add Row</button>
    </div>

    <script>
    jQuery(document).ready(function($) {
        // Template for new column
        function getColumnTemplate(rowIndex, colIndex) {
            return `
                <div class="gallery-column" style="flex: 1">
                    <input type="hidden" name="gallery_layout[${rowIndex}][columns][${colIndex}][width]" value="1">
                    <input type="hidden" name="gallery_layout[${rowIndex}][columns][${colIndex}][image_id]" class="image-id">
                    <input type="hidden" name="gallery_layout[${rowIndex}][columns][${colIndex}][type]" value="image" class="column-type">
                    <input type="hidden" name="gallery_layout[${rowIndex}][columns][${colIndex}][scroll_speed]" value="1" class="scroll-speed">
                    <div style="border: 1px dashed #999; padding: 10px; text-align: center;">
                        <div class="column-type-selector" style="margin-bottom: 10px">
                            <label>
                                <input type="radio" name="column_type_${rowIndex}_${colIndex}" 
                                       value="image" checked class="column-type-radio" data-type="image">
                                Image
                            </label>
                            <label style="margin-left: 10px">
                                <input type="radio" name="column_type_${rowIndex}_${colIndex}" 
                                       value="space" class="column-type-radio" data-type="space">
                                Space
                            </label>
                        </div>
                        <div class="image-controls">
                            <div class="image-preview" style="margin-bottom: 10px"></div>
                            <button type="button" class="button select-image">Select Image</button>
                            <button type="button" class="button remove-image" style="display:none">Remove</button>
                        </div>
                        <div class="space-controls" style="display:none">
                            <div style="background: #f0f0f0; height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px">
                                <span>Empty Space</span>
                            </div>
                        </div>
                        <div style="margin-top: 10px">
                            <label>Width: 
                                <select class="column-width" onchange="updateColumnWidth(this)">
                                    <option value="1">10%</option>
                                    <option value="2">20%</option>
                                    <option value="3">30%</option>
                                    <option value="4">40%</option>
                                    <option value="5">50%</option>
                                    <option value="6">60%</option>
                                    <option value="7">70%</option>
                                    <option value="8">80%</option>
                                    <option value="9">90%</option>
                                    <option value="10">100%</option>
                                </select>
                            </label>
                        </div>
                        <div style="margin-top: 10px">
                            <label>Scroll Speed: 
                                <select class="scroll-speed-select" onchange="updateScrollSpeed(this)">
                                    <option value="0.5">0.5</option>
                                    <option value="0.6">0.6</option>
                                    <option value="0.7">0.7</option>
                                    <option value="0.8">0.8</option>
                                    <option value="0.9">0.9</option>
                                    <option value="1" selected>1</option>
                                    <option value="1.1">1.1</option>
                                    <option value="1.2">1.2</option>
                                    <option value="1.3">1.3</option>
                                    <option value="1.4">1.4</option>
                                    <option value="1.5">1.5</option>
                                    <option value="1.8">1.8</option>
                                    <option value="2">2</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>`;
        }

        // Template for new row
        function getRowTemplate(rowIndex) {
            return `
                <div class="gallery-row" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                    <h4>Row ${rowIndex + 1} <button type="button" class="button remove-row" style="float:right">Remove Row</button></h4>
                    <div class="row-columns" style="display: flex; gap: 10px;">
                        ${getColumnTemplate(rowIndex, 0)}
                        <button type="button" class="button add-column">+ Add Column</button>
                    </div>
                </div>`;
        }

        // Add Row
        $('.add-row').click(function() {
            const rowIndex = $('.gallery-row').length;
            $('#gallery_rows').append(getRowTemplate(rowIndex));
        });

        // Add Column
        $(document).on('click', '.add-column', function() {
            const $row = $(this).closest('.gallery-row');
            const rowIndex = $('.gallery-row').index($row);
            const colIndex = $row.find('.gallery-column').length;
            $(this).before(getColumnTemplate(rowIndex, colIndex));
        });

        // Remove Row
        $(document).on('click', '.remove-row', function() {
            $(this).closest('.gallery-row').remove();
            updateRowIndices();
        });

        // Handle column type change
        $(document).on('change', '.column-type-radio', function() {
            const $column = $(this).closest('.gallery-column');
            const type = $(this).data('type');
            
            $column.find('.column-type').val(type);
            
            if (type === 'image') {
                $column.find('.image-controls').show();
                $column.find('.space-controls').hide();
            } else {
                $column.find('.image-controls').hide();
                $column.find('.space-controls').show();
                // Clear image when switching to space
                $column.find('.image-id').val('');
                $column.find('.image-preview').empty();
                $column.find('.remove-image').hide();
            }
        });

        // Shared helper: open the media picker for a given column,
        // pre-selecting the current attachment so the user can edit alt text etc.
        function openMediaPicker($column) {
            const currentId = $column.find('.image-id').val();

            const frame = wp.media({
                title: currentId ? 'Edit Image' : 'Select Image',
                multiple: false,
                library: { type: 'image' }
            });

            // Pre-select the existing attachment so its details panel opens
            frame.on('open', function() {
                if (currentId) {
                    const attachment = wp.media.attachment(currentId);
                    attachment.fetch();
                    frame.state().get('selection').add(attachment);
                }
            });

            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                const thumbUrl = attachment.sizes && attachment.sizes.thumbnail
                    ? attachment.sizes.thumbnail.url
                    : attachment.url;
                $column.find('.image-id').val(attachment.id);
                $column.find('.image-preview').html(
                    `<img src="${thumbUrl}" style="max-width:100%;cursor:pointer" title="Click to change or edit image">`
                );
                $column.find('.remove-image').show();
            });

            frame.open();
        }

        // Select Image button
        $(document).on('click', '.select-image', function() {
            openMediaPicker($(this).closest('.gallery-column'));
        });

        // Click on the thumbnail to re-open the picker (edit alt text, swap image, …)
        $(document).on('click', '.image-preview img', function() {
            openMediaPicker($(this).closest('.gallery-column'));
        });

        // Remove Image
        $(document).on('click', '.remove-image', function() {
            const $column = $(this).closest('.gallery-column');
            $column.find('.image-id').val('');
            $column.find('.image-preview').empty();
            $(this).hide();
        });

        function updateRowIndices() {
            $('.gallery-row').each(function(rowIndex) {
                $(this).find('h4').first().text('Row ' + (rowIndex + 1));
                $(this).find('input[name^="gallery_layout"]').each(function() {
                    const name = $(this).attr('name');
                    $(this).attr('name', name.replace(/gallery_layout\[\d+\]/, `gallery_layout[${rowIndex}]`));
                });
            });
        }

        window.updateColumnWidth = function(select) {
            $(select).closest('.gallery-column').css('flex', $(select).val());
            $(select).closest('.gallery-column').find('input[name*="[width]"]').val($(select).val());
        };

        window.updateScrollSpeed = function(select) {
            $(select).closest('.gallery-column').find('input[name*="[scroll_speed]"]').val($(select).val());
        };
    });
    </script>
    <?php
}

function afct_save_gallery_meta_box($post_id) {
    if (!isset($_POST['afct_gallery_meta_box_nonce']) ||
        !wp_verify_nonce($_POST['afct_gallery_meta_box_nonce'], 'afct_gallery_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (isset($_POST['gallery_layout'])) {
        $gallery_data = ['rows' => $_POST['gallery_layout']];
        update_post_meta($post_id, '_afct_gallery_layout', $gallery_data);
    } else {
        delete_post_meta($post_id, '_afct_gallery_layout');
    }
}
add_action('save_post', 'afct_save_gallery_meta_box');

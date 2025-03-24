<?php
/**
 * Admin interface for the History Timeline
 */

function afct_history_meta_box_callback($post) {
    wp_nonce_field('afct_save_history_meta_box_data', 'afct_history_meta_box_nonce');
    $history_entries = get_post_meta($post->ID, '_afct_history_entries', true);

    if (empty($history_entries)) {
        // Default empty structure
        $history_entries = [];
    }

    // Map zoom options
    $zoom_options = [
        'south_africa' => 'South Africa',
        'africa' => 'Africa',
        'europe_and_africa' => 'Europe and Africa'
    ];

    // Animation types
    $animation_types = [
        'single_point' => 'Single Point',
        'migration' => 'Migration (Origin → Destination)',
    ];
    ?>
    <style>
        .history-entry {
            border: 1px solid #ccc;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f9f9f9;
            position: relative;
        }
        .entry-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            align-items: center;
        }
        .entry-title {
            font-weight: bold;
            font-size: 16px;
        }
        .entry-actions {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        .entry-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .entry-form .full-width {
            grid-column: 1 / 3;
        }
        .animation-section {
            border-top: 1px solid #ddd;
            margin-top: 15px;
            padding-top: 15px;
        }
        .animation-type-options {
            margin-bottom: 10px;
        }
        .animation-fields {
            margin-top: 10px;
        }
        .coordinate-field {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        .coordinate-field input {
            width: 80px;
        }
        .coordinate-field label {
            min-width: 80px;
        }
        .multi-point-container {
            border: 1px solid #ddd;
            padding: 10px;
            margin-top: 10px;
            background-color: #f0f0f0;
        }
        .point-pair {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            align-items: center;
            padding: 5px;
            background-color: #fff;
            border: 1px solid #eee;
        }
        .point-pair-label {
            font-weight: bold;
            min-width: 70px;
        }
        .map-preview {
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            margin-top: 10px;
            background-color: #f0f0f0;
            position: relative;
        }
        .map-preview-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #999;
        }
        .sort-handle {
            cursor: move;
            padding: 5px;
            margin-right: 10px;
            color: #999;
        }
        .languages-field {
            margin-top: 10px;
        }
        .languages-field input {
            width: 100%;
        }
    </style>

    <div id="history-entries-container">
        <?php if (!empty($history_entries)): ?>
            <?php foreach ($history_entries as $index => $entry): ?>
                <div class="history-entry" data-index="<?php echo $index; ?>">
                    <div class="entry-header">
                        <span class="sort-handle">☰</span>
                        <span class="entry-title">
                            <?php echo !empty($entry['title']) ? esc_html($entry['title']) : 'Entry ' . ($index + 1); ?>
                            (<?php echo esc_html($entry['year_start']); ?>)
                        </span>
                        <div class="entry-actions">
                            <button type="button" class="button toggle-entry-form">Edit</button>
                            <button type="button" class="button remove-entry">Remove</button>
                        </div>
                    </div>
                    <div class="entry-form" style="display: none;">
                        <div>
                            <label for="entry_year_start_<?php echo $index; ?>">Year Start:</label>
                            <input type="number" id="entry_year_start_<?php echo $index; ?>" 
                                   name="history_entries[<?php echo $index; ?>][year_start]" 
                                   value="<?php echo esc_attr($entry['year_start']); ?>" required>
                        </div>
                        <!-- Year End field removed -->
                        <div>
                            <label for="entry_map_zoom_<?php echo $index; ?>">Map Zoom:</label>
                            <select id="entry_map_zoom_<?php echo $index; ?>" 
                                    name="history_entries[<?php echo $index; ?>][map_zoom]">
                                <?php foreach ($zoom_options as $value => $label): ?>
                                    <option value="<?php echo esc_attr($value); ?>" 
                                        <?php selected($entry['map_zoom'], $value); ?>>
                                        <?php echo esc_html($label); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label for="entry_visualisation_<?php echo $index; ?>">Visualisation Type:</label>
                            <select id="entry_visualisation_<?php echo $index; ?>" 
                                    name="history_entries[<?php echo $index; ?>][visualisation]" 
                                    class="visualisation-type">
                                <option value="paragraph" <?php selected($entry['visualisation'], 'paragraph'); ?>>Paragraph</option>
                                <option value="map" <?php selected($entry['visualisation'], 'map'); ?>>Map Animation</option>
                            </select>
                        </div>
                        
                        <!-- Paragraph Fields -->
                        <div class="paragraph-fields full-width" <?php echo $entry['visualisation'] === 'map' ? 'style="display:none"' : ''; ?>>
                            <div>
                                <label for="entry_title_<?php echo $index; ?>">Title:</label>
                                <input type="text" id="entry_title_<?php echo $index; ?>" 
                                       name="history_entries[<?php echo $index; ?>][title]" 
                                       value="<?php echo esc_attr($entry['title'] ?? ''); ?>">
                            </div>
                            <div>
                                <label for="entry_paragraph_<?php echo $index; ?>">Paragraph:</label>
                                <textarea id="entry_paragraph_<?php echo $index; ?>" 
                                          name="history_entries[<?php echo $index; ?>][paragraph]" 
                                          rows="4"><?php echo esc_textarea($entry['paragraph'] ?? ''); ?></textarea>
                            </div>
                            <!-- Impact field removed -->
                        </div>
                        
                        <!-- Animation Fields -->
                        <div class="animation-section full-width" <?php echo $entry['visualisation'] === 'paragraph' ? 'style="display:none"' : ''; ?>>
                            <h4>Animation Settings</h4>
                            <div class="animation-type-options">
                                <label for="entry_animation_type_<?php echo $index; ?>">Animation Type:</label>
                                <select id="entry_animation_type_<?php echo $index; ?>" 
                                        name="history_entries[<?php echo $index; ?>][animation_type]" 
                                        class="animation-type">
                                    <?php foreach ($animation_types as $value => $label): ?>
                                        <option value="<?php echo esc_attr($value); ?>" 
                                            <?php selected($entry['animation_type'] ?? '', $value); ?>>
                                            <?php echo esc_html($label); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div>
                                <label for="entry_animation_label_<?php echo $index; ?>">Animation Label:</label>
                                <input type="text" id="entry_animation_label_<?php echo $index; ?>" 
                                       name="history_entries[<?php echo $index; ?>][animation_label]" 
                                       value="<?php echo esc_attr($entry['animation_label'] ?? ''); ?>">
                            </div>
                            
                            <!-- Single Point Fields -->
                            <div class="single-point-fields" <?php echo ($entry['animation_type'] ?? '') !== 'single_point' && ($entry['animation_type'] ?? '') !== 'language_development' && ($entry['animation_type'] ?? '') !== 'language_suppression' ? 'style="display:none"' : ''; ?>>
                                <div class="coordinate-field">
                                    <label>Center Point:</label>
                                    <input type="number" step="0.01" 
                                           name="history_entries[<?php echo $index; ?>][center_lng]" 
                                           placeholder="Longitude" 
                                           value="<?php echo esc_attr($entry['center_lng'] ?? ''); ?>">
                                    <input type="number" step="0.01" 
                                           name="history_entries[<?php echo $index; ?>][center_lat]" 
                                           placeholder="Latitude" 
                                           value="<?php echo esc_attr($entry['center_lat'] ?? ''); ?>">
                                </div>
                                
                                <?php if (($entry['animation_type'] ?? '') === 'language_development' || ($entry['animation_type'] ?? '') === 'language_suppression'): ?>
                                <div class="languages-field">
                                    <label>Languages (comma-separated):</label>
                                    <input type="text" 
                                           name="history_entries[<?php echo $index; ?>][languages]" 
                                           placeholder="e.g., zulu, xhosa, afrikaans" 
                                           value="<?php echo esc_attr($entry['languages'] ?? ''); ?>">
                                </div>
                                <?php endif; ?>
                            </div>
                            
                            <!-- Migration Fields -->
                            <div class="migration-fields" <?php echo ($entry['animation_type'] ?? '') !== 'migration' ? 'style="display:none"' : ''; ?>>
                                <?php 
                                $origin_points = $entry['origin_points'] ?? [];
                                $destination_points = $entry['destination_points'] ?? [];
                                
                                // If we have single origin/destination points instead of arrays
                                if (isset($entry['origin_lng']) && isset($entry['origin_lat'])) {
                                    $origin_points = [[$entry['origin_lng'], $entry['origin_lat']]];
                                }
                                
                                if (isset($entry['destination_lng']) && isset($entry['destination_lat'])) {
                                    $destination_points = [[$entry['destination_lng'], $entry['destination_lat']]];
                                }
                                
                                // Ensure we have at least one pair
                                if (empty($origin_points) && empty($destination_points)) {
                                    $origin_points = [['']];
                                    $destination_points = [['']];
                                }
                                ?>
                                
                                <div class="multi-point-container">
                                    <?php for ($i = 0; $i < max(count($origin_points), count($destination_points)); $i++): ?>
                                    <div class="point-pair">
                                        <span class="point-pair-label">Pair <?php echo $i + 1; ?>:</span>
                                        <div>
                                            <label>Origin:</label>
                                            <input type="number" step="0.01" 
                                                   name="history_entries[<?php echo $index; ?>][origin_points][<?php echo $i; ?>][0]" 
                                                   placeholder="Lng" 
                                                   value="<?php echo esc_attr($origin_points[$i][0] ?? ''); ?>">
                                            <input type="number" step="0.01" 
                                                   name="history_entries[<?php echo $index; ?>][origin_points][<?php echo $i; ?>][1]" 
                                                   placeholder="Lat" 
                                                   value="<?php echo esc_attr($origin_points[$i][1] ?? ''); ?>">
                                        </div>
                                        <div>
                                            <label>Destination:</label>
                                            <input type="number" step="0.01" 
                                                   name="history_entries[<?php echo $index; ?>][destination_points][<?php echo $i; ?>][0]" 
                                                   placeholder="Lng" 
                                                   value="<?php echo esc_attr($destination_points[$i][0] ?? ''); ?>">
                                            <input type="number" step="0.01" 
                                                   name="history_entries[<?php echo $index; ?>][destination_points][<?php echo $i; ?>][1]" 
                                                   placeholder="Lat" 
                                                   value="<?php echo esc_attr($destination_points[$i][1] ?? ''); ?>">
                        </div>
                                    </div>
                                    <?php endfor; ?>
                                    <button type="button" class="button add-point-pair">+ Add Origin/Destination Pair</button>
                                </div>
                            </div>
                            
                            <!-- Map Preview Placeholder -->
                            <div class="map-preview">
                                <div id="map-container"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.getElementById('map-container');
                const width = container.clientWidth;
                const height = container.clientHeight;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer();
                renderer.setSize(width, height);
                container.appendChild(renderer.domElement);

                const geometry = new THREE.SphereGeometry(0.5, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
                const sphere = new THREE.Mesh(geometry, material);
                scene.add(sphere);

                camera.position.z = 2;

                function animate() {
                    requestAnimationFrame(animate);
                    sphere.rotation.x += 0.01;
                    sphere.rotation.y += 0.01;
                    renderer.render(scene, camera);
                }

                animate();
            });
        </script>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    
    <button type="button" id="add-history-entry" class="button button-primary">Add New History Entry</button>
    
    <script>
        jQuery(document).ready(function($) {
            // Make entries sortable
            $('#history-entries-container').sortable({
                handle: '.sort-handle',
                update: function() {
                    // Reindex entries after sorting
                    reindexEntries();
                }
            });
            
            // Toggle entry form visibility
            $(document).on('click', '.toggle-entry-form', function() {
                $(this).closest('.history-entry').find('.entry-form').slideToggle();
            });
            
            // Remove entry
            $(document).on('click', '.remove-entry', function() {
                if (confirm('Are you sure you want to remove this entry?')) {
                    $(this).closest('.history-entry').remove();
                    reindexEntries();
                }
            });
            
            // Add new entry
            $('#add-history-entry').on('click', function() {
                const newIndex = $('.history-entry').length;
                const entryTemplate = `
                <div class="history-entry" data-index="${newIndex}">
                    <div class="entry-header">
                        <span class="sort-handle">☰</span>
                        <span class="entry-title">New Entry</span>
                        <div class="entry-actions">
                            <button type="button" class="button toggle-entry-form">Edit</button>
                            <button type="button" class="button remove-entry">Remove</button>
                        </div>
                    </div>
                    <div class="entry-form">
                        <div>
                            <label for="entry_year_start_${newIndex}">Year Start:</label>
                            <input type="number" id="entry_year_start_${newIndex}" 
                                   name="history_entries[${newIndex}][year_start]" 
                                   value="1900" required>
                        </div>
                        <!-- Year End field removed -->
                        <div>
                            <label for="entry_map_zoom_${newIndex}">Map Zoom:</label>
                            <select id="entry_map_zoom_${newIndex}" 
                                    name="history_entries[${newIndex}][map_zoom]">
                                <?php foreach ($zoom_options as $value => $label): ?>
                                    <option value="<?php echo esc_attr($value); ?>">
                                        <?php echo esc_html($label); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label for="entry_visualisation_${newIndex}">Visualisation Type:</label>
                            <select id="entry_visualisation_${newIndex}" 
                                    name="history_entries[${newIndex}][visualisation]" 
                                    class="visualisation-type">
                                <option value="paragraph">Paragraph</option>
                                <option value="map">Map Animation</option>
                            </select>
                        </div>
                        
                        <!-- Paragraph Fields -->
                        <div class="paragraph-fields full-width">
                            <div>
                                <label for="entry_title_${newIndex}">Title:</label>
                                <input type="text" id="entry_title_${newIndex}" 
                                       name="history_entries[${newIndex}][title]" 
                                       value="">
                            </div>
                            <div>
                                <label for="entry_paragraph_${newIndex}">Paragraph:</label>
                                <textarea id="entry_paragraph_${newIndex}" 
                                          name="history_entries[${newIndex}][paragraph]" 
                                          rows="4"></textarea>
                            </div>
                            <!-- Impact field removed -->
                        </div>
                        
                        <!-- Animation Fields -->
                        <div class="animation-section full-width" style="display:none">
                            <h4>Animation Settings</h4>
                            <div class="animation-type-options">
                                <label for="entry_animation_type_${newIndex}">Animation Type:</label>
                                <select id="entry_animation_type_${newIndex}" 
                                        name="history_entries[${newIndex}][animation_type]" 
                                        class="animation-type">
                                    <?php foreach ($animation_types as $value => $label): ?>
                                        <option value="<?php echo esc_attr($value); ?>">
                                            <?php echo esc_html($label); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div>
                                <label for="entry_animation_label_${newIndex}">Animation Label:</label>
                                <input type="text" id="entry_animation_label_${newIndex}" 
                                       name="history_entries[${newIndex}][animation_label]" 
                                       value="">
                            </div>
                            
                            <!-- Single Point Fields -->
                            <div class="single-point-fields">
                                <div class="coordinate-field">
                                    <label>Center Point:</label>
                                    <input type="number" step="0.01" 
                                           name="history_entries[${newIndex}][center_lng]" 
                                           placeholder="Longitude" 
                                           value="">
                                    <input type="number" step="0.01" 
                                           name="history_entries[${newIndex}][center_lat]" 
                                           placeholder="Latitude" 
                                           value="">
                                </div>
                                
                                <div class="languages-field" style="display:none">
                                    <label>Languages (comma-separated):</label>
                                    <input type="text" 
                                           name="history_entries[${newIndex}][languages]" 
                                           placeholder="e.g., zulu, xhosa, afrikaans" 
                                           value="">
                                </div>
                            </div>
                            
                            <!-- Migration Fields -->
                            <div class="migration-fields" style="display:none">
                                <div class="multi-point-container">
                                    <div class="point-pair">
                                        <span class="point-pair-label">Pair 1:</span>
                                        <div>
                                            <label>Origin:</label>
                                            <input type="number" step="0.01" 
                                                   name="history_entries[${newIndex}][origin_points][0][0]" 
                                                   placeholder="Lng" 
                                                   value="">
                                            <input type="number" step="0.01" 
                                                   name="history_entries[${newIndex}][origin_points][0][1]" 
                                                   placeholder="Lat" 
                                                   value="">
                                        </div>
                                        <div>
                                            <label>Destination:</label>
                                            <input type="number" step="0.01" 
                                                   name="history_entries[${newIndex}][destination_points][0][0]" 
                                                   placeholder="Lng" 
                                                   value="">
                                            <input type="number" step="0.01" 
                                                   name="history_entries[${newIndex}][destination_points][0][1]" 
                                                   placeholder="Lat" 
                                                   value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Map Preview Placeholder -->
                            <div class="map-preview">
                                <div class="map-preview-label">Map Preview (Coming Soon)</div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                
                $('#history-entries-container').append(entryTemplate);
                reindexEntries();
                
                // Show the form for the new entry
                $('.history-entry').last().find('.entry-form').show();
                
                // Initialize visualisation type change handler for the new entry
                initVisualisationTypeHandlers(newIndex);
                initAnimationTypeHandlers(newIndex);
            });
            
            // Function to reindex entries after sorting or removal
            function reindexEntries() {
                $('.history-entry').each(function(index) {
                    const $entry = $(this);
                    $entry.attr('data-index', index);
                    
                    // Update all input names and IDs
                    $entry.find('input, select, textarea').each(function() {
                        const $input = $(this);
                        const name = $input.attr('name');
                        const id = $input.attr('id');
                        
                        if (name) {
                            $input.attr('name', name.replace(/history_entries[d+]/, `history_entries[${index}]`));
                        }
                        
                        if (id) {
                            $input.attr('id', id.replace(/_d+$/, `_${index}`));
                        }
                    });
                    
                    // Update entry title
                    const title = $entry.find('input[name^="history_entries[' + index + '][title]"]').val();
                    const yearStart = $entry.find('input[name^="history_entries[' + index + '][year_start]"]').val();
                    const yearEnd = $entry.find('input[name^="history_entries[' + index + '][year_end]"]').val();
                    
                    let displayTitle = 'Entry ' + (index + 1);
                    if (title) {
                        displayTitle = title;
                    }
                    
                    $entry.find('.entry-title').text(displayTitle + ' (' + yearStart + ')');
                });
            }
        });
    </script>
    <?php
}

/**
 * Save the history meta box data
 */
function afct_save_history_meta_box_data($post_id) {
    // Check if our nonce is set
    if (!isset($_POST['afct_history_meta_box_nonce'])) {
        return;
    }

    // Verify that the nonce is valid
    if (!wp_verify_nonce($_POST['afct_history_meta_box_nonce'], 'afct_save_history_meta_box_data')) {
        return;
    }

    // If this is an autosave, our form has not been submitted, so we don't want to do anything
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Check the user's permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Sanitize and save the history entries data
    if (isset($_POST['history_entries']) && is_array($_POST['history_entries'])) {
        $history_entries = [];
        
        foreach ($_POST['history_entries'] as $entry) {
            // Sanitize basic fields
            $sanitized_entry = [
                'year_start' => isset($entry['year_start']) ? intval($entry['year_start']) : '',
                'map_zoom' => isset($entry['map_zoom']) ? sanitize_text_field($entry['map_zoom']) : '',
                'visualisation' => isset($entry['visualisation']) ? sanitize_text_field($entry['visualisation']) : '',
                'title' => isset($entry['title']) ? sanitize_text_field($entry['title']) : '',
                'paragraph' => isset($entry['paragraph']) ? wp_kses_post($entry['paragraph']) : '',
                'animation_type' => isset($entry['animation_type']) ? sanitize_text_field($entry['animation_type']) : '',
                'animation_label' => isset($entry['animation_label']) ? sanitize_text_field($entry['animation_label']) : ''
            ];
            
            // Handle coordinates based on animation type
            if (isset($entry['animation_type'])) {
                if ($entry['animation_type'] === 'single_point' || 
                    $entry['animation_type'] === 'language_development' || 
                    $entry['animation_type'] === 'language_suppression' || 
                    $entry['animation_type'] === 'language_recognition') {
                    
                    $sanitized_entry['center_lng'] = isset($entry['center_lng']) ? floatval($entry['center_lng']) : '';
                    $sanitized_entry['center_lat'] = isset($entry['center_lat']) ? floatval($entry['center_lat']) : '';
                    
                    if (isset($entry['languages'])) {
                        $sanitized_entry['languages'] = sanitize_text_field($entry['languages']);
                    }
                } elseif ($entry['animation_type'] === 'migration') {
                    // Handle origin and destination points
                    if (isset($entry['origin_points']) && is_array($entry['origin_points'])) {
                        $sanitized_entry['origin_points'] = [];
                        foreach ($entry['origin_points'] as $point) {
                            $sanitized_entry['origin_points'][] = [
                                isset($point[0]) ? floatval($point[0]) : '',
                                isset($point[1]) ? floatval($point[1]) : ''
                            ];
                        }
                    }
                    
                    if (isset($entry['destination_points']) && is_array($entry['destination_points'])) {
                        $sanitized_entry['destination_points'] = [];
                        foreach ($entry['destination_points'] as $point) {
                            $sanitized_entry['destination_points'][] = [
                                isset($point[0]) ? floatval($point[0]) : '',
                                isset($point[1]) ? floatval($point[1]) : ''
                            ];
                        }
                    }
                }
            }
            
            $history_entries[] = $sanitized_entry;
        }
        
        update_post_meta($post_id, '_afct_history_entries', $history_entries);
    } else {
        delete_post_meta($post_id, '_afct_history_entries');
    }
}
add_action('save_post', 'afct_save_history_meta_box_data');

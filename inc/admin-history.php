<?php
/**
 * Admin interface for the History Timeline
 */

// Ensure we're in the admin area
if (!is_admin()) {
    return;
}

function afct_history_meta_box_callback($post) {
    // Disable WordPress admin sortables that might conflict with our UI
    wp_dequeue_script('postbox');
    
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

    // Visualization types
    $visualization_types = [
        'arrow' => 'Arrow (Origin → Destination)',
        'dot' => 'Single Point',
        'dots' => 'Multiple Points',
        'arrows' => 'Multiple Arrows' // Add this line
    ];
    ?>
    <!-- Wrap everything in a container to scope our styles -->
    <div id="afct-history-container">
        <div style="margin-bottom: 15px;">
            <button type="button" id="add-history-entry" class="button button-primary">Add New History Entry</button>
        </div>

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
                        <div>
                            <label for="entry_year_end_<?php echo $index; ?>">Year End (optional):</label>
                            <input type="number" id="entry_year_end_<?php echo $index; ?>" 
                                   name="history_entries[<?php echo $index; ?>][year_end]" 
                                   value="<?php echo esc_attr($entry['year_end'] ?? ''); ?>">
                        </div>
                        <div>
                            <label for="entry_map_zoom_<?php echo $index; ?>">Map Zoom:</label>
                            <select id="entry_map_zoom_<?php echo $index; ?>" 
                                    name="history_entries[<?php echo $index; ?>][map_zoom]">
                                <?php foreach ($zoom_options as $value => $label): ?>
                                    <option value="<?php echo esc_attr($value); ?>" <?php selected($entry['map_zoom'], $value); ?>><?php echo esc_html($label); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label for="entry_visualisation_<?php echo $index; ?>">Visualisation Type:</label>
                            <select id="entry_visualisation_<?php echo $index; ?>" 
                                    name="history_entries[<?php echo $index; ?>][visualisation]" 
                                    class="visualisation-type">
                                <option value="paragraph" <?php selected(isset($entry['visualisation']) ? $entry['visualisation'] : 'paragraph', 'paragraph'); ?>>Paragraph</option>
                                <option value="map" <?php selected(isset($entry['visualisation']) ? $entry['visualisation'] : '', 'map'); ?>>Map Animation</option>
                            </select>
                        </div>
                        
                        <!-- Title and Paragraph Fields -->
                        <div class="full-width">
                            <div style="margin-bottom: 15px;">
                                <label for="entry_title_<?php echo $index; ?>">Title:</label>
                                <input type="text" id="entry_title_<?php echo $index; ?>" 
                                       name="history_entries[<?php echo $index; ?>][title]" 
                                       value="<?php echo esc_attr($entry['title'] ?? ''); ?>">
                            </div>
                            <div>
                                <label for="entry_paragraph_<?php echo $index; ?>">Paragraph:</label>
                                <textarea id="entry_paragraph_<?php echo $index; ?>" 
                                          name="history_entries[<?php echo $index; ?>][paragraph]" 
                                          rows="8"><?php echo esc_textarea($entry['paragraph'] ?? ''); ?></textarea>
                            </div>
                        </div>
                        
                        <!-- Visualizations Section -->
                        <div class="visualization-section full-width">
                            <h4>Visualizations</h4>
                            
                            <div class="visualizations-container" data-index="<?php echo $index; ?>">
                                <?php 
                                $visualizations = $entry['visualizations'] ?? [];
                                if (empty($visualizations) && isset($entry['animation_type'])) {
                                    // Convert old format to new if needed
                                    if ($entry['animation_type'] === 'migration') {
                                        $visualizations = [
                                            [
                                                'type' => 'arrow',
                                                'origin' => isset($entry['origin_points']) ? $entry['origin_points'][0] : [],
                                                'destination' => isset($entry['destination_points']) ? $entry['destination_points'][0] : [],
                                                'label' => $entry['animation_label'] ?? ''
                                            ]
                                        ];
                                    } elseif ($entry['animation_type'] === 'single_point') {
                                        $visualizations = [
                                            [
                                                'type' => 'dot',
                                                'origin' => [$entry['center_lng'] ?? 0, $entry['center_lat'] ?? 0],
                                                'label' => $entry['animation_label'] ?? ''
                                            ]
                                        ];
                                    }
                                }
                                
                                foreach ($visualizations as $viz_index => $viz): 
                                ?>
                                <div class="visualization-item" data-viz-index="<?php echo $viz_index; ?>">
                                    <div class="viz-header">
                                        <span>Visualization <?php echo $viz_index + 1; ?></span>
                                        <button type="button" class="button remove-viz">Remove</button>
                                    </div>
                                    
                                    <div class="viz-type">
                                        <label>Type:</label>
                                        <select name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][type]" class="viz-type-select">
                                            <?php foreach ($visualization_types as $value => $label): ?>
                                                <option value="<?php echo esc_attr($value); ?>" 
                                                    <?php selected($viz['type'] ?? 'dot', $value); ?>>
                                                    <?php echo esc_html($label); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    
                                    <div class="viz-label">
                                        <label>Label:</label>
                                        <input type="text" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][label]" 
                                               value="<?php echo esc_attr($viz['label'] ?? ''); ?>">
                                    </div>
                                    
                                    <div class="viz-origin">
                                        <label>Origin Point:</label>
                                        <input type="number" step="0.01" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][origin][0]" 
                                               placeholder="Longitude" 
                                               value="<?php echo esc_attr($viz['origin'][0] ?? ''); ?>">
                                        <input type="number" step="0.01" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][origin][1]" 
                                               placeholder="Latitude" 
                                               value="<?php echo esc_attr($viz['origin'][1] ?? ''); ?>">
                                    </div>
                                    
                                    <div class="viz-destination" <?php echo ($viz['type'] ?? '') !== 'arrow' ? 'style="display:none"' : ''; ?>>
                                        <label>Destination Point:</label>
                                        <input type="number" step="0.01" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][destination][0]" 
                                               placeholder="Longitude" 
                                               value="<?php echo esc_attr($viz['destination'][0] ?? ''); ?>">
                                        <input type="number" step="0.01" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][destination][1]" 
                                               placeholder="Latitude" 
                                               value="<?php echo esc_attr($viz['destination'][1] ?? ''); ?>">
                                    </div>
                                    
                                    <div class="viz-dots-details" <?php echo ($viz['type'] ?? '') !== 'dots' ? 'style="display:none"' : ''; ?>>
                                        <div class="dots-coordinates">
                                            <h5>Dot Coordinates</h5>
                                            <div class="dots-coordinates-container">
                                                <?php 
                                                $dotCoordinates = $viz['dotCoordinates'] ?? [];
                                                if (empty($dotCoordinates) && isset($viz['origin'])) {
                                                    // Add origin as first coordinate if no coordinates exist
                                                    $dotCoordinates = [$viz['origin']];
                                                }
                                
                                                foreach ($dotCoordinates as $dotIndex => $coord): 
                                                ?>
                                                <div class="dot-coordinate-pair">
                                                    <input type="number" step="0.01" 
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][dotCoordinates][<?php echo $dotIndex; ?>][0]" 
                                                           placeholder="Longitude" 
                                                           value="<?php echo esc_attr($coord[0] ?? ''); ?>">
                                                    <input type="number" step="0.01" 
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][dotCoordinates][<?php echo $dotIndex; ?>][1]" 
                                                           placeholder="Latitude" 
                                                           value="<?php echo esc_attr($coord[1] ?? ''); ?>">
                                                    <button type="button" class="button remove-dot-coordinate">×</button>
                                                </div>
                                                <?php endforeach; ?>
                                            </div>
                                            <button type="button" class="button add-dot-coordinate">Add Dot Coordinate</button>
                                        </div>
                                    </div>

                                    <div class="viz-arrows-details" <?php echo ($viz['type'] ?? '') !== 'arrows' ? 'style="display:none"' : ''; ?>>
                                        <div class="arrows-coordinates">
                                            <h5>Arrows (Origin → Destination)</h5>
                                            <div class="arrows-coordinates-container">
                                                <?php
                                                $arrows = $viz['arrows'] ?? [];
                                                // Ensure arrows is an array
                                                if (!is_array($arrows)) {
                                                    $arrows = [];
                                                }
                                                foreach ($arrows as $arrowIndex => $arrow):
                                                    // Ensure origin and destination are arrays with at least two elements
                                                    $origin = (isset($arrow['origin']) && is_array($arrow['origin'])) ? $arrow['origin'] : [null, null];
                                                    $destination = (isset($arrow['destination']) && is_array($arrow['destination'])) ? $arrow['destination'] : [null, null];
                                                ?>
                                                <div class="arrow-coordinate-pair">
                                                    <label>Arrow <?php echo $arrowIndex + 1; ?>:</label>
                                                    <input type="number" step="0.01"
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][arrows][<?php echo $arrowIndex; ?>][origin][0]"
                                                           placeholder="Origin Lon"
                                                           value="<?php echo esc_attr($origin[0] ?? ''); ?>">
                                                    <input type="number" step="0.01"
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][arrows][<?php echo $arrowIndex; ?>][origin][1]"
                                                           placeholder="Origin Lat"
                                                           value="<?php echo esc_attr($origin[1] ?? ''); ?>">
                                                    <span>→</span>
                                                    <input type="number" step="0.01"
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][arrows][<?php echo $arrowIndex; ?>][destination][0]"
                                                           placeholder="Dest Lon"
                                                           value="<?php echo esc_attr($destination[0] ?? ''); ?>">
                                                    <input type="number" step="0.01"
                                                           name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][arrows][<?php echo $arrowIndex; ?>][destination][1]"
                                                           placeholder="Dest Lat"
                                                           value="<?php echo esc_attr($destination[1] ?? ''); ?>">
                                                    <button type="button" class="button remove-arrow-coordinate">×</button>
                                                </div>
                                                <?php endforeach; ?>
                                            </div>
                                            <button type="button" class="button add-arrow-coordinate">Add Arrow</button>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            
                            <button type="button" class="button add-visualization" data-entry-index="<?php echo $index; ?>">
                                Add Visualization
                            </button>
                            
                            <!-- Map Preview -->
                            <div class="map-preview full-width">
                                <h4>Map Preview</h4>
                                <div id="map-preview-container-<?php echo $index; ?>" class="map-preview-container" data-entry-index="<?php echo $index; ?>" data-visualizations='<?php echo json_encode($entry['visualizations'] ?? []); ?>'></div>
                            </div>
                        </div> <!-- End visualization-section -->
                    </div> <!-- End entry-form -->
                </div> <!-- End history-entry -->
            <?php endforeach; ?>
        <?php endif; ?>
        </div>
        
        <!-- JSON Import Section -->
        <div class="json-import-section" style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;">
            <h3>Import History Timeline Data</h3>
            <p>Upload a JSON file or paste JSON data to import history timeline entries. This will replace all existing entries.</p>
            <textarea name="history_json" id="json-import-data" rows="10" style="width: 100%; font-family: monospace;"></textarea>
            <div style="margin-top: 10px;">
                <button type="button" id="validate-json" class="button">Validate JSON</button>
                <button type="button" id="import-json" class="button button-primary" style="margin-left: 10px;">Import JSON</button>
                <span id="json-validation-result" style="margin-left: 10px;"></span>
            </div>
            <script>
                jQuery(document).ready(function($) {
                    // Validate JSON button click handler
                    $('#validate-json').on('click', function() {
                        const jsonText = $('#json-import-data').val().trim();
                        if (!jsonText) {
                            $('#json-validation-result').html('<span style="color: red;">Please enter JSON data.</span>');
                            return;
                        }
                        
                        try {
                            // Handle potential BOM character
                            const cleanJson = jsonText.replace(/^\uFEFF/, '');
                            JSON.parse(cleanJson);
                            $('#json-validation-result').html('<span style="color: green;">Valid JSON format!</span>');
                        } catch (error) {
                            $('#json-validation-result').html('<span style="color: red;">Invalid JSON: ' + error.message + '</span>');
                        }
                    });
                    
                    // Import JSON button click handler
                    $('#import-json').on('click', function() {
                        const jsonText = $('#json-import-data').val().trim();
                        if (!jsonText) {
                            $('#json-validation-result').html('<span style="color: red;">Please enter JSON data.</span>');
                            return;
                        }
                        
                        try {
                            // Handle potential BOM character
                            const cleanJson = jsonText.replace(/^\uFEFF/, '');
                            const historyData = JSON.parse(cleanJson);
                            
                            // Clear existing entries
                            $('#history-entries-container').empty();
                            
                            // Import each entry
                            historyData.forEach(function(entry, index) {
                                // Trigger the add entry button to create a new entry
                                $('#add-history-entry').trigger('click');
                                
                                // Get the newly created entry
                                const $newEntry = $('.history-entry').last();
                                
                                // Set the entry index
                                $newEntry.attr('data-index', index);
                                
                                // Open the entry form to ensure all fields are accessible
                                $newEntry.find('.entry-form').show();
                                
                                // Fill in the form fields
                                $newEntry.find('input[name^="history_entries[' + index + '][year_start]"]').val(entry.year_start || '');
                                $newEntry.find('select[name^="history_entries[' + index + '][map_zoom]"]').val(entry.map_zoom || 'africa');
                                $newEntry.find('input[name^="history_entries[' + index + '][title]"]').val(entry.title || '');
                                $newEntry.find('textarea[name^="history_entries[' + index + '][paragraph]"]').val(entry.paragraph || '');
                                
                                // Set visualization type (default to paragraph if not specified)
                                const visualizationType = entry.visualisation || 'paragraph';
                                $newEntry.find('select[name^="history_entries[' + index + '][visualisation]"]').val(visualizationType);
                                
                                // Handle visualizations
                                if (entry.visualizations && entry.visualizations.length > 0) {
                                    const $vizContainer = $newEntry.find('.visualizations-container');
                                    $vizContainer.empty(); // Clear default visualizations
                                    
                                    entry.visualizations.forEach(function(viz, vizIndex) {
                                        // Add visualization button
                                        $newEntry.find('.add-visualization').trigger('click');
                                        
                                        // Get the newly created visualization
                                        const $newViz = $vizContainer.find('.visualization-item').last();
                                        
                                        // Fill in visualization fields
                                        $newViz.find('select.viz-type-select').val(viz.type || 'dot').trigger('change');
                                        $newViz.find('input[name$="[label]"]').val(viz.label || '');
                                        
                                        // Set origin coordinates
                                        if (viz.origin) {
                                            $newViz.find('input[name$="[origin][0]"]').val(viz.origin[0] || '');
                                            $newViz.find('input[name$="[origin][1]"]').val(viz.origin[1] || '');
                                        }
                                        
                                        // Set destination coordinates for arrows
                                        if (viz.type === 'arrow' && viz.destination) {
                                            $newViz.find('input[name$="[destination][0]"]').val(viz.destination[0] || '');
                                            $newViz.find('input[name$="[destination][1]"]').val(viz.destination[1] || '');
                                        }
                                        
                                        // Handle dot coordinates for dots type
                                        if (viz.type === 'dots' && viz.dotCoordinates && viz.dotCoordinates.length > 0) {
                                            const $dotsContainer = $newViz.find('.dots-coordinates-container');
                                            $dotsContainer.empty(); // Clear default coordinates
                        
                                            viz.dotCoordinates.forEach(function(coord, coordIndex) {
                                                // Add coordinate button
                                                $newViz.find('.add-dot-coordinate').trigger('click');
                            
                                                // Get the newly created coordinate pair
                                                const $newCoord = $dotsContainer.find('.dot-coordinate-pair').last();
                            
                                                // Fill in coordinate fields
                                                $newCoord.find('input').eq(0).val(coord[0] || '');
                                                $newCoord.find('input').eq(1).val(coord[1] || '');
                                            });
                                        }
                    
                                        // Handle arrows for arrows type
                                        if (viz.type === 'arrows' && viz.arrows && viz.arrows.length > 0) {
                                            const $arrowsContainer = $newViz.find('.arrows-coordinates-container');
                                            $arrowsContainer.empty(); // Clear default coordinates
                        
                                            viz.arrows.forEach(function(arrow, arrowIndex) {
                                                // Add arrow button
                                                $newViz.find('.add-arrow-coordinate').trigger('click');
                            
                                                // Get the newly created arrow pair
                                                const $newArrow = $arrowsContainer.find('.arrow-coordinate-pair').last();
                            
                                                // Fill in arrow fields
                                                if (arrow.origin) {
                                                    $newArrow.find('input').eq(0).val(arrow.origin[0] || '');
                                                    $newArrow.find('input').eq(1).val(arrow.origin[1] || '');
                                                }
                                                if (arrow.destination) {
                                                    $newArrow.find('input').eq(2).val(arrow.destination[0] || '');
                                                    $newArrow.find('input').eq(3).val(arrow.destination[1] || '');
                                                }
                                            });
                                        }
                                    });
                                }
                                
                                // Update the entry title display
                                const entryTitle = entry.title || 'Entry ' + (index + 1);
                                const yearStart = entry.year_start || '';
                                $newEntry.find('.entry-title').text(entryTitle + ' (' + yearStart + ')');
                            });
                            
                            // Show success message
                            $('#json-validation-result').html('<span style="color: green;">Successfully imported ' + historyData.length + ' entries!</span>');
                            
                        } catch (error) {
                            $('#json-validation-result').html('<span style="color: red;">Error importing JSON: ' + error.message + '</span>');
                        }
                    });
                });
            </script>
        </div>
    </div>
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
                'id' => isset($entry['year_start']) ? intval($entry['year_start']) : '',
                'map_zoom' => isset($entry['map_zoom']) ? sanitize_text_field($entry['map_zoom']) : 'africa',
                'title' => isset($entry['title']) ? sanitize_text_field($entry['title']) : '',
                'paragraph' => isset($entry['paragraph']) ? wp_kses_post($entry['paragraph']) : ''
            ];
            
            // Add year_end if provided
            if (!empty($entry['year_end'])) {
                $sanitized_entry['year_end'] = intval($entry['year_end']);
            }
            
            // Handle visualizations
            if (isset($entry['visualizations']) && is_array($entry['visualizations'])) {
                $sanitized_entry['visualizations'] = [];
                
                foreach ($entry['visualizations'] as $viz) {
                    $sanitized_viz = [
                        'type' => isset($viz['type']) ? sanitize_text_field($viz['type']) : 'dot',
                        'label' => isset($viz['label']) ? sanitize_text_field($viz['label']) : '',
                        'origin' => [
                            isset($viz['origin'][0]) ? floatval($viz['origin'][0]) : 0,
                            isset($viz['origin'][1]) ? floatval($viz['origin'][1]) : 0
                        ]
                    ];
                    
                    // Add destination for arrows
                    if ($sanitized_viz['type'] === 'arrow' && isset($viz['destination'])) {
                        $sanitized_viz['destination'] = [
                            isset($viz['destination'][0]) ? floatval($viz['destination'][0]) : 0,
                            isset($viz['destination'][1]) ? floatval($viz['destination'][1]) : 0
                        ];
                    }
                    
                    // Add dot coordinates for dots type
                    if ($sanitized_viz['type'] === 'dots') {
                        if (isset($viz['dotCoordinates']) && is_array($viz['dotCoordinates'])) {
                            $sanitized_viz['dotCoordinates'] = [];
                            foreach ($viz['dotCoordinates'] as $coord) {
                                if (is_array($coord) && isset($coord[0]) && isset($coord[1])) {
                                    $sanitized_viz['dotCoordinates'][] = [
                                        floatval($coord[0]),
                                        floatval($coord[1])
                                    ];
                                }
                            }
                        }
                    }

                    // Add arrows for arrows type
                    if ($sanitized_viz['type'] === 'arrows') {
                        if (isset($viz['arrows']) && is_array($viz['arrows'])) {
                            $sanitized_viz['arrows'] = [];
                            foreach ($viz['arrows'] as $arrow) {
                                if (is_array($arrow) && isset($arrow['origin']) && is_array($arrow['origin']) && isset($arrow['destination']) && is_array($arrow['destination'])) {
                                    $sanitized_arrow = [
                                        'origin' => [
                                            isset($arrow['origin'][0]) ? floatval($arrow['origin'][0]) : 0,
                                            isset($arrow['origin'][1]) ? floatval($arrow['origin'][1]) : 0
                                        ],
                                        'destination' => [
                                            isset($arrow['destination'][0]) ? floatval($arrow['destination'][0]) : 0,
                                            isset($arrow['destination'][1]) ? floatval($arrow['destination'][1]) : 0
                                        ]
                                    ];
                                    // Only add if both origin and destination seem valid (at least have values)
                                    if ($sanitized_arrow['origin'][0] !== 0 || $sanitized_arrow['origin'][1] !== 0 || $sanitized_arrow['destination'][0] !== 0 || $sanitized_arrow['destination'][1] !== 0) {
                                        $sanitized_viz['arrows'][] = $sanitized_arrow;
                                    }
                                }
                            }
                        } else {
                             $sanitized_viz['arrows'] = []; // Ensure it's an empty array if not set or not an array
                        }
                    }
                    
                    $sanitized_entry['visualizations'][] = $sanitized_viz;
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


function afct_admin_history_scripts($hook) {                                                                                                                                                   
    // Only load on post edit screens                                                                                                                                                          
    if ('post.php' != $hook && 'post-new.php' != $hook) {                                                                                                                                      
        return;                                                                                                                                                                                
    }                                                                                                                                                                                          
                                                                                                                                                                                               
    // Check if we are editing the correct post type or page template                                                                                                                          
    global $post;                                                                                                                                                                              
    if (!$post || get_post_type($post->ID) !== 'page' /* Or your specific post type */ ) {                                                                                                     
        // Or check template: $template = get_post_meta($post->ID, '_wp_page_template', true); if ($template !== 'your-history-template.php') return;                                          
        return;                                                                                                                                                                                
    }                                                                                                                                                                                          
                                                                                                                                                                                               
    // --- Enqueue CSS ---                                                                                                                                                                     
    wp_enqueue_style(                                                                                                                                                                          
        'afct-admin-history-style',                                                                                                                                                            
        get_template_directory_uri() . '/css/admin-history.css', // Adjust path if it's a plugin                                                                                               
        [], // Dependencies                                                                                                                                                                    
        filemtime(get_template_directory() . '/css/admin-history.css') // Versioning                                                                                                           
    );                                                                                                                                                                                         
                                                                                                                                                                                               
    // --- Enqueue JS ---                                                                                                                                                                      
    // Dependencies: jQuery, jQuery UI Sortable, D3, TopoJSON                                                                                                                                  
    wp_enqueue_script('jquery-ui-sortable');                                                                                                                                                   
    // Make sure D3 and TopoJSON are registered/enqueued if not already handled elsewhere                                                                                                      
    // wp_enqueue_script('d3', get_template_directory_uri() . '/js/d3.min.js', [], '7.8.5', true); // Example                                                                                  
    // wp_enqueue_script('topojson', get_template_directory_uri() . '/js/topojson.min.js', [], '3.0.2', true); // Example                                                                      
                                                                                                                                                                                               
    wp_enqueue_script(                                                                                                                                                                         
        'afct-admin-history-script',                                                                                                                                                           
        get_template_directory_uri() . '/js/admin-history.js', // Adjust path if it's a plugin                                                                                                 
        ['jquery', 'jquery-ui-sortable', 'd3', 'topojson'], // Dependencies                                                                                                                    
        filemtime(get_template_directory() . '/js/admin-history.js'), // Versioning                                                                                                            
        true // Load in footer                                                                                                                                                                 
    );                                                                                                                                                                                         
                                                                                                                                                                                               
    // --- Localize Data for JS ---                                                                                                                                                            
    // Get data needed by JS (same as used in the original PHP file)                                                                                                                           
    $zoom_options = [                                                                                                                                                                          
        'south_africa' => 'South Africa',                                                                                                                                                      
        'africa' => 'Africa',                                                                                                                                                                  
        'europe_and_africa' => 'Europe and Africa'                                                                                                                                             
    ];                                                                                                                                                                                         
    $visualization_types = [                                                                                                                                                                   
        'arrow' => 'Arrow (Origin → Destination)',                                                                                                                                             
        'dot' => 'Single Point',                                                                                                                                                               
        'dots' => 'Multiple Points',
        'arrows' => 'Multiple Arrows'                                                                                                                                                            
    ];                                                                                                                                                                                         
    $topojson_url = get_template_directory_uri() . '/js/countries-110m.json'; // Adjust path                                                                                                   
                                                                                                                                                                                               
    wp_localize_script(                                                                                                                                                                        
        'afct-admin-history-script', // Handle for the script that needs the data                                                                                                              
        'afctHistoryAdminData',    // JavaScript object name                                                                                                                                   
        [                                                                                                                                                                                      
            'zoomOptions'        => $zoom_options,                                                                                                                                             
            'visualizationTypes' => $visualization_types,                                                                                                                                      
            'topoJsonUrl'        => $topojson_url,                                                                                                                                             
            // Add any other data needed, like nonces if required for AJAX later                                                                                                               
            // 'nonce' => wp_create_nonce('your_ajax_nonce_action')                                                                                                                            
        ]                                                                                                                                                                                      
    );                                                                                                                                                                                         
}                                                                                                                                                                                              
add_action('admin_enqueue_scripts', 'afct_admin_history_scripts');                                                                                                                             
               

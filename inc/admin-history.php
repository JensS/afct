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

    // Visualization types
    $visualization_types = [
        'arrow' => 'Arrow (Origin → Destination)',
        'dot' => 'Single Point',
        'dots' => 'Multiple Points'
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
        .dots-coordinates {
            margin-top: 10px;
            border: 1px solid #eee;
            padding: 10px;
            background-color: #f9f9f9;
        }
        .dots-coordinates h5 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        .dot-coordinate-pair {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .dot-coordinate-pair input {
            width: 80px;
            margin-right: 5px;
        }
        .remove-dot-coordinate {
            padding: 0 5px !important;
            min-height: 0 !important;
            height: 25px !important;
            line-height: 1 !important;
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
                        
                        <!-- Title and Paragraph Fields -->
                        <div class="full-width">
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
                                    
                                    <div class="viz-languages" <?php echo ($viz['type'] ?? '') !== 'dots' ? 'style="display:none"' : ''; ?>>
                                        <label>Languages (comma-separated):</label>
                                        <input type="text" 
                                               name="history_entries[<?php echo $index; ?>][visualizations][<?php echo $viz_index; ?>][languages]" 
                                               placeholder="e.g., zulu, xhosa, afrikaans" 
                                               value="<?php 
                                                  if (isset($viz['languages']) && is_array($viz['languages'])) {
                                                      echo esc_attr(implode(', ', $viz['languages']));
                                                  } else {
                                                      echo esc_attr($viz['languages'] ?? '');
                                                  }
                                               ?>">
                        
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
                                </div>
                                <?php endforeach; ?>
                            </div>
                            
                            <button type="button" class="button add-visualization" data-entry-index="<?php echo $index; ?>">
                                Add Visualization
                            </button>
                        </div>
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
        <script src="<?php echo get_template_directory_uri(); ?>/js/three.min.js"></script>
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
            
            // Add new visualization
            $(document).on('click', '.add-visualization', function() {
                const entryIndex = $(this).data('entry-index');
                const container = $(this).prev('.visualizations-container');
                const vizIndex = container.children('.visualization-item').length;
                
                const vizTemplate = `
                <div class="visualization-item" data-viz-index="${vizIndex}">
                    <div class="viz-header">
                        <span>Visualization ${vizIndex + 1}</span>
                        <button type="button" class="button remove-viz">Remove</button>
                    </div>
                    
                    <div class="viz-type">
                        <label>Type:</label>
                        <select name="history_entries[${entryIndex}][visualizations][${vizIndex}][type]" class="viz-type-select">
                            <?php foreach ($visualization_types as $value => $label): ?>
                                <option value="<?php echo esc_attr($value); ?>">
                                    <?php echo esc_html($label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="viz-label">
                        <label>Label:</label>
                        <input type="text" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][label]" 
                               value="">
                    </div>
                    
                    <div class="viz-origin">
                        <label>Origin Point:</label>
                        <input type="number" step="0.01" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][origin][0]" 
                               placeholder="Longitude" 
                               value="">
                        <input type="number" step="0.01" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][origin][1]" 
                               placeholder="Latitude" 
                               value="">
                    </div>
                    
                    <div class="viz-destination">
                        <label>Destination Point:</label>
                        <input type="number" step="0.01" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][destination][0]" 
                               placeholder="Longitude" 
                               value="">
                        <input type="number" step="0.01" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][destination][1]" 
                               placeholder="Latitude" 
                               value="">
                    </div>
                    
                    <div class="viz-languages" style="display:none">
                        <label>Languages (comma-separated):</label>
                        <input type="text" 
                               name="history_entries[${entryIndex}][visualizations][${vizIndex}][languages]" 
                               placeholder="e.g., zulu, xhosa, afrikaans" 
                               value="">
                    </div>
                </div>
                `;
                
                container.append(vizTemplate);
                
                // Initialize visualization type change handler
                initVizTypeHandlers(entryIndex, vizIndex);
            });
            
            // Remove visualization
            $(document).on('click', '.remove-viz', function() {
                if (confirm('Are you sure you want to remove this visualization?')) {
                    $(this).closest('.visualization-item').remove();
                    reindexVisualizations($(this).closest('.visualizations-container'));
                }
            });
            
            // Handle visualization type change
            $(document).on('change', '.viz-type-select', function() {
                const type = $(this).val();
                const item = $(this).closest('.visualization-item');
                
                item.find('.viz-destination').toggle(type === 'arrow');
                item.find('.viz-languages').toggle(type === 'dots');
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
                        <div>
                            <label for="entry_year_end_${newIndex}">Year End (optional):</label>
                            <input type="number" id="entry_year_end_${newIndex}" 
                                   name="history_entries[${newIndex}][year_end]" 
                                   value="">
                        </div>
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
                        
                        <!-- Title and Paragraph Fields -->
                        <div class="full-width">
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
                        </div>
                        
                        <!-- Visualizations Section -->
                        <div class="visualization-section full-width">
                            <h4>Visualizations</h4>
                            
                            <div class="visualizations-container" data-index="${newIndex}">
                                <!-- Visualizations will be added here -->
                            </div>
                            
                            <button type="button" class="button add-visualization" data-entry-index="${newIndex}">
                                Add Visualization
                            </button>
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
                            $input.attr('name', name.replace(/history_entries\[\d+\]/, `history_entries[${index}]`));
                        }
                        
                        if (id) {
                            $input.attr('id', id.replace(/_\d+$/, `_${index}`));
                        }
                    });
                    
                    // Update visualization container index
                    $entry.find('.visualizations-container').attr('data-index', index);
                    $entry.find('.add-visualization').attr('data-entry-index', index);
                    
                    // Update entry title
                    const title = $entry.find('input[name^="history_entries[' + index + '][title]"]').val();
                    const yearStart = $entry.find('input[name^="history_entries[' + index + '][year_start]"]').val();
                    
                    let displayTitle = 'Entry ' + (index + 1);
                    if (title) {
                        displayTitle = title;
                    }
                    
                    $entry.find('.entry-title').text(displayTitle + ' (' + yearStart + ')');
                });
            }
            
            // Function to reindex visualizations within a container
            function reindexVisualizations($container) {
                const entryIndex = $container.data('index');
                
                $container.find('.visualization-item').each(function(vizIndex) {
                    const $viz = $(this);
                    $viz.attr('data-viz-index', vizIndex);
                    
                    // Update all input names
                    $viz.find('input, select').each(function() {
                        const $input = $(this);
                        const name = $input.attr('name');
                        
                        if (name) {
                            $input.attr('name', name.replace(/history_entries\[\d+\]\[visualizations\]\[\d+\]/, 
                                                           `history_entries[${entryIndex}][visualizations][${vizIndex}]`));
                        }
                    });
                    
                    // Update header
                    $viz.find('.viz-header span').text(`Visualization ${vizIndex + 1}`);
                });
            }
            
            // Handle adding new dot coordinates
            $(document).on('click', '.add-dot-coordinate', function() {
                const container = $(this).prev('.dots-coordinates-container');
                const entryIndex = $(this).closest('.history-entry').data('index');
                const vizIndex = $(this).closest('.visualization-item').data('viz-index');
                const dotIndex = container.children('.dot-coordinate-pair').length;
                
                const template = `
                <div class="dot-coordinate-pair">
                    <input type="number" step="0.01" 
                           name="history_entries[${entryIndex}][visualizations][${vizIndex}][dotCoordinates][${dotIndex}][0]" 
                           placeholder="Longitude" 
                           value="">
                    <input type="number" step="0.01" 
                           name="history_entries[${entryIndex}][visualizations][${vizIndex}][dotCoordinates][${dotIndex}][1]" 
                           placeholder="Latitude" 
                           value="">
                    <button type="button" class="button remove-dot-coordinate">×</button>
                </div>
                `;
                
                container.append(template);
            });

            // Handle removing dot coordinates
            $(document).on('click', '.remove-dot-coordinate', function() {
                $(this).closest('.dot-coordinate-pair').remove();
                // Reindex the remaining coordinates
                const container = $(this).closest('.dots-coordinates-container');
                reindexDotCoordinates(container);
            });

            // Function to reindex dot coordinates
            function reindexDotCoordinates(container) {
                const entryIndex = container.closest('.history-entry').data('index');
                const vizIndex = container.closest('.visualization-item').data('viz-index');
                
                container.find('.dot-coordinate-pair').each(function(dotIndex) {
                    $(this).find('input').each(function() {
                        const name = $(this).attr('name');
                        if (name) {
                            $(this).attr('name', name.replace(/history_entries\[\d+\]\[visualizations\]\[\d+\]\[dotCoordinates\]\[\d+\]/, 
                                                           `history_entries[${entryIndex}][visualizations][${vizIndex}][dotCoordinates][${dotIndex}]`));
                        }
                    });
                });
            }
            
            // Initialize visualization type handlers
            function initVizTypeHandlers(entryIndex, vizIndex) {
                const selector = `select[name="history_entries[${entryIndex}][visualizations][${vizIndex}][type]"]`;
                $(selector).trigger('change');
            }
            
            // Initialize all visualization type handlers
            $('.viz-type-select').each(function() {
                $(this).trigger('change');
            });
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
                    
                    // Add languages for dots
                    if ($sanitized_viz['type'] === 'dots') {
                        if (isset($viz['languages'])) {
                            $languages = sanitize_text_field($viz['languages']);
                            $sanitized_viz['languages'] = array_map('trim', explode(',', $languages));
                        }
                        
                        // Add dot coordinates
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

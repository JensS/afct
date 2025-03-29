
jQuery(document).ready(function($) {
    // Initialize map previews for all entries
    $('.map-preview-container').each(function() {
        const container = $(this);
        const entryIndex = container.data('entry-index');
        const visualizations = container.data('visualizations');
        initMapPreview(container[0], visualizations);
    });

    function initMapPreview(container, visualizations) {
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Set dimensions
        const width = container.clientWidth || 400;
        const height = 300;
        
        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
        
        // Create projection
        const projection = d3.geoMercator()
            .center([25, 0])
            .scale(width / 3)
            .translate([width / 2, height / 2]);
        
        // Create path generator
        const path = d3.geoPath().projection(projection);
        
        // Load and render Africa topojson
        d3.json(afctHistoryAdminData.topoJsonUrl) 
            .then(function(data) {
                // Draw Africa map
                svg.append("g")
                    .selectAll("path")
                    .data(topojson.feature(data, data.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", "#ccc")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5);
                
                // Add visualizations
                if (visualizations && visualizations.length) {
                    visualizations.forEach(viz => {
                        if (!viz.origin) return;
                        
                        const originPos = projection(viz.origin);
                        
                        if (viz.type === 'arrow' && viz.destination) {
                            const destPos = projection(viz.destination);
                            
                            // Draw arrow line
                            svg.append("path")
                                .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
                                .attr("stroke", "#f00")
                                .attr("stroke-width", 2)
                                .attr("stroke-dasharray", "5,5");
                            
                            // Draw origin point
                            svg.append("circle")
                                .attr("cx", originPos[0])
                                .attr("cy", originPos[1])
                                .attr("r", 5)
                                .attr("fill", "#f00");
                        } 
                        else if (viz.type === 'dot') {
                            // Draw dot
                            svg.append("circle")
                                .attr("cx", originPos[0])
                                .attr("cy", originPos[1])
                                .attr("r", 8)
                                .attr("fill", "#ff9800");
                        }
                        else if (viz.type === 'dots') {
                            // Draw main dot
                            svg.append("circle")
                                .attr("cx", originPos[0])
                                .attr("cy", originPos[1])
                                .attr("r", 10)
                                .attr("fill", "#2ca02c")
                                .attr("opacity", 0.7);
                            
                            // Draw smaller dots for coordinates
                            if (viz.dotCoordinates && viz.dotCoordinates.length) {
                                viz.dotCoordinates.forEach((coord, i) => {
                                    const dotPos = projection(coord);
                                    
                                    svg.append("circle")
                                        .attr("cx", dotPos[0])
                                        .attr("cy", dotPos[1])
                                        .attr("r", 5)
                                        .attr("fill", "#2ca02c")
                                        .attr("opacity", 0.7);
                                });
                            }
                        }
                        else if (viz.type === 'arrows' && viz.arrows && viz.arrows.length) { // Add this else if block
                            viz.arrows.forEach(arrow => {
                                if (arrow.origin && arrow.destination) {
                                    const arrowOriginPos = projection(arrow.origin);
                                    const arrowDestPos = projection(arrow.destination);

                                    // Draw arrow line
                                    svg.append("path")
                                        .attr("d", `M${arrowOriginPos[0]},${arrowOriginPos[1]} L${arrowDestPos[0]},${arrowDestPos[1]}`)
                                        .attr("stroke", "#00f") // Use a different color (e.g., blue)
                                        .attr("stroke-width", 2)
                                        .attr("stroke-dasharray", "4,4"); // Different dash style

                                    // Draw origin point
                                    svg.append("circle")
                                        .attr("cx", arrowOriginPos[0])
                                        .attr("cy", arrowOriginPos[1])
                                        .attr("r", 4) // Slightly smaller radius
                                        .attr("fill", "#00f");
                                }
                            });
                        }
                    });
                }
            })
            .catch(error => console.error("Error loading map data:", error));
    }

    // Ensure WordPress admin UI is not affected
    $('.meta-box-sortables').sortable({
        disabled: true
    });

    $('.postbox .hndle').css('cursor', 'pointer');

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
                              ${Object.entries(afctHistoryAdminData.visualizationTypes).map(([value, label]) =>                                                                              
                                   `<option value="${value}">${label}</option>`                                                                                                               
                               ).join('')}                                                                                                                                                    
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
            
            <div class="viz-destination" style="display:none"> <!-- Default to hidden -->
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
            
            <div class="viz-dots-details" style="display:none">
                <!-- Dot coordinates will be added here if needed -->
                <div class="dots-coordinates">
                    <h5>Dot Coordinates</h5>
                    <div class="dots-coordinates-container">
                        <!-- Coordinate pairs go here -->
                    </div>
                    <button type="button" class="button add-dot-coordinate">Add Dot Coordinate</button>
                </div>
            </div>

            <div class="viz-arrows-details" style="display:none">
                <div class="arrows-coordinates">
                    <h5>Arrows (Origin → Destination)</h5>
                    <div class="arrows-coordinates-container">
                        <!-- Arrow coordinate pairs go here -->
                    </div>
                    <button type="button" class="button add-arrow-coordinate">Add Arrow</button>
                </div>
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
        item.find('.viz-dots-details').toggle(type === 'dots');
        item.find('.viz-arrows-details').toggle(type === 'arrows'); // Add this line
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
                    <label for="entry_year_end_${newIndex}">Year End (optional):</label>
                    <input type="number" id="entry_year_end_${newIndex}" 
                           name="history_entries[${newIndex}][year_end]" 
                           value="">
                </div>
                <div>
                    <label for="entry_map_zoom_${newIndex}">Map Zoom:</label>
                    <select id="entry_map_zoom_${newIndex}"                                                                                                                        
                                       name="history_entries[${newIndex}][map_zoom]">                                                                                                         
                                   ${Object.entries(afctHistoryAdminData.zoomOptions).map(([value, label]) =>                                                                                 
                                       `<option value="${value}">${label}</option>`                                                                                                           
                                   ).join('')}                                                                                                                                                
                               </select>  
                </div>
                
                <!-- Title and Paragraph Fields -->
                <div class="full-width">
                    <div style="margin-bottom: 15px;">
                        <label for="entry_title_${newIndex}">Title:</label>
                        <input type="text" id="entry_title_${newIndex}" 
                               name="history_entries[${newIndex}][title]" 
                               value="">
                    </div>
                    <div>
                        <label for="entry_paragraph_${newIndex}">Paragraph:</label>
                        <textarea id="entry_paragraph_${newIndex}" 
                                  name="history_entries[${newIndex}][paragraph]" 
                                  rows="8"></textarea>
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
    
        // Initialize visualization type handlers for the new entry
        const $newEntry = $('.history-entry').last();
        $newEntry.find('.viz-type-select').each(function() {
            $(this).trigger('change');
        });
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

    // Handle adding new arrow coordinates
    $(document).on('click', '.add-arrow-coordinate', function() {
        const container = $(this).prev('.arrows-coordinates-container');
        const entryIndex = $(this).closest('.history-entry').data('index');
        const vizIndex = $(this).closest('.visualization-item').data('viz-index');
        const arrowIndex = container.children('.arrow-coordinate-pair').length;

        const template = `
        <div class="arrow-coordinate-pair">
            <label>Arrow ${arrowIndex + 1}:</label>
            <input type="number" step="0.01"
                   name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][origin][0]"
                   placeholder="Origin Lon" value="">
            <input type="number" step="0.01"
                   name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][origin][1]"
                   placeholder="Origin Lat" value="">
            <span>→</span>
            <input type="number" step="0.01"
                   name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][destination][0]"
                   placeholder="Dest Lon" value="">
            <input type="number" step="0.01"
                   name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][destination][1]"
                   placeholder="Dest Lat" value="">
            <button type="button" class="button remove-arrow-coordinate">×</button>
        </div>
        `;

        container.append(template);
    });

    // Handle removing arrow coordinates
    $(document).on('click', '.remove-arrow-coordinate', function() {
        $(this).closest('.arrow-coordinate-pair').remove();
        // Reindex the remaining arrows
        const container = $(this).closest('.arrows-coordinates-container');
        reindexArrowCoordinates(container);
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

    // Function to reindex arrow coordinates
    function reindexArrowCoordinates(container) {
        const entryIndex = container.closest('.history-entry').data('index');
        const vizIndex = container.closest('.visualization-item').data('viz-index');

        container.find('.arrow-coordinate-pair').each(function(arrowIndex) {
            const $pair = $(this);
            $pair.find('label').text(`Arrow ${arrowIndex + 1}:`); // Update label
            $pair.find('input').each(function() {
                const name = $(this).attr('name');
                if (name) {
                    // Update the arrow index in the name attribute
                    $(this).attr('name', name.replace(/history_entries\[\d+\]\[visualizations\]\[\d+\]\[arrows\]\[\d+\]/,
                                                   `history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}]`));
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
    
    // JSON Import functionality
    $('#validate-json').on('click', function() {
        const jsonData = $('#json-import-data').val();
        try {
            const data = JSON.parse(jsonData);
            if (!Array.isArray(data)) {
                $('#json-validation-result').html('<span style="color: red;">Invalid format: JSON must be an array</span>');
                return;
            }
            
            // Check if each item has required fields
            let isValid = true;
            let errorMessage = '';
            
            data.forEach((item, index) => {
                if (!item.year_start) {
                    isValid = false;
                    errorMessage = `Item at index ${index} is missing required field: year_start`;
                    return false;
                }
            });
            
            if (isValid) {
                $('#json-validation-result').html('<span style="color: green;">JSON is valid ✓</span>');
            } else {
                $('#json-validation-result').html(`<span style="color: red;">Invalid JSON: ${errorMessage}</span>`);
            }
        } catch (e) {
            $('#json-validation-result').html(`<span style="color: red;">Invalid JSON: ${e.message}</span>`);
        }
    });

    $('#import-json').on('click', function() {
        const jsonData = $('#json-import-data').val();
        try {
            const data = JSON.parse(jsonData);
            if (!Array.isArray(data)) {
                alert('Invalid format: JSON must be an array');
                return;
            }
            
            if (confirm('This will replace all existing history entries. Are you sure you want to continue?')) {
                // Clear existing entries
                $('#history-entries-container').empty();
                
                // Import new entries
                data.forEach((item, index) => {
                    // Create a new entry with the imported data
                    const newIndex = index;
                    const entryTemplate = `
                    <div class="history-entry" data-index="${newIndex}">
                        <div class="entry-header">
                            <span class="sort-handle">☰</span>
                            <span class="entry-title">
                                ${item.title || 'New Entry'} (${item.year_start})
                            </span>
                            <div class="entry-actions">
                                <button type="button" class="button toggle-entry-form">Edit</button>
                                <button type="button" class="button remove-entry">Remove</button>
                            </div>
                        </div>
                        <div class="entry-form" style="display: none;">
                            <div>
                                <label for="entry_year_start_${newIndex}">Year Start:</label>
                                <input type="number" id="entry_year_start_${newIndex}" 
                                       name="history_entries[${newIndex}][year_start]" 
                                       value="${item.year_start}" required>
                            </div>
                            <div>
                                <label for="entry_year_end_${newIndex}">Year End (optional):</label>
                                <input type="number" id="entry_year_end_${newIndex}" 
                                       name="history_entries[${newIndex}][year_end]" 
                                       value="${item.year_end || ''}">
                            </div>
                            <div>
                                <label for="entry_map_zoom_${newIndex}">Map Zoom:</label>
                                <select id="entry_map_zoom_${newIndex}" 
                                        name="history_entries[${newIndex}][map_zoom]">
                                    ${Object.entries(afctHistoryAdminData.zoomOptions).map(([value, label]) => 
                                        `<option value="${value}" ${item.map_zoom === value ? 'selected' : ''}>${label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <!-- Title and Paragraph Fields -->
                            <div class="full-width">
                                <div style="margin-bottom: 15px;">
                                    <label for="entry_title_${newIndex}">Title:</label>
                                    <input type="text" id="entry_title_${newIndex}" 
                                           name="history_entries[${newIndex}][title]" 
                                           value="${item.title || ''}">
                                </div>
                                <div>
                                    <label for="entry_paragraph_${newIndex}">Paragraph:</label>
                                    <textarea id="entry_paragraph_${newIndex}" 
                                              name="history_entries[${newIndex}][paragraph]" 
                                              rows="8">${item.paragraph || ''}</textarea>
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
                    
                    // Add visualizations if they exist
                    if (item.visualizations && item.visualizations.length) {
                        const $container = $(`.visualizations-container[data-index="${newIndex}"]`);
                        
                        item.visualizations.forEach((viz, vizIndex) => {
                            addVisualizationFromData($container, newIndex, vizIndex, viz);
                        });
                    }
                });
                
                reindexEntries();
                $('#json-validation-result').html('<span style="color: green;">Import successful ✓</span>');
            }
        } catch (e) {
            alert(`Invalid JSON: ${e.message}`);
        }
    });

    // Helper function to add visualization from imported data
    function addVisualizationFromData($container, entryIndex, vizIndex, vizData) {
        const vizTemplate = `
        <div class="visualization-item" data-viz-index="${vizIndex}">
            <div class="viz-header">
                <span>Visualization ${vizIndex + 1}</span>
                <button type="button" class="button remove-viz">Remove</button>
            </div>
            
            <div class="viz-type">
                <label>Type:</label>
                <select name="history_entries[${entryIndex}][visualizations][${vizIndex}][type]" class="viz-type-select">
                    ${Object.entries(afctHistoryAdminData.visualizationTypes).map(([value, label]) => 
                        `<option value="${value}" ${vizData.type === value ? 'selected' : ''}>${label}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="viz-label">
                <label>Label:</label>
                <input type="text" 
                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][label]" 
                       value="${vizData.label || ''}">
            </div>
            
            <div class="viz-origin">
                <label>Origin Point:</label>
                <input type="number" step="0.01" 
                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][origin][0]" 
                       placeholder="Longitude" 
                       value="${vizData.origin ? vizData.origin[0] : ''}">
                <input type="number" step="0.01" 
                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][origin][1]" 
                       placeholder="Latitude" 
                       value="${vizData.origin ? vizData.origin[1] : ''}">
            </div>
            
            <div class="viz-destination" style="${vizData.type !== 'arrow' ? 'display:none' : ''}">
                <label>Destination Point:</label>
                <input type="number" step="0.01" 
                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][destination][0]" 
                       placeholder="Longitude" 
                       value="${vizData.destination ? vizData.destination[0] : ''}">
                <input type="number" step="0.01" 
                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][destination][1]" 
                       placeholder="Latitude" 
                       value="${vizData.destination ? vizData.destination[1] : ''}">
            </div>
            
            <div class="viz-dots-details" style="${vizData.type !== 'dots' ? 'display:none' : ''}">
                <div class="dots-coordinates">
                    <h5>Dot Coordinates</h5>
                    <div class="dots-coordinates-container">
                        ${vizData.dotCoordinates && vizData.dotCoordinates.length ? 
                          vizData.dotCoordinates.map((coord, dotIndex) => `
                            <div class="dot-coordinate-pair">
                                <input type="number" step="0.01" 
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][dotCoordinates][${dotIndex}][0]" 
                                       placeholder="Longitude" 
                                       value="${coord[0]}">
                                <input type="number" step="0.01" 
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][dotCoordinates][${dotIndex}][1]" 
                                       placeholder="Latitude" 
                                       value="${coord[1]}">
                                <button type="button" class="button remove-dot-coordinate">×</button>
                            </div>
                          `).join('') : ''}
                    </div>
                    <button type="button" class="button add-dot-coordinate">Add Dot Coordinate</button>
                </div>
            </div>

            <div class="viz-arrows-details" style="${vizData.type !== 'arrows' ? 'display:none' : ''}">
                <div class="arrows-coordinates">
                    <h5>Arrows (Origin → Destination)</h5>
                    <div class="arrows-coordinates-container">
                        ${vizData.arrows && vizData.arrows.length ?
                          vizData.arrows.map((arrow, arrowIndex) => `
                            <div class="arrow-coordinate-pair">
                                <label>Arrow ${arrowIndex + 1}:</label>
                                <input type="number" step="0.01"
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][origin][0]"
                                       placeholder="Origin Lon"
                                       value="${arrow.origin ? arrow.origin[0] : ''}">
                                <input type="number" step="0.01"
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][origin][1]"
                                       placeholder="Origin Lat"
                                       value="${arrow.origin ? arrow.origin[1] : ''}">
                                <span>→</span>
                                <input type="number" step="0.01"
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][destination][0]"
                                       placeholder="Dest Lon"
                                       value="${arrow.destination ? arrow.destination[0] : ''}">
                                <input type="number" step="0.01"
                                       name="history_entries[${entryIndex}][visualizations][${vizIndex}][arrows][${arrowIndex}][destination][1]"
                                       placeholder="Dest Lat"
                                       value="${arrow.destination ? arrow.destination[1] : ''}">
                                <button type="button" class="button remove-arrow-coordinate">×</button>
                            </div>
                          `).join('') : ''}
                    </div>
                    <button type="button" class="button add-arrow-coordinate">Add Arrow</button>
                </div>
            </div>
        </div>
        `;
        
        $container.append(vizTemplate);
        
        // Initialize visualization type change handler
        initVizTypeHandlers(entryIndex, vizIndex);
    }
});

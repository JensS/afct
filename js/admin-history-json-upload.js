/**
 * JSON File Upload for History Timeline
 */
jQuery(document).ready(function($) {
    // Check if we're on the history admin page
    if (!$('#history-entries-container').length) {
        return;
    }

    // Add file upload button after the JSON textarea
    const $jsonTextarea = $('textarea[name="history_json"]');
    if ($jsonTextarea.length) {
        const $uploadContainer = $(`
            <div class="json-upload-container" style="margin-top: 10px;">
                <input type="file" id="history_json_file" accept=".json" style="display: none;" />
                <button type="button" class="button button-secondary" id="upload_json_button">
                    <span class="dashicons dashicons-upload" style="vertical-align: text-bottom;"></span> 
                    Upload JSON File
                </button>
                <span class="file-name" style="margin-left: 10px; font-style: italic;"></span>
            </div>
        `);
        
        $jsonTextarea.after($uploadContainer);
        
        // Handle the upload button click
        $('#upload_json_button').on('click', function() {
            $('#history_json_file').trigger('click');
        });
        
        // Handle file selection
        $('#history_json_file').on('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Display the file name
            $('.json-upload-container .file-name').text(file.name);
            
            // Read the file
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    // Get the content and trim any whitespace
                    const content = event.target.result.trim();
                    
                    // Handle the case where the file might have a BOM (Byte Order Mark)
                    const jsonString = content.replace(/^\uFEFF/, '');
                    
                    // Parse JSON to validate it
                    const jsonData = JSON.parse(jsonString);
                    
                    // Ensure each entry has the required fields
                    jsonData.forEach(entry => {
                        // Make sure year_end is preserved
                        if (entry.year_end) {
                            entry.year_end = parseInt(entry.year_end);
                        }
                        
                        // Ensure map_zoom is set
                        if (!entry.map_zoom) {
                            entry.map_zoom = 'africa'; // Default value
                        }
                        
                        // Ensure visualizations have type set
                        if (entry.visualizations && Array.isArray(entry.visualizations)) {
                            entry.visualizations.forEach(viz => {
                                if (!viz.type) {
                                    viz.type = 'dot'; // Default value
                                }
                            });
                        }
                    });
                    
                    // Format the JSON with indentation for better readability
                    const formattedJson = JSON.stringify(jsonData, null, 2);
                    
                    // Update the textarea with the JSON content
                    $jsonTextarea.val(formattedJson);
                    
                    // Trigger change event to ensure any listeners are notified
                    $jsonTextarea.trigger('change');
                    
                    // Automatically trigger the import button to process the data
                    $('#import-json').trigger('click');
                    
                    // Show success message
                    showNotice('JSON file loaded successfully!', 'success');
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    showNotice('Error parsing JSON file. Please check the file format: ' + error.message, 'error');
                }
            };
            
            reader.onerror = function() {
                showNotice('Error reading file. Please try again.', 'error');
            };
            
            reader.readAsText(file);
        });
        
        // Helper function to show notices
        function showNotice(message, type = 'info') {
            const $notice = $(`
                <div class="notice notice-${type} is-dismissible" style="margin: 10px 0;">
                    <p>${message}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `);
            
            // Remove any existing notices
            $('.json-upload-container').siblings('.notice').remove();
            
            // Add the new notice
            $('.json-upload-container').after($notice);
            
            // Handle dismiss button
            $notice.find('.notice-dismiss').on('click', function() {
                $notice.fadeOut(300, function() { $(this).remove(); });
            });
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                $notice.fadeOut(300, function() { $(this).remove(); });
            }, 5000);
        }
    }
});

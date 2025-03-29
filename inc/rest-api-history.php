<?php
/**
 * REST API endpoints for History Timeline
 */

/**
 * Register REST API endpoint for history timeline data
 */
function afct_register_history_rest_route() {
    register_rest_route('afct/v1', '/history', array(
        'methods' => 'GET',
        'callback' => 'afct_get_history_data',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'afct_register_history_rest_route');

/**
 * Get history data for the specified page
 *
 * @param WP_REST_Request $request Full data about the request.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
function afct_get_history_data($request) {
    $pages = get_posts([
		'post_type'        => 'page',
        'meta_key' => '_afct_history_entries',
        'meta_query' =>  ['key' => '_afct_history_entries', 'compare' => 'EXISTS'],
    ]);

    if (!isset($pages[0])) {
        return new WP_REST_Response([], 200);
    }
    
    $history_entries = get_post_meta($pages[0]->ID, '_afct_history_entries', true);
    
    // Ensure each entry has the required fields in the standardized format
    $standardized_entries = array_map(function($entry) {
        // Make sure year_start is used as the ID
        $entry['id'] = intval($entry['year_start']);
        
        // Ensure required fields exist
        if (!isset($entry['title'])) $entry['title'] = '';
        if (!isset($entry['paragraph'])) $entry['paragraph'] = '';
        if (!isset($entry['map_zoom'])) $entry['map_zoom'] = 'africa';
        
        // Convert old animation data to new visualization format if needed
        if (!isset($entry['visualizations']) && isset($entry['animation_type'])) {
            $entry['visualizations'] = [];
            
            // Convert based on animation type
            if ($entry['animation_type'] === 'migration' && 
                (isset($entry['origin_points']) || isset($entry['destination_points']))) {
                
                // Handle migration (arrows)
                if (isset($entry['origin_points']) && isset($entry['destination_points'])) {
                    foreach ($entry['origin_points'] as $i => $origin) {
                        if (isset($entry['destination_points'][$i])) {
                            $entry['visualizations'][] = [
                                'type' => 'arrow',
                                'origin' => $origin,
                                'destination' => $entry['destination_points'][$i],
                                'label' => isset($entry['animation_label']) ? $entry['animation_label'] : ''
                            ];
                        }
                    }
                }
                // Handle single origin/destination
                else if (isset($entry['center_lng']) && isset($entry['center_lat'])) {
                    $entry['visualizations'][] = [
                        'type' => 'arrow',
                        'origin' => [$entry['center_lng'], $entry['center_lat']],
                        'destination' => [$entry['center_lng'], $entry['center_lat']],
                        'label' => isset($entry['animation_label']) ? $entry['animation_label'] : ''
                    ];
                }
            } 
            else if ($entry['animation_type'] === 'single_point' && 
                     isset($entry['center_lng']) && isset($entry['center_lat'])) {
                // Handle single point (dot)
                $entry['visualizations'][] = [
                    'type' => 'dot',
                    'origin' => [$entry['center_lng'], $entry['center_lat']],
                    'label' => isset($entry['animation_label']) ? $entry['animation_label'] : ''
                ];
            }
            // Handle language development/suppression (dots)
            else if (($entry['animation_type'] === 'language_development' || 
                     $entry['animation_type'] === 'language_suppression') && 
                     isset($entry['center_lng']) && isset($entry['center_lat'])) {
                        
                $entry['visualizations'][] = [
                    'type' => 'dots',
                    'origin' => [$entry['center_lng'], $entry['center_lat']],
                    'label' => isset($entry['animation_label']) ? $entry['animation_label'] : '',
                    'languages' => isset($entry['languages']) ? 
                        array_map('trim', explode(',', $entry['languages'])) : []
                ];
                        
                // Make sure dotCoordinates is properly formatted
                if (!isset($entry['visualizations'][count($entry['visualizations'])-1]['dotCoordinates'])) {
                    // If no dotCoordinates but we have origin, use origin as the first coordinate
                    $entry['visualizations'][count($entry['visualizations'])-1]['dotCoordinates'] = [
                        $entry['visualizations'][count($entry['visualizations'])-1]['origin']
                    ];
                }
            }
        }
        
        return $entry;
    }, $history_entries);
    
    return new WP_REST_Response($standardized_entries, 200);
}

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

    return new WP_REST_Response($history_entries, 200);
}

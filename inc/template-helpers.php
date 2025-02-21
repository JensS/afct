<?php
// Helper functions for templates

function afct_get_team_credits() {
    $credits_file = get_template_directory() . '/credits.json';
    if (file_exists($credits_file)) {
        $credits_json = file_get_contents($credits_file);
        return json_decode($credits_json, true);
    }
    return array();
}

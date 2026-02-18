<?php
/**
 * Custom User Profile Fields
 *
 * Adds custom fields to WordPress user profiles for author pages
 *
 * @package AFCT
 */

/**
 * Add custom user profile fields
 */
function afct_add_user_profile_fields($user) {
    ?>
    <h2><?php _e('Author Information', 'afct'); ?></h2>

    <table class="form-table">
        <tr>
            <th><label for="tagline"><?php _e('Tagline', 'afct'); ?></label></th>
            <td>
                <input type="text" name="tagline" id="tagline" value="<?php echo esc_attr(get_the_author_meta('tagline', $user->ID)); ?>" class="regular-text" />
                <p class="description"><?php _e('A short tagline or title (e.g., "Documentary Filmmaker & Producer")', 'afct'); ?></p>
            </td>
        </tr>

        <tr>
            <th><label for="twitter"><?php _e('Twitter URL', 'afct'); ?></label></th>
            <td>
                <input type="url" name="twitter" id="twitter" value="<?php echo esc_attr(get_the_author_meta('twitter', $user->ID)); ?>" class="regular-text" />
                <p class="description"><?php _e('Full Twitter profile URL (e.g., https://twitter.com/username)', 'afct'); ?></p>
            </td>
        </tr>

        <tr>
            <th><label for="linkedin"><?php _e('LinkedIn URL', 'afct'); ?></label></th>
            <td>
                <input type="url" name="linkedin" id="linkedin" value="<?php echo esc_attr(get_the_author_meta('linkedin', $user->ID)); ?>" class="regular-text" />
                <p class="description"><?php _e('Full LinkedIn profile URL (e.g., https://linkedin.com/in/username)', 'afct'); ?></p>
            </td>
        </tr>

        <tr>
            <th><label for="instagram"><?php _e('Instagram URL', 'afct'); ?></label></th>
            <td>
                <input type="url" name="instagram" id="instagram" value="<?php echo esc_attr(get_the_author_meta('instagram', $user->ID)); ?>" class="regular-text" />
                <p class="description"><?php _e('Full Instagram profile URL (e.g., https://instagram.com/username)', 'afct'); ?></p>
            </td>
        </tr>
    </table>
    <?php
}
add_action('show_user_profile', 'afct_add_user_profile_fields');
add_action('edit_user_profile', 'afct_add_user_profile_fields');

/**
 * Save custom user profile fields
 */
function afct_save_user_profile_fields($user_id) {
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }

    // Save tagline
    if (isset($_POST['tagline'])) {
        update_user_meta($user_id, 'tagline', sanitize_text_field($_POST['tagline']));
    }

    // Save Twitter URL
    if (isset($_POST['twitter'])) {
        update_user_meta($user_id, 'twitter', esc_url_raw($_POST['twitter']));
    }

    // Save LinkedIn URL
    if (isset($_POST['linkedin'])) {
        update_user_meta($user_id, 'linkedin', esc_url_raw($_POST['linkedin']));
    }

    // Save Instagram URL
    if (isset($_POST['instagram'])) {
        update_user_meta($user_id, 'instagram', esc_url_raw($_POST['instagram']));
    }
}
add_action('personal_options_update', 'afct_save_user_profile_fields');
add_action('edit_user_profile_update', 'afct_save_user_profile_fields');

/**
 * Add Person schema for author pages
 */
function afct_get_person_schema($author_id) {
    // Build author name - prefer first name + last name, fallback to display name
    $first_name = get_the_author_meta('first_name', $author_id);
    $last_name = get_the_author_meta('last_name', $author_id);

    if ($first_name && $last_name) {
        $author_name = $first_name . ' ' . $last_name;
    } elseif ($first_name) {
        $author_name = $first_name;
    } elseif ($last_name) {
        $author_name = $last_name;
    } else {
        $author_name = get_the_author_meta('display_name', $author_id);
    }
    $author_bio = get_the_author_meta('description', $author_id);
    $author_url = get_author_posts_url($author_id);
    $author_website = get_the_author_meta('user_url', $author_id);
    $author_twitter = get_the_author_meta('twitter', $author_id);
    $author_linkedin = get_the_author_meta('linkedin', $author_id);
    $author_instagram = get_the_author_meta('instagram', $author_id);

    $author_tagline = get_the_author_meta('tagline', $author_id);

    $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'Person',
        'name' => $author_name,
        'url' => $author_url,
    );

    if ($author_tagline) {
        $schema['jobTitle'] = $author_tagline;
    }

    if ($author_bio) {
        $schema['description'] = wp_strip_all_tags($author_bio);
    }

    // Add image (avatar)
    $avatar_url = get_avatar_url($author_id, array('size' => 512));
    if ($avatar_url) {
        $schema['image'] = $avatar_url;
    }

    // Link to the organisation this person works for
    $schema['worksFor'] = array(
        '@type' => 'NGO',
        'name'  => get_bloginfo('name'),
        'url'   => home_url('/'),
    );

    // Add same as (social profiles)
    $same_as = array();
    if ($author_website) {
        $same_as[] = $author_website;
    }
    if ($author_twitter) {
        $same_as[] = $author_twitter;
    }
    if ($author_linkedin) {
        $same_as[] = $author_linkedin;
    }
    if ($author_instagram) {
        $same_as[] = $author_instagram;
    }

    if (!empty($same_as)) {
        $schema['sameAs'] = $same_as;
    }

    return $schema;
}

/**
 * Output Person schema on author pages
 */
function afct_output_author_schema() {
    if (is_author()) {
        $author_id = get_queried_object_id();
        $schema = afct_get_person_schema($author_id);

        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        echo "\n" . '</script>' . "\n";
    }
}
add_action('wp_head', 'afct_output_author_schema');

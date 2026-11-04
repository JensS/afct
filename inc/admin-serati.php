<?php
/**
 * About Serati — SEO / Profile meta box
 *
 * Adds job title and social link fields to the About Serati page so that
 * the Person JSON-LD schema can be fully populated.
 */

function afct_serati_profile_meta_box_callback( $post ) {
    wp_nonce_field( 'afct_serati_profile_save', 'afct_serati_profile_nonce' );

    $job_title = get_post_meta( $post->ID, '_afct_serati_job_title', true );
    $website   = get_post_meta( $post->ID, '_afct_serati_website',   true );
    $instagram = get_post_meta( $post->ID, '_afct_serati_instagram', true );
    $spotify   = get_post_meta( $post->ID, '_afct_serati_spotify',   true );
    $twitter   = get_post_meta( $post->ID, '_afct_serati_twitter',   true );
    ?>
    <table class="form-table" style="width:100%">
        <tr>
            <th style="width:160px"><label for="afct_serati_job_title">Job Title / Role</label></th>
            <td>
                <input type="text" id="afct_serati_job_title" name="afct_serati_job_title"
                       value="<?php echo esc_attr( $job_title ); ?>" class="regular-text">
                <p class="description">e.g. "Songwriter, Activist, Performer"</p>
            </td>
        </tr>
        <tr>
            <th><label for="afct_serati_website">Website URL</label></th>
            <td>
                <input type="url" id="afct_serati_website" name="afct_serati_website"
                       value="<?php echo esc_attr( $website ); ?>" class="regular-text" placeholder="https://">
            </td>
        </tr>
        <tr>
            <th><label for="afct_serati_instagram">Instagram URL</label></th>
            <td>
                <input type="url" id="afct_serati_instagram" name="afct_serati_instagram"
                       value="<?php echo esc_attr( $instagram ); ?>" class="regular-text" placeholder="https://instagram.com/…">
            </td>
        </tr>
        <tr>
            <th><label for="afct_serati_spotify">Spotify URL</label></th>
            <td>
                <input type="url" id="afct_serati_spotify" name="afct_serati_spotify"
                       value="<?php echo esc_attr( $spotify ); ?>" class="regular-text" placeholder="https://open.spotify.com/artist/…">
            </td>
        </tr>
        <tr>
            <th><label for="afct_serati_twitter">Twitter / X URL</label></th>
            <td>
                <input type="url" id="afct_serati_twitter" name="afct_serati_twitter"
                       value="<?php echo esc_attr( $twitter ); ?>" class="regular-text" placeholder="https://twitter.com/…">
            </td>
        </tr>
    </table>
    <?php
}

function afct_save_serati_profile_meta( $post_id ) {
    if ( ! isset( $_POST['afct_serati_profile_nonce'] ) ||
         ! wp_verify_nonce( $_POST['afct_serati_profile_nonce'], 'afct_serati_profile_save' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    $fields = array(
        'afct_serati_job_title' => '_afct_serati_job_title',
        'afct_serati_website'   => '_afct_serati_website',
        'afct_serati_instagram' => '_afct_serati_instagram',
        'afct_serati_spotify'   => '_afct_serati_spotify',
        'afct_serati_twitter'   => '_afct_serati_twitter',
    );

    foreach ( $fields as $post_key => $meta_key ) {
        if ( ! isset( $_POST[ $post_key ] ) ) {
            continue;
        }
        $value = $_POST[ $post_key ];
        // URL fields get url-sanitised; text fields get text-sanitised
        if ( $post_key === 'afct_serati_job_title' ) {
            update_post_meta( $post_id, $meta_key, sanitize_text_field( $value ) );
        } else {
            $url = esc_url_raw( $value );
            if ( $url ) {
                update_post_meta( $post_id, $meta_key, $url );
            } else {
                delete_post_meta( $post_id, $meta_key );
            }
        }
    }
}
add_action( 'save_post', 'afct_save_serati_profile_meta' );

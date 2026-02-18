<?php
/**
 * Experimental mode: ?exp=1 to enable, ?exp=0 to disable.
 * Persists via session cookie. Experimental menu items are hidden
 * from both the homepage section loop and the navigation unless active.
 */

/**
 * Returns true if experimental mode is currently active.
 * Reads ?exp= query param and sets/clears a session cookie accordingly.
 */
function afct_is_experimental_mode() {
    if ( isset( $_GET['exp'] ) ) {
        if ( $_GET['exp'] === '0' ) {
            setcookie( 'afct_exp', '', time() - 3600, '/' );
            return false;
        }
        if ( $_GET['exp'] === '1' ) {
            setcookie( 'afct_exp', '1', 0, '/' );
            return true;
        }
    }
    return isset( $_COOKIE['afct_exp'] ) && $_COOKIE['afct_exp'] === '1';
}

if ( ! is_admin() ) {
    return;
}

/**
 * Render the "Experimental" checkbox for each menu item in the editor.
 *
 * @param int     $item_id Menu item ID (nav menu item post ID, not the page it links to).
 * @param WP_Post $item    Menu item object.
 */
function afct_menu_item_experimental_field( $item_id, $item ) {
    static $nonce_printed = false;
    if ( ! $nonce_printed ) {
        wp_nonce_field( 'afct_menu_experimental', 'afct_menu_experimental_nonce' );
        $nonce_printed = true;
    }

    $is_experimental = get_post_meta( $item_id, '_afct_menu_experimental', true ) === '1';
    ?>
    <p class="field-afct-experimental description description-wide">
        <label for="afct-experimental-<?php echo esc_attr( $item_id ); ?>">
            <input
                type="checkbox"
                id="afct-experimental-<?php echo esc_attr( $item_id ); ?>"
                name="afct_menu_experimental[<?php echo esc_attr( $item_id ); ?>]"
                value="1"
                <?php checked( $is_experimental ); ?>
            />
            <?php esc_html_e( 'Experimental (hidden unless ?exp=1)', 'afct' ); ?>
            <?php if ( $is_experimental ) : ?>
                <span class="afct-exp-badge">EXP</span>
            <?php endif; ?>
        </label>
    </p>
    <?php
}
add_action( 'wp_nav_menu_item_custom_fields', 'afct_menu_item_experimental_field', 10, 2 );

/**
 * Save the experimental checkbox value when a menu item is updated.
 *
 * @param int $menu_id          ID of the nav menu being updated.
 * @param int $menu_item_db_id  ID of the menu item being updated.
 */
function afct_save_menu_item_experimental( $menu_id, $menu_item_db_id ) {
    if ( ! isset( $_POST['afct_menu_experimental_nonce'] ) ) {
        return;
    }
    if ( ! wp_verify_nonce( $_POST['afct_menu_experimental_nonce'], 'afct_menu_experimental' ) ) {
        return;
    }
    if ( ! current_user_can( 'edit_theme_options' ) ) {
        return;
    }

    if ( isset( $_POST['afct_menu_experimental'][ $menu_item_db_id ] ) &&
         $_POST['afct_menu_experimental'][ $menu_item_db_id ] === '1' ) {
        update_post_meta( $menu_item_db_id, '_afct_menu_experimental', '1' );
    } else {
        delete_post_meta( $menu_item_db_id, '_afct_menu_experimental' );
    }
}
add_action( 'wp_update_nav_menu_item', 'afct_save_menu_item_experimental', 10, 2 );

/**
 * Output badge styles in admin <head> on the nav-menus.php page.
 */
function afct_menu_experimental_admin_head() {
    global $pagenow;
    if ( $pagenow !== 'nav-menus.php' ) {
        return;
    }
    ?>
    <style>
        .afct-exp-badge {
            display: inline-block;
            background: #d63638;
            color: #fff;
            font-size: 9px;
            font-weight: 600;
            padding: 1px 5px;
            border-radius: 3px;
            margin-left: 6px;
            vertical-align: middle;
            text-transform: uppercase;
            letter-spacing: .5px;
        }
        .field-afct-experimental {
            margin-top: 6px;
        }
    </style>
    <?php
}
add_action( 'admin_head', 'afct_menu_experimental_admin_head' );

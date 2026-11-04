<?php
/**
 * Admin settings page for llms.txt
 *
 * Adds Settings → llms.txt where editors can customise the Markdown file
 * served at /llms.txt for AI search engines (ChatGPT, Perplexity, Claude, …).
 */

add_action( 'admin_menu', function () {
    add_options_page(
        'llms.txt Editor',
        'llms.txt',
        'manage_options',
        'afct-llms-txt',
        'afct_llms_txt_admin_page'
    );
} );

add_action( 'admin_post_afct_save_llms_txt',  'afct_llms_txt_save_handler' );
add_action( 'admin_post_afct_reset_llms_txt', 'afct_llms_txt_reset_handler' );

function afct_llms_txt_save_handler() {
    check_admin_referer( 'afct_llms_txt_nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }
    $content = wp_unslash( $_POST['afct_llms_txt_content'] ?? '' );
    update_option( 'afct_llms_txt_content', $content );
    wp_safe_redirect( admin_url( 'options-general.php?page=afct-llms-txt&saved=1' ) );
    exit;
}

function afct_llms_txt_reset_handler() {
    check_admin_referer( 'afct_llms_txt_reset_nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }
    delete_option( 'afct_llms_txt_content' );
    wp_safe_redirect( admin_url( 'options-general.php?page=afct-llms-txt&reset=1' ) );
    exit;
}

function afct_llms_txt_admin_page() {
    $saved       = get_option( 'afct_llms_txt_content', '' );
    $is_custom   = $saved !== '';
    $display     = $is_custom ? $saved : afct_auto_generate_llms_txt();
    $preview_url = home_url( '/llms.txt' );
    $reset_url   = wp_nonce_url(
        admin_url( 'admin-post.php?action=afct_reset_llms_txt' ),
        'afct_llms_txt_reset_nonce'
    );
    ?>
    <div class="wrap">
        <h1>llms.txt</h1>
        <p>
            Served at <a href="<?php echo esc_url( $preview_url ); ?>" target="_blank"><?php echo esc_html( $preview_url ); ?></a>.
            This Markdown file tells AI search engines (ChatGPT, Perplexity, Claude&nbsp;…) what your site is about.
        </p>

        <?php if ( isset( $_GET['saved'] ) ) : ?>
            <div class="notice notice-success is-dismissible"><p>Custom content saved.</p></div>
        <?php elseif ( isset( $_GET['reset'] ) ) : ?>
            <div class="notice notice-success is-dismissible"><p>Reset to auto-generated content.</p></div>
        <?php endif; ?>

        <?php if ( $is_custom ) : ?>
            <div class="notice notice-info">
                <p>
                    Using <strong>custom content</strong>.
                    <a href="<?php echo esc_url( $reset_url ); ?>">Reset to auto-generated</a> to rebuild from your WordPress menus and page excerpts.
                </p>
            </div>
        <?php else : ?>
            <div class="notice notice-info">
                <p>
                    Using <strong>auto-generated content</strong> built from your primary menu and page excerpts.
                    Edit below and save to use custom content instead.
                </p>
            </div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <input type="hidden" name="action" value="afct_save_llms_txt">
            <?php wp_nonce_field( 'afct_llms_txt_nonce' ); ?>
            <textarea
                name="afct_llms_txt_content"
                rows="32"
                style="width:100%;font-family:monospace;font-size:13px;line-height:1.6;margin-top:1rem;"
            ><?php echo esc_textarea( $display ); ?></textarea>
            <p class="submit">
                <input type="submit" class="button button-primary" value="Save Custom Content">
            </p>
        </form>

        <hr>
        <h2 style="font-size:14px;color:#666;">Tips</h2>
        <ul style="list-style:disc;margin-left:1.5rem;color:#666;font-size:13px;">
            <li>Use standard Markdown: <code># Heading</code>, <code>&gt; Blockquote</code>, <code>- [Label](URL)</code></li>
            <li>The <strong>intro blockquote</strong> (<code>&gt; …</code>) is the one-line summary AI systems display in search results — keep it under 160 characters.</li>
            <li>Section descriptions come from the <strong>Excerpt</strong> field on each page (Edit page → Excerpt box).</li>
            <li>The auto-generated version updates automatically when you change menu items or page excerpts.</li>
        </ul>
    </div>
    <?php
}

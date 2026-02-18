<?php
/**
 * Admin settings page for sitemap.xml
 *
 * Adds Settings → sitemap.xml where editors can customise the XML sitemap
 * served at /sitemap.xml.
 */

add_action( 'admin_menu', function () {
    add_options_page(
        'sitemap.xml Editor',
        'sitemap.xml',
        'manage_options',
        'afct-sitemap-xml',
        'afct_sitemap_xml_admin_page'
    );
} );

add_action( 'admin_post_afct_save_sitemap_xml',  'afct_sitemap_xml_save_handler' );
add_action( 'admin_post_afct_reset_sitemap_xml', 'afct_sitemap_xml_reset_handler' );

function afct_sitemap_xml_save_handler() {
    check_admin_referer( 'afct_sitemap_xml_nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }
    $content = wp_unslash( $_POST['afct_sitemap_xml_content'] ?? '' );
    update_option( 'afct_sitemap_xml_content', $content );
    wp_safe_redirect( admin_url( 'options-general.php?page=afct-sitemap-xml&saved=1' ) );
    exit;
}

function afct_sitemap_xml_reset_handler() {
    check_admin_referer( 'afct_sitemap_xml_reset_nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }
    delete_option( 'afct_sitemap_xml_content' );
    wp_safe_redirect( admin_url( 'options-general.php?page=afct-sitemap-xml&reset=1' ) );
    exit;
}

function afct_sitemap_xml_admin_page() {
    $saved       = get_option( 'afct_sitemap_xml_content', '' );
    $is_custom   = $saved !== '';
    $display     = $is_custom ? $saved : afct_auto_generate_sitemap_xml();
    $preview_url = home_url( '/sitemap.xml' );
    $reset_url   = wp_nonce_url(
        admin_url( 'admin-post.php?action=afct_reset_sitemap_xml' ),
        'afct_sitemap_xml_reset_nonce'
    );
    ?>
    <div class="wrap">
        <h1>sitemap.xml</h1>
        <p>
            Served at <a href="<?php echo esc_url( $preview_url ); ?>" target="_blank"><?php echo esc_html( $preview_url ); ?></a>.
            This XML sitemap tells search engines and AI crawlers what URLs your site contains.
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
                    <a href="<?php echo esc_url( $reset_url ); ?>">Reset to auto-generated</a> to rebuild from your WordPress menu.
                </p>
            </div>
        <?php else : ?>
            <div class="notice notice-info">
                <p>
                    Using <strong>auto-generated content</strong> built from your primary menu.
                    Edit below and save to use custom content instead.
                </p>
            </div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <input type="hidden" name="action" value="afct_save_sitemap_xml">
            <?php wp_nonce_field( 'afct_sitemap_xml_nonce' ); ?>
            <textarea
                name="afct_sitemap_xml_content"
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
            <li>Each <code>&lt;url&gt;</code> block needs a <code>&lt;loc&gt;</code> (required), and optionally <code>&lt;lastmod&gt;</code>, <code>&lt;changefreq&gt;</code>, and <code>&lt;priority&gt;</code>.</li>
            <li><code>&lt;priority&gt;</code> ranges from <code>0.0</code> to <code>1.0</code>. The homepage should be <code>1.0</code>; sections <code>0.8</code>.</li>
            <li><code>&lt;lastmod&gt;</code> uses <code>YYYY-MM-DD</code> format.</li>
            <li>The auto-generated version updates automatically when you change menu items.</li>
            <li>Submit your sitemap to <a href="https://search.google.com/search-console" target="_blank">Google Search Console</a> after deploying.</li>
        </ul>
    </div>
    <?php
}

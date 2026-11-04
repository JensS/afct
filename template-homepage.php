<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 */
get_header();

define( 'IN_ONEPAGER', true );
$menu_items = afct_get_homepage_sections( afct_is_experimental_mode() );
?>
<main id="main-content">
    <h1 class="screen-reader-text"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></h1>
    <?php
    foreach ( $menu_items as $menu_item ) {
        global $post;
        $post = get_post( $menu_item->object_id );
        setup_postdata( $post );

        echo '<section id="section-' . esc_attr( $post->post_name ) . '" data-scroll>';
        $template_file = get_page_template_slug( $post );
        if ( $template_file && locate_template( $template_file ) ) {
            locate_template( $template_file, true, false );
        } else {
            the_content();
        }
        echo '</section>';
        wp_reset_postdata();
    }
    ?>
</main>
<?php get_footer();

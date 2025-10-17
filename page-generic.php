<?php
/**
 * Template Name: Generic Page
 */

get_header();
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main" style="min-height: 60vh;">
        <div class="global-container">
            <?php
            // Start the loop.
            while ( have_posts() ) : the_post();

                // Include the page content template.
                echo '<h4><a href="' . esc_url( home_url( '/' ) ) . '">Back to main website</a></h4>';
                the_title( '<h1 style="margin-top: 4rem; margin-bottom: 20px;">', '</h1>' );
                echo '<div style="margin-bottom: 100px;">';
                the_content();
                echo '</div>';

            // End the loop.
            endwhile;
            ?>
        </div>
    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php
get_footer();
?>
<script>
function adjustIframe() {
    var vimeoIframe = document.querySelector('iframe[src*="vimeo.com"]');
    if (vimeoIframe) {
        vimeoIframe.style.width = '100%';
        var aspectRatio = vimeoIframe.height / vimeoIframe.width;
        vimeoIframe.style.height = (vimeoIframe.offsetWidth * aspectRatio) + 'px';
    }
}

window.addEventListener('load', adjustIframe);
window.addEventListener('resize', adjustIframe);
</script>

<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package AFCT
 */

get_header();
?>

<section class="error-404 not-found">
		<div class="text-upper-left">
			<h1>Oops! That page</h1>
		</div>
		<div class="text-lower-right">
			<h1>can&rsquo;t be found.</h1>
		</div>
    <div class="global-container">
      <div class="content-frame align-center">
		<p><?php esc_html_e( 'It looks like nothing was found at this location. ', 'afct' ); ?></p>

		</div><!-- .page-content -->
		</div>
</section><!-- .error-404 -->


<?php
get_footer();

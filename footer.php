<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package AFCT
 */

?>

<section class="footer" >
        <div class="global-container">
            <div class="utility-links">
                <p>©<?php echo date('Y'); ?></p>
                <p><a href="mailto:contact@jenssage.com">Contact</a></p>
                <p><a href="<?php echo esc_url(home_url('/imprint')); ?>">Impressum</a></p>
            </div>
            <h2 class="footer-wordmark" aria-label="African Face, Colonial Tongue">
                <span class="wm-line wm-serif">African</span>
                <span class="wm-line"><span class="wm-serif">Face, </span><span class="wm-sans">Colonial</span></span>
                <span class="wm-line wm-line--indent wm-sans">Tongue</span>
            </h2>
    </div>
</section>



<div id="cookie-consent" class="cookie-consent">
    <div class="cookie-content">
        <p>We use cookies for analytics. <a href="<?php echo esc_url(home_url('/imprint')); ?>">Learn more about our cookie policy</a></p>
        <button id="accept-cookies" class="button-primary">Accept</button>
    </div>
</div>
</div><!-- #smooth-content -->
</div><!-- #smooth-wrapper -->
<?php wp_footer(); ?>
</body>
</html>

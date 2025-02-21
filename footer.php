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

</div><!-- #page -->

<section class="footer" >
    <div class="global-container" style="display:block">
        <div class="utility-links">
            <p>©<?php echo date('Y'); ?></p>
            <p><a href="<?php echo esc_url(home_url('/privacy-policy')); ?>">Imprint & Privacy Policy</a></p>
            <p>A project by <a href="https://www.jenssage.com">Jens Sage</a></p>
        </div>
        <div>
        <img src="<?php echo get_template_directory_uri(); ?>/img/footer.svg" loading="lazy" alt="" class="image-3">
</div>
    </div>
</section>
<!-- Matomo -->
<script>
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
        var u="//analytics.jenssage.com/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
</script>
<div id="cookie-consent" class="cookie-consent">
    <div class="cookie-content">
        <p>We use cookies for analytics. <a href="<?php echo esc_url(home_url('/imprint')); ?>">Learn more</a></p>
        <button id="accept-cookies" class="button-primary">Accept</button>
    </div>
</div>
<?php wp_footer(); ?>
</body>
</html>

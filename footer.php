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
                <p><a href="<?php echo esc_url(home_url('/imprint')); ?>">Imprint & Privacy Policy</a></p>
                <p>A project by <a href="https://www.jenssage.com">Jens Sage</a></p>
            </div>
            <div class="footer-logo">
            <?php
            echo file_get_contents(get_template_directory() . "/img/footer.svg");
            ?>
        </div>
    </div>
</section>

</div><!-- #page -->


<div id="cookie-consent" class="cookie-consent">
    <div class="cookie-content">
        <p>We use cookies for analytics. <a href="<?php echo esc_url(home_url('/imprint')); ?>">Learn more</a></p>
        <button id="accept-cookies" class="button-primary">Accept</button>
    </div>
</div>
</div><!-- #smooth-content -->
</div><!-- #smooth-wrapper -->
<script type="text/javascript" src="https://www.youtube.com/iframe_api"></script>
<?php wp_footer(); ?>
</body>
</html>

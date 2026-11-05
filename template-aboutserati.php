<?php
/**
 * Template Name: About Serati
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER"))
    get_header();

    $img = get_post_meta(get_the_ID(), '_afct_about_serati_image', true);

    if ($img) {
      $image_id = !empty($img['id']) ? intval($img['id']) : attachment_url_to_postid($img['url']);
      $thumbnail = wp_get_attachment_image_src($image_id, 'thumbnail');
      $medium = wp_get_attachment_image_src($image_id, 'large');
    }
    else {
      $image_id = null;
      $thumbnail = null;
      $medium = null;
    }
?>
<!-- About -->
<div id="about-serati" class="slide">
    <?php afct_render_section_headline( get_the_title(), 'serif' ); ?>

    <?php if ($medium) : ?>
    <figure class="about-figure" data-scroll data-scroll-event-progress="seratiImageScroll">
        <img id="serati-image" src="<?php echo esc_url(afct_cdn_url($medium[0])); ?>" width="<?php echo intval($medium[1]); ?>" height="<?php echo intval($medium[2]); ?>" loading="lazy" decoding="async" alt="A portrait of Serati.">
    </figure>
    <?php endif; ?>

    <div class="about-text">
        <p class="text-content"><?php echo wp_kses_post(get_post_meta(get_the_ID(), '_afct_about_serati', true)); ?></p>
    </div>
</div>
<?php
// Output Person schema only when viewed standalone (one-pager already includes it in <head>)
if ( ! defined('IN_ONEPAGER') ) {
    $person_schema = afct_get_serati_schema();
    if ( $person_schema ) {
        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode( $person_schema, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );
        echo "\n</script>\n";
    }
    get_footer();
}

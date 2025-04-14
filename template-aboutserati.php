<?php
/**
 * Template Name: About Serati 
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();
 
    $img = get_post_meta(get_the_ID(), '_afct_about_serati_image', true); 

    if ($img) {
      $image_id = attachment_url_to_postid($img['url']);
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
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left" >
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <div class="global-container">
      <div>
        <img src="<?php echo $medium[0]; ?>" alt="A portrait of Serati." data-scroll data-scroll-speed="0.3">
        <div data-scroll data-scroll-speed="1.5">
          <p class='text blending-difference'   >
            <?php echo  wp_kses_post(get_post_meta(get_the_ID(), '_afct_about_serati', true)); ?>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
<?php

if(!defined("IN_ONEPAGER")) 
    get_footer();

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
    <div class="text-upper-left">
        <h1>About</h1>
    </div>
    <div class="text-lower-right">
        <h1>Serati</h1>
    </div>
    <div class="global-container">
      <div class="content-frame">
        <div class="sticky-track">
          <div class="sticky-element">
            <div class="text-div">
              <?php echo "<p class='blending--difference'>" . wp_kses_post(get_post_meta(get_the_ID(), '_afct_about_serati', true)) ."</p>"; ?>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<?php

if(!defined("IN_ONEPAGER")) 
    get_footer();
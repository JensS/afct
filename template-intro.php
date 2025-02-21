<?php
/**
 * Template Name: Intro 
 * Template Post Type: page
 */

 
if(!defined("IN_ONEPAGER")) 
    get_header();

    ?>

<div id="intro" class="slide">
    <div class="text-upper-left">
        <h1>African Face</h1>
    </div>
    <div class="text-lower-right">
        <h1>Colonial Tongue</h1>
    </div>
    <?php
    $background_video = get_post_meta(get_the_ID(), '_afct_background_video', true);
    $video_cover_image = get_post_meta(get_the_ID(), '_afct_video_cover_image', true);
    if ($background_video) :
    ?>
    <video id="background-video" playsinline autoplay muted loop poster="<?php echo esc_url($video_cover_image); ?>">
        <source src="<?php echo esc_url($background_video); ?>" type="video/mp4">
    </video>
    <?php  else :
        if ($video_cover_image):
            ?>
            <img src="<?php echo esc_url($video_cover_image); ?>"/>
            <?php
            endif;
    endif; ?>
  </div>

  <div id="about-the-project" class="slide">
    <div class="text-upper-left">
        <p class="p-large"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part1', true)); ?></p>
    </div>
    <div class="text-lower-right">
        <p class="p-large"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part2', true)); ?></p>
    </div>
</div>
    <?php

if(!defined("IN_ONEPAGER")) 
    get_footer();
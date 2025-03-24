<?php
/**
 * Template Name: Hero Video
 * Template Post Type: page
 */

 
if(!defined("IN_ONEPAGER")) 
    get_header();

    ?>

<div id="intro" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
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
    <?php

if(!defined("IN_ONEPAGER")) 
    get_footer();

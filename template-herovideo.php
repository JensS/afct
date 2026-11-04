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
    if ( ! defined( 'IN_ONEPAGER' ) ) {
        echo '<h1 class="screen-reader-text">' . esc_html( get_the_title() ) . '</h1>';
    }
    $headline_parts = afct_split_headline(get_the_title());
    // The brand mark keeps its comma: "African Face," / "Colonial Tongue"
    $upper = $headline_parts['upper'];
    if (strpos(get_the_title(), ',') !== false) {
        $upper .= ',';
    }
    ?>
    <div class="text-upper-left">
        <p class="hero-title-line"><?php echo esc_html($upper); ?></p>
    </div>
    <div class="text-lower-right">
        <p class="hero-title-line"><?php echo esc_html($headline_parts['lower']); ?></p>
    </div>
    <?php
    $background_video = get_post_meta(get_the_ID(), '_afct_background_video', true);
    $video_cover_image = get_post_meta(get_the_ID(), '_afct_video_cover_image', true);
    if ($background_video) :
    ?>
    <video id="background-video" playsinline autoplay muted loop poster="<?php echo esc_url($video_cover_image); ?>" width="1920" height="1080">
        <source src="<?php echo esc_url($background_video); ?>" type="video/mp4">
    </video>
    <?php  else :
        if ($video_cover_image):
            ?>
            <img src="<?php echo esc_url($video_cover_image); ?>" width="1920" height="1080" alt="Video cover image"/>
            <?php
            endif;
    endif; ?>
</div>
    <?php

if(!defined("IN_ONEPAGER"))
    get_footer();

<?php
/**
 * Template Name: Intro 
 * Template Post Type: page
 */

 
if(!defined("IN_ONEPAGER")) 
    get_header();

    ?>

  <div id="about-the-project" class="slide">
    <?php
    $about_headline_parts = afct_split_headline('About The Project');
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($about_headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($about_headline_parts['lower']); ?></h1>
    </div>
    <div class="text-upper-left">
        <p class="p-large " data-scroll data-scroll-speed="0.2"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part2', true)); ?></p>
    </div>

    <div class="text-lower-right">
        <p class="p-large " data-scroll data-scroll-speed="0.2"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part1', true)); ?></p>
    </div>
</div>
    <?php

if(!defined("IN_ONEPAGER")) 
    get_footer();

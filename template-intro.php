<?php
/**
 * Template Name: Intro 
 * Template Post Type: page
 */

 
if(!defined("IN_ONEPAGER")) 
    get_header();

    ?>

  <div id="about-the-project" class="slide">
    <div class="text-upper-left">
        <p class="p-large " data-scroll  ><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part2', true)); ?></p>
    </div>

    <div class="text-lower-right">
        <p class="p-large " data-scroll ><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part1', true)); ?></p>
    </div>
  </div>
    <?php

if(!defined("IN_ONEPAGER")) 
    get_footer();

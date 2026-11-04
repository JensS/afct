<?php
/**
 * Template Name: Intro
 * Template Post Type: page
 */


if(!defined("IN_ONEPAGER"))
    get_header();

    $part1 = get_post_meta(get_the_ID(), '_afct_about_intro_part1', true);
    $part2 = get_post_meta(get_the_ID(), '_afct_about_intro_part2', true);
    $statement = trim($part1 . ' ' . $part2);
    ?>

  <div id="about-the-project" class="slide">
    <?php if ( ! defined( 'IN_ONEPAGER' ) ) {
        afct_render_section_headline( get_the_title(), 'serif' );
    } ?>
    <div class="statement-block">
        <p data-scroll><?php echo esc_html($statement); ?></p>
    </div>
  </div>
    <?php

if(!defined("IN_ONEPAGER"))
    get_footer();

<?php
/**
 * Template Name: Intro Template
 * Template Post Type: page
 */


if (!isset($included_in_onepager))
    get_header();

    ?>

<section id="intro" class="hero section">
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
    <?php endif; ?>
  </section>

  <section id="about-the-project" class="section">
    <div class="text-upper-left">
        <h1>About</h1>
    </div>
    <div class="text-lower-right">
        <h1>The Project</h1>
    </div>
    <div class="global-container">
      <div class="text-wrap">
        <div class="text-div-left">
          <p class="p-large align-left"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part1', true)); ?></p>
        </div>
        <div class="text-div-right">
          <p id="w-node-_3eefc5ef-3134-8468-840b-9df550f339b8-9543edea" class="p-large align-right"><?php echo esc_html(get_post_meta(get_the_ID(), '_afct_about_intro_part2', true)); ?></p>
        </div>
      </div>
    </div>
  </section>
    <?php

if (!isset($included_in_onepager))
    get_footer();
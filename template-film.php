<?php
/**
 * Template Name: The Film 
 * Template Post Type: page
 */

 if(!defined("IN_ONEPAGER")) 
 get_header();

?>

<div id="the-film" class="slide">
    <div class="text-upper-left">
        <h1>The</h1>
    </div>
    <div class="text-lower-right">
        <h1>Film</h1>
    </div>
    <div class="global-container">
      <div class="content-frame">
        <div class="youtube-div">
          <div class="youtube-wrap">
              <?php
              $youtube_embed = get_post_meta(get_the_ID(), '_afct_youtube_embed', true);
              if ($youtube_embed) :
                  // Extract the video ID from the YouTube URL
                  parse_str(parse_url($youtube_embed, PHP_URL_QUERY), $params);
                  $video_id = $params['v'] ?? '';

                  // Construct the embed URL
                  $embed_url = 'https://www.youtube.com/embed/' . $video_id;
              ?>
              <iframe width="560" height="315" src="<?php echo esc_url($embed_url); ?>" style="border:0px;" allowfullscreen></iframe>
              <?php endif; ?>
          </div>
        </div>
      </div>
    </div>
              </div>
<?php


if(!defined("IN_ONEPAGER")) 
    get_footer();
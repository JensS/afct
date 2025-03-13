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

                  // Check if user has already given YouTube consent
                  $youtube_consent = isset($_COOKIE['youtubeConsent']) ? true : false;
                  
                  if ($youtube_consent) :
                      // If consent given, show the embed directly
                      $embed_url = 'https://www.youtube.com/embed/' . $video_id;
              ?>
              <iframe width="700" height="400" src="<?php echo esc_url($embed_url); ?>" style="border:0px;style:width:60vw;height:auto" allowfullscreen></iframe>
              <?php else : ?>
              <!-- Privacy-friendly YouTube placeholder -->
              <div class="youtube-placeholder" data-video-id="<?php echo esc_attr($video_id); ?>">
                  <div class="youtube-placeholder-inner">
                      <div class="youtube-placeholder-content">
                          <p>This content is hosted by YouTube.</p>
                          <p>By showing this content, you agree to YouTube's privacy policy.</p>
                          <button class="youtube-consent-button button-primary">Load YouTube Video</button>
                      </div>
                  </div>
              </div>
              <?php endif; endif; ?>
          </div>
        </div>
      </div>
    </div>
              </div>
<?php


if(!defined("IN_ONEPAGER")) 
    get_footer();
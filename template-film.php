<?php
/**
 * Template Name: The Film 
 * Template Post Type: page
 */

 if(!defined("IN_ONEPAGER")) 
    get_header();


$youtube_embed = get_post_meta(get_the_ID(), '_afct_youtube_embed', true);
   
parse_str(parse_url($youtube_embed, PHP_URL_QUERY), $params);
$video_id = $params['v'] ?? '';
?>

<div id="the-film" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <!--<div class="global-container">-->
    <div class="video">
        <div class="youtube-placeholder" id="youtube-placeholder" data-video-id="<?php echo esc_attr($video_id); ?>">
            <div class="youtube-placeholder-inner">
                <div class="youtube-placeholder-content">
                    <p>This content is hosted by YouTube.</p>
                    <p>By showing this content, you agree to YouTube's privacy policy.</p>
                    <button class="youtube-consent-button button-primary">Load YouTube Video</button>
                </div>
            </div>
        </div>
    </div>
    <!--</div>-->
</div>
<?php
// Output Movie schema only when viewed standalone (one-pager already includes it in <head>)
if ( ! defined('IN_ONEPAGER') ) {
    $film_schema = afct_get_film_schema();
    if ( $film_schema ) {
        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode( $film_schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
        echo "\n</script>\n";
    }
    get_footer();
}

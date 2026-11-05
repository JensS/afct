<?php
/**
 * Template Name: The Film
 * Template Post Type: page
 */

 if(!defined("IN_ONEPAGER"))
    get_header();


$youtube_embed = get_post_meta(get_the_ID(), '_afct_youtube_embed', true);

$video_id = afct_get_youtube_id($youtube_embed);

// Film still shown behind the play button (page featured image)
$poster_url = afct_cdn_url( get_the_post_thumbnail_url(get_the_ID(), 'full') );
?>

<div id="the-film" class="slide">
    <?php afct_render_section_headline( get_the_title() ); ?>

    <div class="video">
        <div class="youtube-placeholder" id="youtube-placeholder" data-video-id="<?php echo esc_attr($video_id); ?>"<?php if ($poster_url) : ?> style="background-image:url('<?php echo esc_url($poster_url); ?>');"<?php endif; ?>>
            <button class="film-play-trigger" type="button" aria-label="<?php esc_attr_e( 'Show video privacy options', 'afct' ); ?>">
            <svg class="play-glyph" viewBox="0 0 50 63" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0 0L50 31.5L0 63V0Z" fill="#FF0000"/>
            </svg>
            </button>
            <div class="youtube-placeholder-inner">
                <div class="youtube-placeholder-content">
                    <p>This content is hosted by YouTube.</p>
                    <p>By showing this content, you agree to YouTube's privacy policy.</p>
                    <button class="youtube-consent-button button-primary">Load YouTube Video</button>
                </div>
            </div>
        </div>
    </div>
</div>
<?php
if ( ! defined('IN_ONEPAGER') ) {
    get_footer();
}

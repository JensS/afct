<?php
/**
 * Template Name: Podcast 
 * Template Post Type: page
 */


if(!defined("IN_ONEPAGER")) 
    get_header();

// Custom fields retrieval
$podcast_audio = get_post_meta(get_the_ID(), '_afct_podcast_audio', true);
$podcast_guests = get_post_meta(get_the_ID(), '_afct_podcast_guests', true);
$podcast_chapters = get_post_meta(get_the_ID(), '_afct_podcast_chapters', true);

$credits = afct_get_team_credits();
?>
    <div id="podcast" class="slide">
        <?php
        $headline_parts = afct_split_headline(get_the_title());
        ?>
        <div class="text-upper-left">
            <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
        </div>
        <div class="text-lower-right">
            <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
        </div>

        <div class="global-container">
            <div class="content-frame">
                <div class="podcast-wrap">
                <div class="podcast-authors">
                    <?php
                    $podcast_guests = get_post_meta(get_the_ID(), '_afct_podcast_guests', true);
                    if (!empty($podcast_guests)) :
                        foreach ($podcast_guests as $guest) :
                            // Prefer stored image_id; fall back to URL lookup for legacy data
                            $attachment_id = !empty($guest['image_id']) ? intval($guest['image_id']) : attachment_url_to_postid($guest['image']);

                            // Default values from meta field
                            $alt_text = !empty($guest['alt']) ? $guest['alt'] : '';
                            $title_text = '';
                            $caption = '';
                            $srcset = '';
                            $sizes = '';

                            if ($attachment_id) {
                                // Get attachment metadata
                                $attachment = get_post($attachment_id);

                                // Alt text (prefer WP attachment alt, fallback to meta field, then title)
                                $wp_alt = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
                                if (!empty($wp_alt)) {
                                    $alt_text = $wp_alt;
                                } elseif (empty($alt_text) && $attachment && !empty($attachment->post_title)) {
                                    $alt_text = $attachment->post_title;
                                }

                                // Title from attachment
                                if ($attachment && !empty($attachment->post_title)) {
                                    $title_text = $attachment->post_title;
                                }

                                // Caption from attachment
                                if ($attachment && !empty($attachment->post_excerpt)) {
                                    $caption = $attachment->post_excerpt;
                                }

                                // Get srcset and sizes for responsive images
                                $srcset = wp_get_attachment_image_srcset($attachment_id, 'medium');
                                $sizes = wp_get_attachment_image_sizes($attachment_id, 'medium');
                            }
                    ?>
                        <div class="podcast-author">
                        <img
                            src="<?php echo esc_url($guest['image']); ?>"
                            loading="lazy"
                            alt="<?php echo esc_attr($alt_text); ?>"
                            <?php if (!empty($title_text)) : ?>title="<?php echo esc_attr($title_text); ?>"<?php endif; ?>
                            <?php if (!empty($srcset)) : ?>srcset="<?php echo esc_attr($srcset); ?>"<?php endif; ?>
                            <?php if (!empty($sizes)) : ?>sizes="<?php echo esc_attr($sizes); ?>"<?php endif; ?>
                            class="image-2"
                            width="120"
                            height="120"
                        >
                        <?php if (!empty($caption)) : ?>
                        <span class="screen-reader-text"><?php echo esc_html($caption); ?></span>
                        <?php endif; ?>
                        </div>
                    <?php
                        endforeach;
                    endif;
                    ?>
                </div>
                <div class="podcast-description">
                    <p>Your language is much more than the words you use to communicate. It defines shapes the culture and every individuals identity. The landscape of post-Apartheid South Africa created many similar but also different living realitites. We hear four stories from people with a similar upbringing but vastly different life and problems and learn about how the language you speak (or don’t speak) defines how you engage in your countries culture.</p>
                </div>
                <div class="podcast-player-wrap">
                    <iframe id="podcast-embed" width="100%" height="112" frameborder="0" scrolling="no" allowtransparency="true" style="width: 100%; height: 112px; overflow: hidden; background: transparent;" data-embed-base="https://show.7minus2.com/@africanface/episodes/finding-a-place-between-two-worlds/embed/" src="https://show.7minus2.com/@africanface/episodes/finding-a-place-between-two-worlds/embed/light" title="African Face Colonial Tongue Podcast Player"></iframe>
                </div>
                <div class="podcast-buttons" style="margin-top: 2rem; display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <a href="https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7" class="button button-primary" target="_blank" rel="noopener noreferrer">
                        Listen on Spotify
                    </a>
                    <a href="https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874" class="button button-primary" target="_blank" rel="noopener noreferrer">
                        Listen on Podcasts
                    </a>
                </div>
                </div>
            </div>
        </div>
    </div>

<?php
// Output PodcastSeries schema only when viewed standalone (one-pager already includes it in <head>)
if ( ! defined('IN_ONEPAGER') ) {
    $podcast_schema = afct_get_podcast_schema();
    if ( $podcast_schema ) {
        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode( $podcast_schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
        echo "\n</script>\n";
    }
    get_footer();
}

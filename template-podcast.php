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
                    ?>
                        <div class="podcast-author">
                        <img src="<?php echo esc_url($guest['image']); ?>" loading="lazy" alt="<?php echo esc_attr($guest['alt']); ?>" class="image-2" width="120" height="120">
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
                    <iframe width="100%" height="112" frameborder="0" scrolling="no" style="width: 100%; height: 112px; overflow: hidden;" src="https://show.7minus2.com/@africanface/episodes/finding-a-place-between-two-worlds/embed/dark" title="African Face Colonial Tongue Podcast Player"></iframe>
                </div>
                <div class="podcast-buttons" style="margin-top: 2rem; display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <a href="https://open.spotify.com/show/7pZEwW27Xjr7Iqk1iIX7M7" class="button button-primary prospect-slide-button" target="_blank" rel="noopener noreferrer" style="padding: 0.8em 1.5em; min-width: 180px; text-align: center;">
                        Listen on Spotify
                    </a>
                    <a href="https://podcasts.apple.com/us/podcast/african-face-colonial-tongue-the-podcast/id1771495874" class="button button-primary prospect-slide-button" target="_blank" rel="noopener noreferrer" style="padding: 0.8em 1.5em; min-width: 180px; text-align: center;">
                        Listen on Podcasts
                    </a>
                </div>
                </div>
            </div>
        </div>
    </div>

<?php


if(!defined("IN_ONEPAGER")) 
    get_footer();

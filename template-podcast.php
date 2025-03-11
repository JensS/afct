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
        <div class="text-upper-left">
            <h1>The</h1>
        </div>
        <div class="text-lower-right">
            <h1>Podcast</h1>
        </div>

        <div class="content-frame">
            <div class="podcast-wrap">
                <div class="podcast-authors">
                    <?php
                    $podcast_guests = get_post_meta(get_the_ID(), '_afct_podcast_guests', true);
                    if (!empty($podcast_guests)) :
                        foreach ($podcast_guests as $guest) :
                    ?>
                        <div class="podcast-author">
                        <img src="<?php echo esc_url($guest['image']); ?>" loading="lazy" alt="<?php echo esc_attr($guest['alt']); ?>" class="image-2">
                        </div>
                    <?php
                        endforeach;
                    endif;
                    ?>
                </div>
                <div class="podcast-description">
                    <p>Your language is much more than the words you use to communicate. It defines shapes the culture and every individuals identity. The landscape of post-Apartheid South Africa created many similar but also different living realitites. We hear four stories from people with a similar upbringing but vastly different life and problems and learn about how the language you speak (or don’t speak) defines how you engage in your countries culture.</p>
                </div>
                <div class="audio-wrap">
                    <?php 
                    $podcast_audio = get_post_meta(get_the_ID(), '_afct_podcast_audio', true);
                    if ($podcast_audio) : ?>
                        <div class="custom-audio-player">
                            <audio id="podcast-player" preload="metadata">
                                <source src="<?php echo esc_url($podcast_audio); ?>" type="audio/mpeg">
                            </audio>
                            <div class="player-controls">
                                <button class="play-pause">
                                    <span class="play-icon">▶</span>
                                    <span class="pause-icon" style="display:none">❚❚</span>
                                </button>
                                <div class="progress-wrap">
                                    <div class="time current">0:00</div>
                                    <div class="progress-bar">
                                        <div class="progress"></div>
                                        <div class="chapter-markers">
                                            <?php
                                            if ($podcast_chapters):
                                                foreach ($podcast_chapters as $chapter):
                                                    $parts = explode(':', $chapter['time']);
                                                    $seconds = $parts[0] * 60 + $parts[1];
                                                    echo '<div class="chapter-mark" data-time="' . esc_attr($seconds) . '" title="' . esc_attr($chapter['title']) . '"></div>';
                                                endforeach;
                                            endif;
                                            ?>
                                        </div>
                                    </div>
                                    <div class="time duration">0:00</div>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
                <!-- Display chapters -->
                <?php if ($podcast_chapters): ?>
                    <table class="podcast-chapters">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Chapters</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($podcast_chapters as $chapter): ?>
                            <tr><td><?php echo esc_attr($chapter['time']); ?></td><td><a href="#" data-time="<?php echo esc_attr($chapter['time']); ?>"><?php echo esc_html($chapter['title']); ?></a></td></tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
    </div>

<?php


if(!defined("IN_ONEPAGER")) 
    get_footer();
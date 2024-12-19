<?php
/**
 * Template Name: Podcast Template
 * Template Post Type: page
 */

get_header();

// Custom fields retrieval
$podcast_audio = get_post_meta(get_the_ID(), '_afct_podcast_audio', true);
$podcast_guests = get_post_meta(get_the_ID(), '_afct_podcast_guests', true);

$credits = afct_get_team_credits();
?>
<main id="primary" class="site-main">
    <section id="section-<?php the_ID(); ?>" class="section">
        <h1 class="headline-b"><?php the_title(); ?></h1>
        <?php if ($podcast_audio): ?>
            <audio controls>
                <source src="<?php echo esc_url($podcast_audio); ?>" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        <?php endif; ?>
        <!-- Display podcast guests -->
        <?php if ($podcast_guests): ?>
            <div class="podcast-guests">
                <?php foreach ($podcast_guests as $guest): ?>
                    <div class="podcast-guest">
                        <img src="<?php echo esc_url($guest['image']); ?>" alt="<?php echo esc_attr($guest['alt']); ?>">
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        <?php the_content(); ?>
    </section>
    <?php if (!empty($credits['podcast_team'])): ?>
        <section id="credits" class="section">
            <h2>Credits</h2>
            <ul>
                <?php foreach ($credits['podcast_team'] as $role => $name): ?>
                    <li><strong><?php echo esc_html($role); ?>:</strong> <?php echo esc_html($name); ?></li>
                <?php endforeach; ?>
            </ul>
        </section>
    <?php endif; ?>
</main>
<?php
get_footer();
?>
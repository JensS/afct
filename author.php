<?php
/**
 * The template for displaying author pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package AFCT
 */

get_header();

// Get the author data (always available on author page)
$author = get_queried_object();
$author_id = $author->ID;

// Build author name - prefer first name + last name, fallback to display name
$first_name = get_the_author_meta('first_name', $author_id);
$last_name = get_the_author_meta('last_name', $author_id);

if ($first_name && $last_name) {
    $author_name = $first_name . ' ' . $last_name;
} elseif ($first_name) {
    $author_name = $first_name;
} elseif ($last_name) {
    $author_name = $last_name;
} else {
    $author_name = $author->display_name;
}
$author_bio = get_the_author_meta('description', $author_id);
$author_tagline = get_the_author_meta('tagline', $author_id);
$author_website = get_the_author_meta('user_url', $author_id);
$author_twitter = get_the_author_meta('twitter', $author_id);
$author_linkedin = get_the_author_meta('linkedin', $author_id);
$author_instagram = get_the_author_meta('instagram', $author_id);
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main" style="min-height: 60vh;">
        <div class="global-container" style="max-width: 800px; margin: 0 auto; padding: 6rem 2rem;">

            <!-- Back link -->
            <div style="margin-bottom: 2rem;">
                <a href="<?php echo esc_url(home_url('/')); ?>" style="color: var(--text-color); text-decoration: none; font-size: 1rem;">
                    ← Back to main website
                </a>
            </div>

            <!-- Author Header -->
            <div class="author-header" style="text-align: center; margin-bottom: 3rem;">

                <!-- Author Avatar -->
                <div class="author-avatar" style="margin-bottom: 2rem;">
                    <?php
                    echo get_avatar($author_id, 200, '', $author_name, array(
                        'style' => 'border-radius: 50%; border: 3px solid var(--red);'
                    ));
                    ?>
                </div>

                <!-- Author Name -->
                <h1 style="color: var(--red); margin-bottom: 0.5rem; font-size: 3rem;">
                    <?php echo esc_html($author_name); ?>
                </h1>

                <!-- Tagline -->
                <?php if ($author_tagline) : ?>
                    <p class="author-tagline" style="font-size: 1.25rem; color: var(--text-color); margin-bottom: 2rem; font-family: var(--serif-font); font-style: italic;">
                        <?php echo esc_html($author_tagline); ?>
                    </p>
                <?php endif; ?>

                <!-- Social Links -->
                <?php if ($author_website || $author_twitter || $author_linkedin || $author_instagram) : ?>
                    <div class="author-social" style="display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
                        <?php if ($author_website) : ?>
                            <a href="<?php echo esc_url($author_website); ?>" target="_blank" rel="noopener noreferrer" style="color: var(--text-color); text-decoration: none; font-size: 1rem;">
                                Website
                            </a>
                        <?php endif; ?>
                        <?php if ($author_twitter) : ?>
                            <a href="<?php echo esc_url($author_twitter); ?>" target="_blank" rel="noopener noreferrer" style="color: var(--text-color); text-decoration: none; font-size: 1rem;">
                                Twitter
                            </a>
                        <?php endif; ?>
                        <?php if ($author_linkedin) : ?>
                            <a href="<?php echo esc_url($author_linkedin); ?>" target="_blank" rel="noopener noreferrer" style="color: var(--text-color); text-decoration: none; font-size: 1rem;">
                                LinkedIn
                            </a>
                        <?php endif; ?>
                        <?php if ($author_instagram) : ?>
                            <a href="<?php echo esc_url($author_instagram); ?>" target="_blank" rel="noopener noreferrer" style="color: var(--text-color); text-decoration: none; font-size: 1rem;">
                                Instagram
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Author Bio -->
            <?php if ($author_bio) : ?>
                <div class="author-bio" style="max-width: 600px; margin: 0 auto 3rem; text-align: left;">
                    <h2 style="color: var(--red); font-size: 1.5rem; margin-bottom: 1rem; font-family: var(--sans-serif-font);">
                        About
                    </h2>
                    <div style="font-size: 1.125rem; line-height: 1.6; color: var(--text-color);">
                        <?php echo wp_kses_post(wpautop($author_bio)); ?>
                    </div>
                </div>
            <?php else : ?>
                <div style="max-width: 600px; margin: 0 auto 3rem; text-align: center; color: var(--text-color-opaque);">
                    <p><em>No bio available. Add a bio in your WordPress profile to display it here.</em></p>
                </div>
            <?php endif; ?>

            <!-- Author Posts (if any) -->
            <?php if (have_posts()) :
                // Count the posts
                $post_count = $wp_query->found_posts;
                ?>
                <div class="author-posts" style="max-width: 600px; margin: 0 auto;">
                    <h2 style="color: var(--red); font-size: 1.5rem; margin-bottom: 1.5rem; font-family: var(--sans-serif-font);">
                        Posts by <?php echo esc_html($author_name); ?>
                    </h2>

                    <div class="posts-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <?php while (have_posts()) : the_post(); ?>
                            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?> style="border-bottom: 1px solid var(--text-color-opaque); padding-bottom: 1.5rem;">
                                <h3 style="margin-bottom: 0.5rem;">
                                    <a href="<?php the_permalink(); ?>" style="color: var(--text-color); text-decoration: none; font-size: 1.25rem;">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>

                                <div class="entry-meta" style="font-size: 0.9rem; color: var(--text-color-opaque); margin-bottom: 0.75rem;">
                                    <?php echo get_the_date(); ?>
                                </div>

                                <?php if (has_excerpt()) : ?>
                                    <div class="entry-excerpt" style="color: var(--text-color); font-size: 1rem; line-height: 1.5;">
                                        <?php the_excerpt(); ?>
                                    </div>
                                <?php endif; ?>
                            </article>
                        <?php endwhile; ?>
                    </div>

                    <?php
                    // Pagination
                    the_posts_pagination(array(
                        'mid_size' => 2,
                        'prev_text' => '← Previous',
                        'next_text' => 'Next →',
                    ));
                    ?>
                </div>
            <?php endif; ?>

        </div>
    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php
get_footer();

<?php
/**
 * Template Name: Awards & Press
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER"))
    get_header();

$laurels  = get_post_meta(get_the_ID(), '_afct_awards_laurels', true);
$articles = get_post_meta(get_the_ID(), '_afct_awards_articles', true);
?>

<div id="awards-press" class="slide">
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
        <div class="content-frame awards-wrap">

            <?php if (!empty($laurels)) : ?>
            <div class="laurels-grid">
                <?php foreach ($laurels as $laurel) : ?>
                <div class="laurel-item">
                    <?php if (!empty($laurel['image'])) :
                        $att_id = attachment_url_to_postid($laurel['image']);
                        $src    = $att_id ? wp_get_attachment_image_src($att_id, 'medium') : false;
                        $w = $src ? $src[1] : 200;
                        $h = $src ? $src[2] : 200;
                    ?>
                    <img
                        src="<?php echo esc_url($laurel['image']); ?>"
                        alt="<?php echo esc_attr($laurel['title']); ?>"
                        width="<?php echo intval($w); ?>"
                        height="<?php echo intval($h); ?>"
                        loading="lazy"
                        class="laurel-image"
                    >
                    <?php endif; ?>
                    <p class="laurel-festival"><?php echo esc_html($laurel['title']); ?></p>
                    <?php if (!empty($laurel['award'])) : ?>
                    <p class="laurel-award"><?php echo esc_html($laurel['award']); ?></p>
                    <?php endif; ?>
                    <?php if (!empty($laurel['year'])) : ?>
                    <p class="laurel-year"><?php echo esc_html($laurel['year']); ?></p>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <?php if (!empty($articles)) : ?>
            <div class="press-list">
                <h2 class="press-heading">Press</h2>
                <?php foreach ($articles as $article) : ?>
                <a href="<?php echo esc_url($article['url']); ?>" class="press-item" target="_blank" rel="noopener noreferrer">
                    <span class="press-title"><?php echo esc_html($article['title']); ?></span>
                    <?php if (!empty($article['publication'])) : ?>
                    <span class="press-publication"><?php echo esc_html($article['publication']); ?></span>
                    <?php endif; ?>
                    <?php if (!empty($article['date'])) : ?>
                    <span class="press-date"><?php echo esc_html($article['date']); ?></span>
                    <?php endif; ?>
                </a>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

        </div>
    </div>
</div>

<?php
if(!defined("IN_ONEPAGER"))
    get_footer();

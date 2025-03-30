<?php
/**
 * Template Name: Team Credits Template
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();

function get_credits_data() {
    $credits_file = get_template_directory() . '/credits.json';
    if (file_exists($credits_file)) {
        $json_content = file_get_contents($credits_file);
        return json_decode($json_content, true);
    }
    return null;
}

$credits = get_credits_data();
?>

<div id="the-team" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <div class="content text">
        <?php if (isset($credits['film_team'])): ?>
        <div class="team" data-scroll data-scroll-speed="4">
            <h2 class="align-center">Film Team</h2>
            <?php foreach ($credits['film_team'] as $role => $name): ?>
            <div class="credit-div">
                <p class="credit-description"><?php echo esc_html($role); ?></p>
                <p class="meta-description"><?php echo esc_html($name); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php if (isset($credits['podcast_team'])): ?>
        <div class="team" data-scroll data-scroll-speed="4">
            <h2 class="align-center padding-bottom_24px">Podcast Team</h2>
            <?php foreach ($credits['podcast_team'] as $role => $name): ?>
            <div class="credit-div">
                <p class="credit-description"><?php echo esc_html($role); ?></p>
                <p class="meta-description"><?php echo esc_html($name); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();

<?php
/**
 * Template Name: Team Credits Template
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();

$credits = afct_get_team_credits();
?>

<div id="the-team" class="slide">
    <?php afct_render_section_headline( get_the_title() ); ?>
    <div class="team-groups">
        <?php if (isset($credits['film_team'])): ?>
        <h2 class="team-group-label">Film Team</h2>
        <div class="team">
            <?php foreach ($credits['film_team'] as $role => $name): ?>
            <div class="credit-div">
                <p class="credit-description"><?php echo esc_html($role); ?></p>
                <p class="meta-description"><?php echo esc_html($name); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php if (isset($credits['podcast_team'])): ?>
        <h2 class="team-group-label">Podcast Team</h2>
        <div class="team">
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
?>

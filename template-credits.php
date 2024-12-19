<?php
/**
 * Template Name: Team Credits Template
 * Template Post Type: page
 */

 if (!isset($included_in_onepager))
 get_header();

?>

<section id="the-team" class="the-team">
<div class="text-upper-left">
        <h1>The</h1>
    </div>
    <div class="text-lower-right">
        <h1>Team</h1>
    </div>
<div class="global-container">
  <div class="sticky-wrap">
    <div data-w-id="c192801f-ea26-1f09-93ea-c5e1bae0e26c" class="sticky-trigger">
      <div class="sticky-track">
        <div class="sticky-element">
          <div class="text-div">
            <div data-w-id="6da08bf3-6566-3f77-c6f8-fda20cd09f72" class="content">
              <div class="credits-grid">
                <?php
                $credits = get_post_meta(get_the_ID(), '_afct_credits', true);
                $credits = json_decode($credits, true);
                if (is_array($credits)) :
                ?>
                <div id="w-node-_68429cef-ef48-153c-a98a-00737a438797-9543edea" class="film-team">
                  <h2 id="w-node-_207c82d4-d92d-d37a-76cd-f8ae50dcdfcb-9543edea" class="align-center">Film Team</h2>
                  <?php foreach ($credits['film_team'] as $role => $name) : ?>
                  <div id="w-node-b61ef25a-49eb-a4ef-e7e6-8266f1adde7b-9543edea" class="credit-div">
                    <p class="credit-description"><?php echo esc_html($role); ?></p>
                    <p id="w-node-_7f91fb6a-af88-2c01-b1b0-32a1327ae0c7-9543edea" class="meta-description"><?php echo esc_html($name); ?></p>
                  </div>
                  <?php endforeach; ?>
                </div>
                <div id="w-node-_6649d303-9c27-68c1-84ec-76f29e909b76-9543edea" class="podcast-team">
                  <h2 id="w-node-_0e6438ca-a929-b907-41e3-0ebe3ef22902-9543edea" class="align-center padding-bottom_24px">Podcast Team</h2>
                  <?php foreach ($credits['podcast_team'] as $role => $name) : ?>
                  <div id="w-node-_1f3f452f-a1a4-7d2f-9d38-2b49ee9a4026-9543edea" class="credit-div">
                    <p class="credit-description"><?php echo esc_html($role); ?></p>
                    <p id="w-node-_1f3f452f-a1a4-7d2f-9d38-2b49ee9a4029-9543edea" class="meta-description"><?php echo esc_html($name); ?></p>
                  </div>
                  <?php endforeach; ?>
                </div>
                <?php endif; ?>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</section>
<?php


if (!isset($included_in_onepager))
    get_footer();
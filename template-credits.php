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
    <div class="content text blending-difference"  data-scroll data-scroll-speed="1.5" style="margin-top:15vh;z-index:1000; margin-bottom:15vh">
        <?php if (isset($credits['film_team'])): ?>
        <div class="team">
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
        <div class="team">
            <h2 class="align-center">Podcast Team</h2>
            <?php foreach ($credits['podcast_team'] as $role => $name): ?>
            <div class="credit-div">
                <p class="credit-description"><?php echo esc_html($role); ?></p>
                <p class="meta-description"><?php echo esc_html($name); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

    </div>
            <?php
            // Get the image data from the meta field
            $image_data = get_post_meta(get_the_ID(), '_afct_credits_image', true);
            $image_url = null;
            $alt_text = ''; // Initialize alt text

            if ($image_data && !empty($image_data['url'])) {
                // Try to get the attachment ID from the URL
                $image_id = attachment_url_to_postid($image_data['url']);

                // Set default alt text from meta field if available
                if (!empty($image_data['alt'])) {
                    $alt_text = $image_data['alt'];
                }

                if ($image_id) {
                    // Get the large size image source
                    // Note: WordPress defines 'large' size in Settings > Media
                    $medium_image = wp_get_attachment_image_src($image_id, 'large');
                    if ($medium_image) {
                        $image_url = $medium_image[0]; // Use medium URL
                        // If alt text wasn't in meta, try getting it from WP attachment data
                        if (empty($alt_text)) {
                            $wp_alt_text = get_post_meta($image_id, '_wp_attachment_image_alt', true);
                            if (!empty($wp_alt_text)) {
                                $alt_text = $wp_alt_text;
                            }
                        }
                    }
                }
            }
/*
            // Output the image tag or fallback
            if ($image_url) {
                // Use a generic default alt text if none was found
                if (empty($alt_text)) {
                    $alt_text = 'Credits background image'; 
                }
                echo '<div data-scroll data-scroll-speed="0.8" style="text-align:center;position: absolute;top:10vh;left:0;right:0">';
                echo '<img src="' . esc_url($image_url) . '" alt="' . esc_attr($alt_text) . '" class="image-credits" style="opacity: 0.9;" />';
                echo '</div>';
            } */
            ?>
</div>

<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();
?>

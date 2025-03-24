<?php
/**
 * Template Name: History 
 * Template Post Type: page
 */

 if(!defined("IN_ONEPAGER")) 
 get_header();
?>

<div id="the-history" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <div class="img-sections-wrap">
        <div id="visualization-container">
            <div id="map-container"></div>
            <div id="timeline-info">
                <div id="year-display">1652</div>
                <div id="event-info"></div>
            </div>

            <!-- Instruction removed as requested -->
            <div class="timeline-markers"></div>
        </div>
        
        <!-- Timeline content will be dynamically generated from history.json -->
        <div id="timeline-content" class="global-container"></div>
    </div>
</div>
<script src="<?php echo get_template_directory_uri(); ?>/js/history-timeline.js"></script>

<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();

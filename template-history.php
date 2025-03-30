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
        <div id="visualization-container" data-scroll data-scroll-id="history" data-scroll-speed="0">
            <div id="map-container"></div>
            
            <div id="visualization-data" class="hidden" 
                 data-history-entries="<?php 
                     $history_entries = get_post_meta(get_the_ID(), '_afct_history_entries', true);
                     echo esc_attr(json_encode($history_entries)); 
                 ?>">
            </div>
            <div class="timeline-markers">
                <div id="active-marker-line"></div>
            </div>
        </div>
        
        <!-- Timeline content will be dynamically generated  -->
        <div id="timeline-content" class="global-container"></div>
    </div>
</div>
<script src="<?php echo get_template_directory_uri(); ?>/js/history-timeline.js"></script>

<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();

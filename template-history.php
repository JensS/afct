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
    // Display standard split headline
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>

    <div class="history-layout">
        <!-- Left panel: Text content and navigation -->
        <div class="history-text-panel">
            <div class="history-text-content">
                <div id="timeline-content"></div>
            </div>
            <div class="history-nav-arrows">
                <!-- Arrows will be added by JS -->
            </div>
        </div>

        <!-- Right panel: Map and visualizations -->
        <div class="history-map-panel">
            <div id="visualization-container" data-scroll data-scroll-id="history" data-scroll-speed="0">
                <div id="map-container"></div>

                <div id="visualization-data" class="hidden"
                     data-history-entries="<?php
                         $history_entries = get_post_meta(get_the_ID(), '_afct_history_entries', true);
                         echo esc_attr(json_encode($history_entries));
                     ?>">
                </div>
            </div>
            <!-- Timeline band underneath the map -->
            <div class="timeline-markers">
                <div class="timeline-band-container">
                    <div class="timeline-band"></div>
                </div>
                <div class="timeline-center-indicator"></div>
            </div>
        </div>
    </div>
</div>

<?php
if(!defined("IN_ONEPAGER"))
    get_footer();

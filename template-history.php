<?php
/**
 * Template Name: History
 * Template Post Type: page
 */

if ( ! defined( 'IN_ONEPAGER' ) ) {
    get_header();
}

$history_entries = get_post_meta( get_the_ID(), '_afct_history_entries', true );
$history_entries = afct_normalize_history_entries( $history_entries );
?>

<div id="the-history" class="slide">
    <?php afct_render_section_headline( get_the_title() ); ?>

    <div
        class="history-layout"
        role="region"
        aria-label="<?php esc_attr_e( 'South African history viewer', 'afct' ); ?>"
        tabindex="0"
    >
        <div class="history-ruler" aria-hidden="true">
            <div class="timeline-markers"></div>
        </div>

        <div class="history-text-panel">
            <div class="history-text-content">
                <div id="timeline-content" aria-live="polite"></div>
            </div>

            <div class="history-nav-arrows">
                <button
                    class="carousel-arrow prev"
                    type="button"
                    aria-label="<?php esc_attr_e( 'Previous history entry', 'afct' ); ?>"
                    aria-controls="timeline-content"
                ></button>
                <button
                    class="carousel-arrow next"
                    type="button"
                    aria-label="<?php esc_attr_e( 'Next history entry', 'afct' ); ?>"
                    aria-controls="timeline-content"
                ></button>
            </div>
        </div>

        <div class="history-map-panel" aria-hidden="true">
            <div id="visualization-container">
                <div id="map-container"></div>
            </div>
        </div>

        <div
            id="visualization-data"
            class="hidden"
            data-history-entries="<?php echo esc_attr( wp_json_encode( $history_entries ) ); ?>"
        ></div>
    </div>

    <?php if ( $history_entries ) : ?>
        <details class="history-transcript">
            <summary><?php esc_html_e( 'Read the full historical timeline', 'afct' ); ?></summary>
            <?php foreach ( $history_entries as $entry ) :
                if ( ! is_array( $entry ) ) {
                    continue;
                }
                $text = isset( $entry['history_paragraph'] ) && is_array( $entry['history_paragraph'] ) ? $entry['history_paragraph'] : $entry;
                ?>
                <article>
                    <h3><?php echo esc_html( ( $entry['year_start'] ?? '' ) . ' — ' . ( $text['title'] ?? '' ) ); ?></h3>
                    <?php echo wp_kses_post( wpautop( $text['paragraph'] ?? '' ) ); ?>
                </article>
            <?php endforeach; ?>
        </details>
    <?php endif; ?>
</div>

<?php
if ( ! defined( 'IN_ONEPAGER' ) ) {
    get_footer();
}

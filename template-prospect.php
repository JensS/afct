<?php
/**
 * Template Name: Prospect
 * Template Post Type: page
 */

// Prevent direct access if not part of the one-pager structure
if ( ! defined( "IN_ONEPAGER" ) ) {
    get_header();
}

// Get carousel slides data
$slides = get_post_meta( get_the_ID(), '_afct_prospect_slides', true );
if ( ! is_array( $slides ) ) {
	$slides = [];
}

?>
<div id="prospect" class="slide">
    <?php
    // Display standard split headline
    $headline_parts = afct_split_headline( get_the_title() );
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html( $headline_parts['upper'] ); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html( $headline_parts['lower'] ); ?></h1>
    </div>

    <div class="content-frame prospect-content">
        <?php 
        // Display text content above carousel if it exists
        $text_content = get_post_meta(get_the_ID(), '_afct_prospect_text', true);
        if (!empty($text_content)) : 
        ?>
            <div class="prospect-text-block">
                <?php echo wp_kses_post($text_content); ?>
            </div>
        <?php endif; ?>

        <?php if ( ! empty( $slides ) ) : ?>
            <div id="prospect-carousel" class="prospect-carousel-container">
                <div class="prospect-slides">
                    <?php foreach ( $slides as $index => $slide ) : ?>
                        <?php
                        // Get image URL, try 'large' size first, fallback to full
                        $image_url = '';
                        if ( ! empty( $slide['image_id'] ) ) {
                            $image_data = wp_get_attachment_image_src( $slide['image_id'], 'large' ); // Or 'full' or a custom size
                            if ($image_data) {
                                $image_url = $image_data[0];
                            } else {
                                // Fallback if 'large' size doesn't exist
                                $image_data_full = wp_get_attachment_image_src( $slide['image_id'], 'full' );
                                if ($image_data_full) {
                                    $image_url = $image_data_full[0];
                                }
                            }
                        }
                        ?>
                        <div class="prospect-slide-item <?php echo $index === 0 ? 'active' : ''; ?>" data-index="<?php echo esc_attr( $index ); ?>">
                            <?php if ( $image_url ) : ?>
                                <img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $slide['label'] ?? 'Carousel image' ); ?>" loading="<?php echo $index === 0 ? 'eager' : 'lazy'; ?>">
                            <?php endif; ?>
                            <?php if ( ! empty( $slide['label'] ) && ! empty( $slide['url'] ) ) : ?>
                                <a href="<?php echo esc_url( $slide['url'] ); ?>" class="button button-primary prospect-slide-button" target="_blank" rel="noopener noreferrer">
                                    <?php echo esc_html( $slide['label'] ); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if ( count( $slides ) > 1 ) : ?>
                    <!-- Use shared carousel arrow classes with no text content -->
                    <button class="carousel-arrow prev" aria-label="Previous Slide"></button>
                    <button class="carousel-arrow next" aria-label="Next Slide"></button>
                <?php endif; ?>
            </div>
        <?php else : ?>
            <p>No carousel slides have been configured for this page.</p>
        <?php endif; ?>

        <?php
        // Optional: Display standard page content if needed
        // the_content();
        ?>
    </div>
</div>

<?php
// Prevent direct access if not part of the one-pager structure
if ( ! defined( "IN_ONEPAGER" ) ) {
    get_footer();
}
?>

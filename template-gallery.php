<?php
/**
 * Template Name: Gallery 
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();
?>

<div id="the-stills" class="slide">
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
        <div class="global-container" >
            <div class="gallery-grid" >
                <div class="gallery-row gallery-intro-row">
                    <div class="gallery-column" style="width: 100%">
                        <h2 class="align-center">Explore the photography stills captured by Steve Marais.</h2>
                    </div>
                </div>
                <?php
                $gallery_data = get_post_meta(get_the_ID(), '_afct_gallery_layout', true);

                if (!empty($gallery_data['rows'])) :
                    foreach ($gallery_data['rows'] as $row) : ?>
                        <div class="gallery-row">
                            <?php foreach ($row['columns'] as $column) :
                                $width_percentage = ($column['width'] * 10) . '%';
                                $column_type = isset($column['type']) ? $column['type'] : 'image';
                                ?>
                                <div class="gallery-column <?php echo esc_attr($column_type); ?>" style="width: <?php echo esc_attr($width_percentage); ?>">
                                    <?php if ($column_type === 'image' && !empty($column['image_id'])) : 
                                        $scroll_speed = isset($column['scroll_speed']) ? $column['scroll_speed'] : '1';
                                    ?>
                                        <?php
                                            $_alt = get_post_meta($column['image_id'], '_wp_attachment_image_alt', true);
                                            if (empty($_alt)) {
                                                $_alt = get_the_title($column['image_id']);
                                            }
                                        ?>
                                        <img src="<?php echo esc_url(wp_get_attachment_image_url($column['image_id'], 'full')); ?>"
                                             alt="<?php echo esc_attr($_alt); ?>"
                                             loading="lazy"
                                             data-scroll data-speed="<?php echo esc_attr($scroll_speed); ?>">
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endforeach;
                endif; ?>
            </div>
        </div>
    </div>
</div>

<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();

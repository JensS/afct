<?php
/**
 * Template Name: Gallery 
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();
?>

<div id="the-stills" class="slide">
    <div class="text-upper-left">
        <h1>Stills</h1>
    </div>
    <div class="text-lower-right">
        <h1>Photography</h1>
    </div>
    
    <div class="img-sections-wrap">
        <div class="global-container">
            <div>
                <h2 class="align-center">Explore the photography stills captured by Steve Marais.</h2>
            </div>
            <div class="gallery-grid">
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
                                    <?php if ($column_type === 'image' && !empty($column['image_id'])) : ?>
                                        <img src="<?php echo esc_url(wp_get_attachment_image_url($column['image_id'], 'full')); ?>"
                                             alt="<?php echo esc_attr(get_post_meta($column['image_id'], '_wp_attachment_image_alt', true)); ?>"
                                             loading="lazy">
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

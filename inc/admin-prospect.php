<?php
/**
 * Admin functions for the Prospect page carousel
 *
 * @package AFCT
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Add meta box for prospect carousel slides
 */
function afct_add_prospect_slides_meta_box() {
    add_meta_box(
        'prospect_slides_meta_box',
        'Prospect Carousel Slides',
        'afct_prospect_slides_meta_box_callback',
        'page',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'afct_add_prospect_slides_meta_box');

/**
 * Callback function to render the prospect carousel meta box
 */
function afct_prospect_slides_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('afct_prospect_slides_meta_box', 'afct_prospect_slides_meta_box_nonce');

    // Get existing carousel slides if they exist
    $slides = get_post_meta($post->ID, '_afct_prospect_slides', true);
    if (!is_array($slides)) {
        $slides = array();
    }
    
    ?>
    <div id="prospect-slides-container">
        <p>Add carousel slides for the Prospect page. Each slide consists of an image and a button with a label and URL.</p>
        
        <div class="prospect-slides">
            <?php
            if (!empty($slides)) {
                foreach ($slides as $index => $slide) {
                    afct_render_prospect_slide($index, $slide);
                }
            }
            ?>
        </div>
        
        <div class="prospect-slides-actions">
            <button type="button" class="button button-primary add-slide">Add Slide</button>
        </div>
    </div>

    <!-- Template for new carousel slides -->
    <script type="text/html" id="tmpl-prospect-slide">
        <?php afct_render_prospect_slide('{{data.index}}', array('image_id' => '', 'label' => '', 'url' => '')); ?>
    </script>

    <style>
        .prospect-slide {
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            margin-bottom: 15px;
            position: relative;
        }
        .prospect-slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .prospect-slide-title {
            font-weight: bold;
        }
        .prospect-slide-content {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .prospect-slide-image-preview {
            width: 200px;
            height: 150px;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
        }
        .prospect-slide-image-preview img {
            max-width: 100%;
            max-height: 100%;
        }
        .prospect-slide-image-preview .no-image {
            color: #888;
        }
        .prospect-slide-fields {
            flex: 1;
            min-width: 300px;
        }
        .prospect-slide-field {
            margin-bottom: 10px;
        }
        .prospect-slide-field label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .prospect-slide-field input[type="text"] {
            width: 100%;
        }
        .remove-slide {
            color: #a00;
            cursor: pointer;
        }
        .sort-handle {
            cursor: move;
            color: #666;
        }
    </style>
    <?php
}

/**
 * Render a single carousel slide
 */
function afct_render_prospect_slide($index, $slide) {
    $image_id = isset($slide['image_id']) ? $slide['image_id'] : '';
    $label = isset($slide['label']) ? $slide['label'] : '';
    $url = isset($slide['url']) ? $slide['url'] : '';
    
    $image_url = '';
    if ($image_id) {
        $image_url = wp_get_attachment_image_url($image_id, 'medium');
    }
    ?>
    <div class="prospect-slide" data-index="<?php echo esc_attr($index); ?>">
        <div class="prospect-slide-header">
            <span class="prospect-slide-title">
                <span class="dashicons dashicons-menu sort-handle"></span>
                Slide <?php echo esc_html($index + 1); ?>
            </span>
            <span class="remove-slide dashicons dashicons-trash"></span>
        </div>
        
        <div class="prospect-slide-content">
            <div class="prospect-slide-image-preview" data-index="<?php echo esc_attr($index); ?>">
                <?php if ($image_url) : ?>
                    <img src="<?php echo esc_url($image_url); ?>" alt="Slide image">
                <?php else : ?>
                    <span class="no-image">Click to add image</span>
                <?php endif; ?>
                <input type="hidden" name="prospect_slides[<?php echo esc_attr($index); ?>][image_id]" value="<?php echo esc_attr($image_id); ?>">
            </div>
            
            <div class="prospect-slide-fields">
                <div class="prospect-slide-field">
                    <label for="prospect_slide_label_<?php echo esc_attr($index); ?>">Button Label</label>
                    <input type="text" id="prospect_slide_label_<?php echo esc_attr($index); ?>" name="prospect_slides[<?php echo esc_attr($index); ?>][label]" value="<?php echo esc_attr($label); ?>" placeholder="Enter button text">
                </div>
                
                <div class="prospect-slide-field">
                    <label for="prospect_slide_url_<?php echo esc_attr($index); ?>">Button URL</label>
                    <input type="text" id="prospect_slide_url_<?php echo esc_attr($index); ?>" name="prospect_slides[<?php echo esc_attr($index); ?>][url]" value="<?php echo esc_attr($url); ?>" placeholder="https://">
                </div>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Save prospect carousel meta box data
 */
function afct_save_prospect_slides_meta_box($post_id) {
    // Check if our nonce is set
    if (!isset($_POST['afct_prospect_slides_meta_box_nonce'])) {
        return;
    }

    // Verify that the nonce is valid
    if (!wp_verify_nonce($_POST['afct_prospect_slides_meta_box_nonce'], 'afct_prospect_slides_meta_box')) {
        return;
    }

    // If this is an autosave, our form has not been submitted, so we don't want to do anything
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Check the user's permissions
    if (isset($_POST['post_type']) && 'page' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return;
        }
    } else {
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
    }

    // Check if the template is prospect template
    $template = get_post_meta($post_id, '_wp_page_template', true);
    if ($template !== 'template-prospect.php') {
        return;
    }

    // Sanitize and save the carousel slides
    if (isset($_POST['prospect_slides']) && is_array($_POST['prospect_slides'])) {
        $slides = array();
        
        foreach ($_POST['prospect_slides'] as $slide) {
            $slides[] = array(
                'image_id' => isset($slide['image_id']) ? absint($slide['image_id']) : 0,
                'label' => isset($slide['label']) ? sanitize_text_field($slide['label']) : '',
                'url' => isset($slide['url']) ? esc_url_raw($slide['url']) : '',
            );
        }
        
        update_post_meta($post_id, '_afct_prospect_slides', $slides);
    } else {
        // If no slides, delete the meta
        delete_post_meta($post_id, '_afct_prospect_slides');
    }
}
add_action('save_post', 'afct_save_prospect_slides_meta_box');

// Script enqueuing is now handled in the main afct_enqueue_admin_scripts function in functions.php

/**
 * Only show the prospect carousel meta box on the prospect template
 */
function afct_show_prospect_slides_meta_box() {
    global $post;
    if (!$post) return;
    
    $template = get_post_meta($post->ID, '_wp_page_template', true);
    
    // If not using the prospect template, remove the meta box
    if ($template !== 'template-prospect.php') {
        remove_meta_box('prospect_slides_meta_box', 'page', 'normal');
    }
}
add_action('do_meta_boxes', 'afct_show_prospect_slides_meta_box');

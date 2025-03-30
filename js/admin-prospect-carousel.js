jQuery(document).ready(function($) {
    // Make carousel slides sortable
    $('.prospect-slides').sortable({
        handle: '.sort-handle',
        update: function() {
            reindexSlides();
        }
    });
    
    // Add new carousel slide
    $('.add-slide').on('click', function() {
        const index = $('.prospect-slide').length;
        const template = wp.template('prospect-slide');
        $('.prospect-slides').append(template({ index: index }));
    });
    
    // Remove carousel slide
    $(document).on('click', '.remove-slide', function() {
        $(this).closest('.prospect-slide').remove();
        reindexSlides();
    });
    
    // Image selection
    $(document).on('click', '.prospect-slide-image-preview', function() {
        const $preview = $(this);
        const $input = $preview.find('input');
        
        // Create media frame
        const frame = wp.media({
            title: 'Select or Upload Carousel Image',
            button: {
                text: 'Use this image'
            },
            multiple: false
        });
        
        // When an image is selected in the media frame
        frame.on('select', function() {
            const attachment = frame.state().get('selection').first().toJSON();
            
            // Set the image ID in the hidden input
            $input.val(attachment.id);
            
            // Update the preview
            if (attachment.sizes && attachment.sizes.medium) {
                $preview.html('<img src="' + attachment.sizes.medium.url + '" alt="Slide image">');
            } else {
                $preview.html('<img src="' + attachment.url + '" alt="Slide image">');
            }
        });
        
        // Open the media frame
        frame.open();
    });
    
    // Reindex slides to ensure correct form field names
    function reindexSlides() {
        $('.prospect-slide').each(function(index) {
            const $slide = $(this);
            $slide.attr('data-index', index);
            $slide.find('.prospect-slide-title').text('Slide ' + (index + 1));
            
            // Update image preview index
            const $preview = $slide.find('.prospect-slide-image-preview');
            $preview.attr('data-index', index);
            
            // Update input names
            $slide.find('input').each(function() {
                const name = $(this).attr('name');
                const newName = name.replace(/prospect_slides\[\d+\]/, 'prospect_slides[' + index + ']');
                $(this).attr('name', newName);
            });
            
            // Update input IDs
            $slide.find('input[id^="prospect_slide_"]').each(function() {
                const id = $(this).attr('id');
                const newId = id.replace(/_\d+$/, '_' + index);
                $(this).attr('id', newId);
            });
            
            // Update label for attributes
            $slide.find('label').each(function() {
                const forAttr = $(this).attr('for');
                if (forAttr) {
                    const newForAttr = forAttr.replace(/_\d+$/, '_' + index);
                    $(this).attr('for', newForAttr);
                }
            });
        });
    }
    
    // Add at least one slide if none exist
    if ($('.prospect-slide').length === 0) {
        $('.add-slide').click();
    }
});

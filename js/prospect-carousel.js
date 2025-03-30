/**
 * Prospect Page Carousel Functionality
 */
jQuery(document).ready(function($) {
    const $carousel = $('#prospect-carousel');
    if (!$carousel.length) {
        return; // Exit if carousel container not found
    }

    const $slidesContainer = $carousel.find('.prospect-slides');
    const $slides = $slidesContainer.find('.prospect-slide-item');
    const $prevButton = $carousel.find('.carousel-arrow.prev');
    const $nextButton = $carousel.find('.carousel-arrow.next');
    const totalSlides = $slides.length;
    let currentIndex = 0;

    if (totalSlides <= 1) {
        $prevButton.hide();
        $nextButton.hide();
        return; // No need for controls if 0 or 1 slide
    }

    // Initialize the carousel with prev/current/next slides
    initializeCarousel();

    // Function to initialize the carousel
    function initializeCarousel() {
        if (totalSlides > 1) {
            // Start with the first slide active
            updateSlideClasses(0);
        } else {
            // Just one slide, make it active
            $slides.eq(0).addClass('active').css('opacity', 1);
        }
        
        // Initialize button states
        updateButtonStates();
    }

    // Function to update slide classes based on current index
    function updateSlideClasses(index) {
        // Store the previous index before updating
        const prevIndex = currentIndex;
        
        // Remove all classes first
        $slides.removeClass('active prev-slide next-slide');
        
        // Add active class to current slide
        $slides.eq(index).addClass('active');
        
        // Add prev-slide class only if not the first slide
        if (index > 0) {
            $slides.eq(index - 1).addClass('prev-slide');
        }
        
        // Add next-slide class only if not the last slide
        if (index < totalSlides - 1) {
            $slides.eq(index + 1).addClass('next-slide');
        }
        
        // Update current index
        currentIndex = index;
        
        // Update button states
        updateButtonStates();
    }
    
    // Function to update button states
    function updateButtonStates() {
        // Disable prev button if at first slide
        $prevButton.prop('disabled', currentIndex === 0);
        $prevButton.toggleClass('disabled', currentIndex === 0);
        
        // Disable next button if at last slide
        $nextButton.prop('disabled', currentIndex === totalSlides - 1);
        $nextButton.toggleClass('disabled', currentIndex === totalSlides - 1);
    }

    // Function to show a specific slide
    function showSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        // Update slide classes
        updateSlideClasses(index);
    }

    // Event listener for the next button
    $nextButton.on('click', function() {
        if (currentIndex < totalSlides - 1) {
            showSlide(currentIndex + 1);
        }
    });

    // Event listener for the previous button
    $prevButton.on('click', function() {
        if (currentIndex > 0) {
            showSlide(currentIndex - 1);
        }
    });

    // Optional: Add keyboard navigation
    $(document).on('keydown', function(e) {
        if (!$carousel.is(':visible')) return;
        
        if (e.keyCode === 37) { // Left arrow
            $prevButton.trigger('click');
        } else if (e.keyCode === 39) { // Right arrow
            $nextButton.trigger('click');
        }
    });

    // Optional: Add swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    $carousel.on('touchstart', function(e) {
        touchStartX = e.originalEvent.touches[0].clientX;
    });
    
    $carousel.on('touchend', function(e) {
        touchEndX = e.originalEvent.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left, go to next slide
            $nextButton.trigger('click');
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right, go to previous slide
            $prevButton.trigger('click');
        }
    }
});

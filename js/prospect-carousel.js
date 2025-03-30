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
        if (totalSlides > 2) {
            // If we have 3+ slides, set up prev/current/next
            updateSlideClasses(0);
        } else if (totalSlides === 2) {
            // If we have only 2 slides, show current and next
            $slides.eq(0).addClass('active').css('opacity', 1);
            $slides.eq(1).addClass('next-slide').css('opacity', 0.5);
        } else {
            // Just one slide, make it active
            $slides.eq(0).addClass('active').css('opacity', 1);
        }
    }

    // Function to update slide classes based on current index
    function updateSlideClasses(index) {
        // Remove all classes first
        $slides.removeClass('active prev-slide next-slide');
        
        // Calculate previous and next indices with wrapping
        const prevIndex = (index - 1 + totalSlides) % totalSlides;
        const nextIndex = (index + 1) % totalSlides;
        
        // Add appropriate classes
        $slides.eq(prevIndex).addClass('prev-slide');
        $slides.eq(index).addClass('active');
        $slides.eq(nextIndex).addClass('next-slide');
        
        // Update current index
        currentIndex = index;
    }

    // Function to show a specific slide
    function showSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        // Update slide classes
        updateSlideClasses(index);
    }

    // Event listener for the next button
    $nextButton.on('click', function() {
        const nextIndex = (currentIndex + 1) % totalSlides;
        showSlide(nextIndex);
    });

    // Event listener for the previous button
    $prevButton.on('click', function() {
        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(prevIndex);
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

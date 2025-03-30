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

    // Function to show a specific slide
    function showSlide(index) {
        $slides.removeClass('active').css('opacity', 0);
        $slides.eq(index).addClass('active').css('opacity', 1);

        // Update button states (optional, if you want to disable at ends)
        // $prevButton.prop('disabled', index === 0);
        // $nextButton.prop('disabled', index === totalSlides - 1);
    }

    // Event listener for the next button
    $nextButton.on('click', function() {
        currentIndex = (currentIndex + 1) % totalSlides; // Wrap around
        showSlide(currentIndex);
    });

    // Event listener for the previous button
    $prevButton.on('click', function() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // Wrap around
        showSlide(currentIndex);
    });

    // Initialize the carousel
    showSlide(currentIndex);

});

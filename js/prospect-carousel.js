/**
 * Prospect Page Carousel Functionality
 * Enhanced with GSAP for smoother animations
 */
jQuery(document).ready(function($) {
    // Register ScrollTrigger plugin if needed for future enhancements
    gsap.registerPlugin(ScrollTrigger);

    const $carousel = $('#prospect-carousel');
    if (!$carousel.length) return;

    const $slidesContainer = $carousel.find('.prospect-slides');
    const $slides = $slidesContainer.find('.prospect-slide-item');
    const $prevButton = $carousel.find('.carousel-arrow.prev');
    const $nextButton = $carousel.find('.carousel-arrow.next');
    const totalSlides = $slides.length;
    let currentIndex = 0;
    let isAnimating = false;

    // Exit if no slides or only one slide
    if (totalSlides <= 1) {
        $prevButton.hide();
        $nextButton.hide();
        return;
    }

    // Set initial positions and states
    function initializeCarousel() {
        // Set initial positions
        gsap.set($slides, {
            autoAlpha: 0,
            x: '100%'
        });
        
        // Set first slide as active
        gsap.set($slides.eq(0), {
            autoAlpha: 1,
            x: '0%'
        });

        if (totalSlides > 1) {
            // Position next slide
            gsap.set($slides.eq(1), {
                autoAlpha: 0.5,
                x: '100%'
            });
        }

        updateButtonStates();
    }

    // Animate to specific slide
    function animateToSlide(index) {
        if (isAnimating || index === currentIndex || index < 0 || index >= totalSlides) return;

        isAnimating = true;
        const direction = index > currentIndex ? 1 : -1;
        const currentSlide = $slides.eq(currentIndex);
        const targetSlide = $slides.eq(index);
        const duration = 0.75;

        // Timeline for smooth transitions
        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
                currentIndex = index;
                updateButtonStates();
            }
        });

        // Animate current slide out
        tl.to(currentSlide, {
            x: -100 * direction + '%',
            autoAlpha: 0,
            duration: duration,
            ease: 'power2.inOut'
        });

        // Animate new slide in
        tl.fromTo(targetSlide,
            {
                x: 100 * direction + '%',
                autoAlpha: 0
            },
            {
                x: '0%',
                autoAlpha: 1,
                duration: duration,
                ease: 'power2.inOut'
            },
            '-=' + duration // Start at same time as previous animation
        );

        // Animate next slide preview (if exists)
        if (index + 1 < totalSlides) {
            tl.fromTo($slides.eq(index + 1),
                {
                    x: 150 * direction + '%',
                    autoAlpha: 0
                },
                {
                    x: '100%',
                    autoAlpha: 0.5,
                    duration: duration,
                    ease: 'power2.inOut'
                },
                '-=' + duration
            );
        }
    }

    // Update button states
    function updateButtonStates() {
        gsap.to($prevButton, {
            autoAlpha: currentIndex === 0 ? 0.5 : 1,
            duration: 0.3
        });
        $prevButton.prop('disabled', currentIndex === 0);

        gsap.to($nextButton, {
            autoAlpha: currentIndex === totalSlides - 1 ? 0.5 : 1,
            duration: 0.3
        });
        $nextButton.prop('disabled', currentIndex === totalSlides - 1);
    }

    // Event Handlers
    $nextButton.on('click', function() {
        if (!isAnimating && currentIndex < totalSlides - 1) {
            animateToSlide(currentIndex + 1);
        }
    });

    $prevButton.on('click', function() {
        if (!isAnimating && currentIndex > 0) {
            animateToSlide(currentIndex - 1);
        }
    });

    // Keyboard Navigation
    $(document).on('keydown', function(e) {
        if (!$carousel.is(':visible')) return;
        
        if (e.keyCode === 37) { // Left arrow
            $prevButton.trigger('click');
        } else if (e.keyCode === 39) { // Right arrow
            $nextButton.trigger('click');
        }
    });

    // Touch Support
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
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance < 0 && currentIndex < totalSlides - 1) {
                // Swipe left, go to next slide
                animateToSlide(currentIndex + 1);
            } else if (swipeDistance > 0 && currentIndex > 0) {
                // Swipe right, go to previous slide
                animateToSlide(currentIndex - 1);
            }
        }
    }

    // Initialize the carousel
    initializeCarousel();
});

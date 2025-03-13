/**
 * Headline Positioning System
 * 
 * This script handles the dynamic positioning of section headlines based on scroll position.
 * When a section taller than the viewport is in view, it switches the headline divs from
 * relative to fixed positioning, and reverts them when section boundaries are reached.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all slide sections
    const slides = document.querySelectorAll('.slide');
    
    // Create a map to store the original positions of headlines
    const originalPositions = new Map();
    
    // Track last scroll position to determine direction
    let lastScrollY = window.scrollY;
    
    // Debounce timer for scroll events
    let scrollDebounceTimer = null;
    const SCROLL_DEBOUNCE_DELAY = 10; // ms
    
    // Store original positions of all headlines
    slides.forEach(slide => {
        const upperLeft = slide.querySelector('.text-upper-left');
        const lowerRight = slide.querySelector('.text-lower-right');
        
        if (upperLeft && lowerRight) {
            originalPositions.set(upperLeft, {
                position: 'absolute',
                top: window.getComputedStyle(upperLeft).top,
                left: window.getComputedStyle(upperLeft).left
            });
            
            originalPositions.set(lowerRight, {
                position: 'absolute',
                bottom: window.getComputedStyle(lowerRight).bottom,
                right: window.getComputedStyle(lowerRight).right
            });
        }
    });
    
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= 0 &&
            rect.bottom >= 0
        );
    }
    
    // Function to check if we're near the top boundary of an element
    function isNearTopBoundary(element) {
        const rect = element.getBoundingClientRect();
        // Increased buffer zone for smoother transitions
        return rect.top > -150 && rect.top < 0;
    }
    
    // Function to check if we're near the bottom boundary of an element
    function isNearBottomBoundary(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // More precise detection with larger buffer
        return rect.bottom <= viewportHeight + 50;
    }
    
    // Apply fade-out effect before position change
    function applyFadeOut(element) {
        element.classList.add('fade-out');
        element.classList.remove('fade-in');
    }
    
    // Apply fade-in effect after position change
    function applyFadeIn(element) {
        element.classList.add('fade-in');
        element.classList.remove('fade-out');
    }
    
    // Main scroll handler function
    function handleScroll() {
        // Determine scroll direction
        const scrollDirection = window.scrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = window.scrollY;
        
        slides.forEach(slide => {
            const upperLeft = slide.querySelector('.text-upper-left');
            const lowerRight = slide.querySelector('.text-lower-right');
            
            if (!upperLeft || !lowerRight) return;
            
            if (isInViewport(slide)) {
                // If slide is taller than viewport and we're not at boundaries
                if (slide.offsetHeight > window.innerHeight) {
                    if (!isNearTopBoundary(slide) && !isNearBottomBoundary(slide)) {
                        // Switch to fixed positioning
                        if (upperLeft.style.position !== 'fixed') {
                            applyFadeOut(upperLeft);
                            applyFadeOut(lowerRight);
                            
                            setTimeout(() => {
                                upperLeft.style.position = 'fixed';
                                upperLeft.style.top = '20px';
                                upperLeft.style.left = '20px';
                                
                                lowerRight.style.position = 'fixed';
                                lowerRight.style.bottom = '20px';
                                lowerRight.style.right = '20px';
                                
                                applyFadeIn(upperLeft);
                                applyFadeIn(lowerRight);
                            }, 200);
                        }
                    } else {
                        // Revert to absolute positioning at boundaries
                        if (upperLeft.style.position !== 'absolute') {
                            applyFadeOut(upperLeft);
                            applyFadeOut(lowerRight);
                            
                            setTimeout(() => {
                                const originalUpperLeft = originalPositions.get(upperLeft);
                                const originalLowerRight = originalPositions.get(lowerRight);
                                
                                upperLeft.style.position = originalUpperLeft.position;
                                upperLeft.style.top = originalUpperLeft.top;
                                upperLeft.style.left = originalUpperLeft.left;
                                
                                lowerRight.style.position = originalLowerRight.position;
                                lowerRight.style.bottom = originalLowerRight.bottom;
                                lowerRight.style.right = originalLowerRight.right;
                                
                                applyFadeIn(upperLeft);
                                applyFadeIn(lowerRight);
                            }, 200);
                        }
                    }
                }
            } else {
                // If slide is not in viewport, ensure absolute positioning
                if (upperLeft.style.position !== 'absolute') {
                    const originalUpperLeft = originalPositions.get(upperLeft);
                    const originalLowerRight = originalPositions.get(lowerRight);
                    
                    upperLeft.style.position = originalUpperLeft.position;
                    upperLeft.style.top = originalUpperLeft.top;
                    upperLeft.style.left = originalUpperLeft.left;
                    
                    lowerRight.style.position = originalLowerRight.position;
                    lowerRight.style.bottom = originalLowerRight.bottom;
                    lowerRight.style.right = originalLowerRight.right;
                }
            }
        });
    }
    
    // Add scroll event listener with debounce
    window.addEventListener('scroll', function() {
        if (scrollDebounceTimer) {
            clearTimeout(scrollDebounceTimer);
        }
        
        scrollDebounceTimer = setTimeout(handleScroll, SCROLL_DEBOUNCE_DELAY);
    });
    
    // Add resize event listener to update positions
    window.addEventListener('resize', function() {
        // Reset all positions to absolute to recalculate
        slides.forEach(slide => {
            const upperLeft = slide.querySelector('.text-upper-left');
            const lowerRight = slide.querySelector('.text-lower-right');
            
            if (upperLeft && lowerRight) {
                // Reset to absolute positioning temporarily to get correct values
                upperLeft.style.position = 'absolute';
                lowerRight.style.position = 'absolute';
                
                // Update stored values
                originalPositions.set(upperLeft, {
                    position: 'absolute',
                    top: window.getComputedStyle(upperLeft).top,
                    left: window.getComputedStyle(upperLeft).left
                });
                
                originalPositions.set(lowerRight, {
                    position: 'absolute',
                    bottom: window.getComputedStyle(lowerRight).bottom,
                    right: window.getComputedStyle(lowerRight).right
                });
            }
        });
        
        // Re-run scroll handler
        handleScroll();
    });
    
    // Initial run
    handleScroll();
});
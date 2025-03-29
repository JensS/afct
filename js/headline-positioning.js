/**
 * Headline Positioning System
 * 
 * This script handles the dynamic positioning of section headlines based on scroll position.
 * When a section taller than the viewport is in view, it switches the headline divs from
 * relative to fixed positioning, and reverts them when section boundaries are reached.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all slide sections
    const slides = document.querySelectorAll('section');
    
    // Create a map to store the original positions of headlines
    const originalPositions = new Map();
    
    // Track last scroll position to determine direction
    let lastScrollY = window.scrollY;
    
    // Debounce timer for scroll events
    let scrollDebounceTimer = null;
    const SCROLL_DEBOUNCE_DELAY = 10; // ms
    
});
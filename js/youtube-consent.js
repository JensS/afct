/**
 * YouTube Privacy Consent
 * Handles privacy-friendly loading of YouTube embeds
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for YouTube placeholders
    const youtubePlaceholders = document.querySelectorAll('.youtube-placeholder');
    
    // If no placeholders found, exit early
    if (!youtubePlaceholders.length) return;
    
    // Function to load YouTube iframe
    function loadYouTubeContent(placeholder) {
        const videoId = placeholder.getAttribute('data-video-id');
        if (!videoId) return;
        
        const embedUrl = 'https://www.youtube.com/embed/' + videoId + '?autoplay=0';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.aspectRatio = '16/9';
        iframe.style.border = '0';
        iframe.src = embedUrl;
        iframe.allowFullscreen = true;
        
        // Replace placeholder with iframe
        const parent = placeholder.parentNode;
        parent.replaceChild(iframe, placeholder);
    }
    
    // Function to enable all YouTube embeds
    function enableAllYouTubeEmbeds() {
        youtubePlaceholders.forEach(placeholder => {
            loadYouTubeContent(placeholder);
        });
        
        // Save consent in localStorage
        localStorage.setItem('youtubeConsent', 'true');
    }
    
    // Check if user has already given consent
    if (localStorage.getItem('youtubeConsent') === 'true') {
        enableAllYouTubeEmbeds();
    } else {
        // Add click event to all placeholders
        youtubePlaceholders.forEach(placeholder => {
            const consentButton = placeholder.querySelector('.youtube-consent-button');
            if (consentButton) {
                consentButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    enableAllYouTubeEmbeds();
                });
            }
        });
    }
    
    // Connect with cookie consent system
    const cookieConsentButton = document.querySelector('#accept-cookies');
    if (cookieConsentButton) {
        cookieConsentButton.addEventListener('click', function() {
            // When cookies are accepted, also enable YouTube
            enableAllYouTubeEmbeds();
        });
    }
});
/**
 * Load YouTube embeds only after the visitor has granted video consent.
 */

document.addEventListener('DOMContentLoaded', function () {
    const youtubePlaceholders = document.querySelectorAll('.youtube-placeholder');

    if (youtubePlaceholders.length === 0) {
        return;
    }

    function loadYouTubeContent(placeholder) {
        const videoId = placeholder.dataset.videoId;

        if (!videoId || !placeholder.isConnected || !placeholder.parentNode) {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=0`;
        iframe.title = 'African Face, Colonial Tongue film';
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        placeholder.parentNode.replaceChild(iframe, placeholder);
    }

    function enableAllYouTubeEmbeds() {
        youtubePlaceholders.forEach(loadYouTubeContent);
        try {
            localStorage.setItem('youtubeConsent', 'true');
        } catch {
            // Explicit consent still works when storage is unavailable.
        }
    }

    let hasConsent = false;
    try {
        hasConsent = localStorage.getItem('youtubeConsent') === 'true';
    } catch {
        // Ask for consent again when it cannot be remembered.
    }
    if (hasConsent) {
        enableAllYouTubeEmbeds();
        return;
    }

    youtubePlaceholders.forEach(placeholder => {
        const consentButton = placeholder.querySelector('.youtube-consent-button');

        consentButton?.addEventListener('click', event => {
            event.preventDefault();
            enableAllYouTubeEmbeds();
        });
    });
});

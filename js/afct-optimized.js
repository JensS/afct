// GSAP and ScrollTrigger are loaded globally via WordPress enqueue
// No imports needed as they're available on window object
// initHistoryTimeline and initProspectCarousel functions are available globally

window.locomotiveScroll = null;

jQuery(document).ready(function($) {
"use strict";

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2,
        speed: 3,
        effects: true,
    });

    const historySection = document.getElementById('the-history');

    if (historySection) {
        initHistoryTimeline($);
    }

    initProspectCarousel($);
    
    // Initialize Serati image scaling effect
    const seratiImage = document.getElementById('serati-image');
    if (seratiImage) {
        ScrollTrigger.create({
            trigger: "#about-serati",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
                const scale = 1 - (self.progress * 0.7);
                gsap.set(seratiImage, { scale: Math.max(scale, 0.3) });
            }
        });
    }

    ScrollTrigger.refresh();

    if (localStorage.getItem('cookiesAccepted')) {
        initYoutubeEmbed($);
    }

    // Optimized theme toggle with batched DOM operations
    const themeToggleBtn = $('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
   
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        requestAnimationFrame(() => {
            document.body.classList.add(savedTheme + '-theme');
            updateToggleButton(savedTheme === 'dark');
        });
    } else {
        const isDark = prefersDarkScheme.matches;
        requestAnimationFrame(() => {
            document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
            updateToggleButton(isDark);
        });
    }
    
    themeToggleBtn.on('click', function() {
        const isDark = document.body.classList.contains('dark-theme');
        requestAnimationFrame(() => {
            document.body.classList.remove(isDark ? 'dark-theme' : 'light-theme');
            document.body.classList.add(isDark ? 'light-theme' : 'dark-theme');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
            updateToggleButton(!isDark);
        });
    });
    
    function updateToggleButton(isDark) {
        themeToggleBtn.find('.theme-toggle-text').text(isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            requestAnimationFrame(() => {
                document.body.classList.remove(isDark ? 'light-theme' : 'dark-theme');
                document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
                updateToggleButton(isDark);
            });
        }
    });

    // Optimized intersection observer
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const observerCallback = (entries) => {
        // Batch DOM updates
        requestAnimationFrame(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    $('.nav-link').removeClass('active');
                    $(`.nav-link[data-target="#${id}"]`).addClass('active');
                }
            });
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => {
        observer.observe(section);
    });

    $('.scroll-link, .nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        if (target) {
            const targetElement = document.querySelector(target);
            if (targetElement) {
                smoother.scrollTo(target, {smooth: true});
                requestAnimationFrame(() => {
                    $('.sidebar').removeClass('shown');
                    $('.sidebar_toggler').removeClass('active');
                });
            }
        }
    });

    // Optimized cookie consent
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = cookieConsent?.querySelector('.button-primary');
    if (cookieConsent && acceptButton) {
        const isAccepted = localStorage.getItem('cookiesAccepted');
        requestAnimationFrame(() => {
            cookieConsent.style.display = isAccepted ? 'none' : 'block';
        });
        
        acceptButton.addEventListener('click', function() {
            requestAnimationFrame(() => {
                cookieConsent.style.display = 'none';
            });
            localStorage.setItem('cookiesAccepted', 'true');
            initYoutubeEmbed($);
        });
    }

    // Optimized audio player with reduced forced reflows
    const audioPlayers = document.querySelectorAll('.custom-audio-player');
    audioPlayers.forEach(player => {
        const audio = player.querySelector('audio');
        const playPauseBtn = player.querySelector('.play-pause');
        const playIcon = player.querySelector('.play-icon');
        const pauseIcon = player.querySelector('.pause-icon');
        const progress = player.querySelector('.progress');
        const currentTime = player.querySelector('.time.current');
        const duration = player.querySelector('.time.duration');
        const progressBar = player.querySelector('.progress-bar');
        const chapterLinks = document.querySelectorAll('.podcast-chapters a[data-time]');

        if (audio && playPauseBtn && progress && currentTime && duration && progressBar) {
            let isPlaying = false;
            let progressBarRect = null;
            
            // Cache progressBar rect on resize
            const updateProgressBarRect = () => {
                progressBarRect = progressBar.getBoundingClientRect();
            };
            updateProgressBarRect();
            window.addEventListener('resize', updateProgressBarRect);

            playPauseBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    isPlaying = true;
                } else {
                    audio.pause();
                    isPlaying = false;
                }
                
                // Batch icon updates
                requestAnimationFrame(() => {
                    if (isPlaying) {
                        playIcon.style.display = 'none';
                        pauseIcon.style.display = 'flex';
                    } else {
                        playIcon.style.display = 'flex';
                        pauseIcon.style.display = 'none';
                    }
                });
            });

            // Throttled timeupdate to reduce forced reflows
            let lastUpdate = 0;
            audio.addEventListener('timeupdate', () => {
                const now = performance.now();
                if (now - lastUpdate < 100) return; // Throttle to 10fps
                lastUpdate = now;
                
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    
                    requestAnimationFrame(() => {
                        progress.style.width = percent + '%';
                        currentTime.textContent = formatTime(audio.currentTime);
                        
                        if (duration.textContent === '0:00') {
                            duration.textContent = formatTime(audio.duration);
                        }
                    });
                }
            });

            const updateDuration = () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    requestAnimationFrame(() => {
                        duration.textContent = formatTime(audio.duration);
                    });
                }
            };

            audio.addEventListener('loadedmetadata', updateDuration);
            audio.addEventListener('durationchange', updateDuration);
            audio.addEventListener('canplaythrough', () => {
                updateDuration();
                positionChapterMarkers(player, audio.duration);
            });

            progressBar.addEventListener('click', (e) => {
                if (!progressBarRect) updateProgressBarRect();
                const percent = (e.clientX - progressBarRect.left) / progressBarRect.width;
                audio.currentTime = percent * audio.duration;
            });
            
            chapterLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const timeStr = link.getAttribute('data-time');
                    if (timeStr) {
                        const parts = timeStr.split(':');
                        const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                        audio.currentTime = seconds;
                        if (audio.paused) {
                            audio.play();
                            requestAnimationFrame(() => {
                                playIcon.style.display = 'none';
                                pauseIcon.style.display = 'flex';
                            });
                        }
                    }
                });
            });
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function positionChapterMarkers(player, audioDuration) {
        const chapterMarkers = player.querySelectorAll('.chapter-mark');
        
        // Batch all marker positioning
        requestAnimationFrame(() => {
            chapterMarkers.forEach(marker => {
                const chapterTime = parseFloat(marker.getAttribute('data-time'));
                if (chapterTime && audioDuration > 0) {
                    const percentage = (chapterTime / audioDuration) * 100;
                    marker.style.left = percentage + '%';
                }
            });
        });
    }
});

// YouTube embed functionality
window.player;
let video_id = null;

window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API is ready');
    window.player = new YT.Player('youtube-placeholder', {
        height: '390',
        width: '640',
        videoId: video_id,
        playerVars: {
          'playsinline': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

function initYoutubeEmbed($) {
    let youtubePlaceholders = $('.youtube-placeholder');

    if (!youtubePlaceholders.length) 
        return;

    video_id = youtubePlaceholders[0].dataset.videoId;
}

function initHeaders() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const upperLeft = section.querySelector('.slide .text-upper-left');
        const lowerRight = section.querySelector('.slide .text-lower-right');

        if (upperLeft) {
            ScrollTrigger.create({
                trigger: section,      
                start: 'top top',       
                end:  'bottom 50%',
                pin: upperLeft,     
                pinSpacing: true,
                refreshPriority: -1
            });
        }
        
        if (lowerRight) {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
	            end: 'bottom bottom',
                pin: lowerRight,
                pinSpacing: true
            });
        }
    });
}
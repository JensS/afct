import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import initHistoryTimeline from './history-timeline';
import initProspectCarousel from './prospect-carousel';

window.locomotiveScroll = null;

jQuery(document).ready(function($) {
"use strict";

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Enable normalizeScroll for better snap behavior
    ScrollTrigger.normalizeScroll(true);

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2,
        speed: 3,
        effects: true,
        normalizeScroll: true,
    });

    // Section snap using GSAP's native snap functionality
    const snapSections = gsap.utils.toArray('section');

    if (snapSections.length > 0) {
        // Calculate section positions as normalized progress values (0-1)
        const getSnapPositions = () => {
            const maxScroll = ScrollTrigger.maxScroll(window);
            return snapSections.map(section => section.offsetTop / maxScroll);
        };

        ScrollTrigger.create({
            snap: {
                snapTo: (progress) => {
                    const positions = getSnapPositions();
                    return gsap.utils.snap(positions, progress);
                },
                duration: { min: 0.3, max: 0.6 },
                delay: 0.02,
                ease: "power1.inOut"
            }
        });
    }

    

    const historySection = document.getElementById('the-history');

    if (historySection) {
        //locomotiveScroll.on('scroll', ({ animatedScroll, targetScroll, currentScroll, velocity, progress }) => {
        // Initialize history timeline only if history section exists
        initHistoryTimeline($);
    }

    initProspectCarousel($);
    //initHeaders();
    
    // Initialize Serati image scaling effect
    const seratiImage = document.getElementById('serati-image');
    if (seratiImage) {
        ScrollTrigger.create({
            trigger: "#about-serati",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
                // Scale from 1 to 0.3 as user scrolls through the section
                const scale = 1 - (self.progress * 0.7);
                gsap.set(seratiImage, { scale: Math.max(scale, 0.3) });
            }
        });
    }

    // Refresh ScrollTrigger after all initialization
    ScrollTrigger.refresh();

    // Only initialize YouTube embeds if cookie consent is already given
    if (localStorage.getItem('cookiesAccepted')) {
        initYoutubeEmbed($);
    }

    const themeToggleBtn = $('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Update podcast embed theme to match site theme
    function updatePodcastEmbed(isDark) {
        const podcastEmbed = document.getElementById('podcast-embed');
        if (podcastEmbed && podcastEmbed.dataset.embedBase) {
            const theme = isDark ? 'dark' : 'light';
            podcastEmbed.src = podcastEmbed.dataset.embedBase + theme;
        }
    }

    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme + '-theme');
        updateToggleButton(savedTheme === 'dark');
        updatePodcastEmbed(savedTheme === 'dark');
    } else {
        const isDark = prefersDarkScheme.matches;
        document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
        updateToggleButton(isDark);
        updatePodcastEmbed(isDark);
    }

    // Theme toggle click handler
    themeToggleBtn.on('click', function() {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.classList.remove(isDark ? 'dark-theme' : 'light-theme');
        document.body.classList.add(isDark ? 'light-theme' : 'dark-theme');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateToggleButton(!isDark);
        updatePodcastEmbed(!isDark);
    });

    function updateToggleButton(isDark) {
        themeToggleBtn.find('.theme-toggle-text').text(isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    // System theme change handler
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            document.body.classList.remove(isDark ? 'light-theme' : 'dark-theme');
            document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
            updateToggleButton(isDark);
            updatePodcastEmbed(isDark);
        }
    });

    const sections = document.querySelectorAll('section');
    
    // Create an Intersection Observer instance
    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                $('.nav-link').removeClass('active');
                $(`.nav-link[data-target="#${id}"]`).addClass('active');
            }
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
                $('.sidebar').removeClass('shown');
                $('.sidebar_toggler').removeClass('active');
            }
        }
    });

    // Cookie consent functionality
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = cookieConsent?.querySelector('.button-primary');
    if (cookieConsent && acceptButton) {
        if (localStorage.getItem('cookiesAccepted')) {
            cookieConsent.style.display = 'none';
        } else {
            cookieConsent.style.display = 'block';
        }
        
        acceptButton.addEventListener('click', function() {
            cookieConsent.style.display = 'none';
            localStorage.setItem('cookiesAccepted', 'true');
            // Initialize YouTube embeds after cookie consent is given
            initYoutubeEmbed($);
        });
    }

    // Custom audio player functionality
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
            playPauseBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'flex';
                } else {
                    audio.pause();
                    playIcon.style.display = 'flex';
                    pauseIcon.style.display = 'none';
                }
            });

            audio.addEventListener('timeupdate', () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    progress.style.width = percent + '%';
                    currentTime.textContent = formatTime(audio.currentTime);
                    
                    // Update duration if not already set
                    if (duration.textContent === '0:00') {
                        duration.textContent = formatTime(audio.duration);
                    }
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    duration.textContent = formatTime(audio.duration);
                }
            });

            audio.addEventListener('durationchange', () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    duration.textContent = formatTime(audio.duration);
                }
            });

            audio.addEventListener('canplaythrough', () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    duration.textContent = formatTime(audio.duration);
                    positionChapterMarkers(player, audio.duration);
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                    duration.textContent = formatTime(audio.duration);
                    positionChapterMarkers(player, audio.duration);
                }
            });

            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
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
                            playIcon.style.display = 'none';
                            pauseIcon.style.display = 'flex';
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
        
        chapterMarkers.forEach(marker => {
            const chapterTime = parseFloat(marker.getAttribute('data-time'));
            if (chapterTime && audioDuration > 0) {
                const percentage = (chapterTime / audioDuration) * 100;
                marker.style.left = percentage + '%';
            }
        });
    }
});
// Youtube embed functionality
window.player;
let video_id = null;

window.onYouTubeIframeAPIReady= function() {
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

// 4. The API will call this function when the video player is ready.
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

export  function initYoutubeEmbed($) {

    let youtubePlaceholders = $('.youtube-placeholder');

    if (!youtubePlaceholders.length) 
        return; // no youtube id given

    video_id = youtubePlaceholders[0].dataset.videoId;

}


export  function initHeaders() {
    const sections = document.querySelectorAll('section');
    
    // For each section, create ScrollTriggers for both elements
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
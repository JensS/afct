import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import initProspectCarousel from './prospect-carousel';
import initSectionHeadlines from './section-headlines';
// history-timeline is loaded dynamically (it pulls in D3 + topojson)

jQuery(document).ready(function($) {
"use strict";

    gsap.registerPlugin(ScrollTrigger);
    initSectionHeadlines();

    const historySection = document.getElementById('the-history');

    function loadHistoryTimeline() {
        // D3 + topojson are only loaded when the history section is present
        import(/* webpackChunkName: "history-timeline" */ './history-timeline')
            .then(({ default: initHistoryTimeline }) => {
                window.historyTimeline = initHistoryTimeline($);
                ScrollTrigger.refresh();
            })
            .catch(error => {
                console.error('Unable to initialize the history viewer.', error);
            });
    }

    if (historySection && 'IntersectionObserver' in window) {
        const historyObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                historyObserver.disconnect();
                loadHistoryTimeline();
            }
        }, { rootMargin: '600px' });
        historyObserver.observe(historySection);
    } else if (historySection) {
        loadHistoryTimeline();
    }

    initProspectCarousel($);
    
    // Serati portrait grows from its compact state nested in the headline
    // (Figma: 467px → 682px as the section scrolls into view)
    const seratiImage = document.getElementById('serati-image');
    if (seratiImage) {
        gsap.fromTo(seratiImage,
            { scale: 0.68, y: "-14%" },
            {
                scale: 1,
                y: "0%",
                ease: "none",
                scrollTrigger: {
                    trigger: "#about-serati",
                    start: "top 80%",
                    end: "top 15%",
                    scrub: 1
                }
            }
        );
    }

    // Refresh ScrollTrigger after all initialization
    ScrollTrigger.refresh();

    // v2 design is light-only
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    // The 7minus2 podcast embed always uses its light skin
    const podcastEmbed = document.getElementById('podcast-embed');
    if (podcastEmbed && podcastEmbed.dataset.embedBase) {
        const lightSrc = podcastEmbed.dataset.embedBase + 'light';
        if (podcastEmbed.src !== lightSrc) {
            podcastEmbed.src = lightSrc;
        }
    }

    // Film placeholder: first click reveals the YouTube consent card
    const filmPlaceholder = document.getElementById('youtube-placeholder');
    if (filmPlaceholder) {
        filmPlaceholder.addEventListener('click', function (e) {
            if (e.target.closest('.youtube-consent-button')) return;
            filmPlaceholder.classList.add('show-consent');
            filmPlaceholder.querySelector('.youtube-consent-button')?.focus();
        });
    }

    const sections = document.querySelectorAll('section');
    const siteNavigation = document.getElementById('site-navigation');
    const menuToggle = siteNavigation?.querySelector('.menu-toggle');

    function closeMobileNavigation() {
        siteNavigation?.classList.remove('menu-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    }

    if (siteNavigation && menuToggle) {
        menuToggle.addEventListener('click', event => {
            event.stopPropagation();

            const isOpen = siteNavigation.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', event => {
            if (!siteNavigation.contains(event.target)) {
                closeMobileNavigation();
            }
        });
    }
    
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
        const target = $(this).attr('href');
        if (target?.startsWith('#') && target.length > 1) {
            const targetElement = document.getElementById(target.slice(1));
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                $('.sidebar').removeClass('shown');
                $('.sidebar_toggler').removeClass('active');
                closeMobileNavigation();
            }
        }
    });

    // Cookie consent functionality
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = cookieConsent?.querySelector('.button-primary');
    if (cookieConsent && acceptButton) {
        let cookiesAccepted = false;
        try {
            cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
        } catch {
            // The page remains usable when browser storage is disabled.
        }
        if (cookiesAccepted) {
            cookieConsent.style.display = 'none';
        } else {
            cookieConsent.style.display = 'block';
        }
        
        acceptButton.addEventListener('click', function() {
            cookieConsent.style.display = 'none';
            try {
                localStorage.setItem('cookiesAccepted', 'true');
            } catch {
                // Consent applies to this page even when it cannot be saved.
            }
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

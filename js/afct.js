
let locoScroll;
let historyGsapAnimation;

jQuery(document).ready(function($) {
	"use strict";

    gsap.registerPlugin(ScrollTrigger);

    locoScroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true
    });
    locoScroll.on("scroll", ScrollTrigger.update);

    locoScroll.on('scroll', (args) => {
        if(typeof args.currentElements['history'] === 'object') {
            let progress = args.currentElements['history'].progress;
            //historyGsapAnimation.progress(progress);
        }
    });
    
    const themeToggleBtn = $('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
   
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme + '-theme');
        updateToggleButton(savedTheme === 'dark');
    } else {
        const isDark = prefersDarkScheme.matches;
        document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
        updateToggleButton(isDark);
    }
    
    // Theme toggle click handler
    themeToggleBtn.on('click', function() {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.classList.remove(isDark ? 'dark-theme' : 'light-theme');
        document.body.classList.add(isDark ? 'light-theme' : 'dark-theme');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateToggleButton(!isDark);
    });
    
    function updateToggleButton(isDark) {
        themeToggleBtn.find('.theme-toggle-text').text(isDark ? 'Switch to light theme' : 'Switch to dark theme' );
    }
    
    // System theme change handler
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            document.body.classList.remove(isDark ? 'light-theme' : 'dark-theme');
            document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
            updateToggleButton(isDark);
        }
    });

    const sections = document.querySelectorAll('section');
    
    // Create an Intersection Observer instance
    const observerOptions = {
        root: null, // Use viewport as the containing block
        threshold: 0.5 // Trigger when at least 50% of the section is in view
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                
                // Update active menu item
                $('.nav-link').removeClass('active');
                $(`.nav-link[data-target="#${id}"]`).addClass('active');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each section
    sections.forEach(section => {
        observer.observe(section);
    });


    // Menu hover effects - enhanced for smooth transitions
    const menuContainer = $('.menu');
    const menuItems = $('.menu-item');
    

    
    
    // Smooth scroll for anchor links using Locomotive Scroll
    $('.scroll-link, .nav-link').click(function(e) {
        e.preventDefault();
        
        const target = $(this).attr('href');
        if (target) {
            locoScroll.scrollTo(target);
            
            // Close sidebar if open
            $('.sidebar').removeClass('shown');
            $('.sidebar_toggler').removeClass('active');
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
   
    // Cookie consent functionality
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = cookieConsent?.querySelector('.button-primary');
    if (cookieConsent && acceptButton) {
        // Check localStorage first and set display accordingly
        if (localStorage.getItem('cookiesAccepted')) {
            cookieConsent.style.display = 'none';
        } else {
            cookieConsent.style.display = 'block';
        }
        
        acceptButton.addEventListener('click', function() {
            cookieConsent.style.display = 'none';
            localStorage.setItem('cookiesAccepted', 'true');
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
                    pauseIcon.style.display = 'inline';
                } else {
                    audio.pause();
                    playIcon.style.display = 'inline';
                    pauseIcon.style.display = 'none';
                }
            });

            audio.addEventListener('timeupdate', () => {
                const percent = (audio.currentTime / audio.duration) * 100;
                progress.style.width = percent + '%';
                currentTime.textContent = formatTime(audio.currentTime);
            });

            audio.addEventListener('loadedmetadata', () => {
                duration.textContent = formatTime(audio.duration);
            });

            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                audio.currentTime = percent * audio.duration;
            });
            
            // Chapter navigation
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
                            pauseIcon.style.display = 'inline';
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

});

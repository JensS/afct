import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import initHistoryTimeline from './history-timeline';
import initProspectCarousel from './prospect-carousel';

let locomotiveScroll = null;

jQuery(document).ready(function($) {
"use strict";

    gsap.registerPlugin(ScrollTrigger);


    locomotiveScroll = new LocomotiveScroll({
        lenisOptions: {
        lerp: 0.1,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        }
    });

    //locomotiveScroll.on('scroll', ScrollTrigger.update);

    const historySection = document.getElementById('the-history');

    if (historySection) {
        //locomotiveScroll.on('scroll', ({ animatedScroll, targetScroll, currentScroll, velocity, progress }) => {
      
        
        // Initialize history timeline only if history section exists
        initHistoryTimeline($);
    }

    initProspectCarousel($);

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
        themeToggleBtn.find('.theme-toggle-text').text(isDark ? 'Switch to light theme' : 'Switch to dark theme');
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

    // Menu hover effects
    const menuContainer = $('.menu');
    const menuItems = $('.menu-item');
    $('.scroll-link, .nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        if (target) {
            const targetElement = document.querySelector(target);
            if (targetElement) {
                locomotiveScroll.scrollTo(targetElement, {
                    offset: 0,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
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

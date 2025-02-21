jQuery(document).ready(function($) {
	"use strict";

    const themeToggleBtn = $('#theme-toggle-btn');
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
        themeToggleBtn.find('.theme-toggle-text').text(isDark ? 'Light Mode' : 'Dark Mode');
        themeToggleBtn.toggleClass('is-dark', isDark);
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
    
    // Update sidebar toggle functionality
    $('.sidebar_toggler').on('click', function(e) {
        e.preventDefault();
        $('.sidebar').toggleClass('shown');
        $(this).toggleClass('active');
    });

    // Close sidebar when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.sidebar_toggler').length && 
            !$(e.target).closest('.sidebar').length) {
            $('.sidebar').removeClass('shown');
            $('.sidebar_toggler').removeClass('active');
        }
    });

    $('.menu-item').on('mouseenter', function() {
        $(this).find('.nav-link').animate({opacity: 1}, 300);
    }).on('mouseleave', function() {
        $(this).find('.nav-link').animate({opacity: 0.8}, 200);
    });

    // Smooth scroll for anchor links
    $('.scroll-link').click(function(e) {
        e.preventDefault();
        
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1000);
            
            // Close sidebar if open
            $('.sidebar').removeClass('shown');
            $('.sidebar_toggler').removeClass('active');
        }
    });

});

window.addEventListener('scroll', () => {
    document.documentElement.style.setProperty('--scroll', window.scrollY + 'px');
    console.log(window.scrollY);
  });
  
document.addEventListener('DOMContentLoaded', function() {
   
    // Cookie consent functionality
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = cookieConsent?.querySelector('.button-primary');
    if (cookieConsent && acceptButton) {
        if (!localStorage.getItem('cookiesAccepted')) {
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
        const progress = player.querySelector('.progress');
        const currentTime = player.querySelector('.current-time');
        const duration = player.querySelector('.duration');
        const progressBar = player.querySelector('.progress-bar');

        if (audio && playPauseBtn && progress && currentTime && duration && progressBar) {
            playPauseBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    playPauseBtn.textContent = '⏸';
                } else {
                    audio.pause();
                    playPauseBtn.textContent = '▶';
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
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

});

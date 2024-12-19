jQuery(document).ready(function($) {
    // Theme switching functionality
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

    (function($) {
        // Menu hover effects
        $('.menu-item').on('mouseenter', function() {
            $(this).find('.nav-link').animate({opacity: 1}, 300);
        }).on('mouseleave', function() {
            $(this).find('.nav-link').animate({opacity: 0.8}, 200);
        });
    })(jQuery);
});
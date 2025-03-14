jQuery(document).ready(function($) {
	"use strict";

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
        themeToggleBtn.find('.theme-toggle-text').text('Toggle dark/light');
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
    
    // Menu hover effects - enhanced for smooth transitions
    const menuContainer = $('.menu');
    const menuItems = $('.menu-item');
    
    menuContainer.on('mouseenter', function() {
        // Show all menu items with reduced opacity and animate the transition
        menuItems.find('.nav-link').stop().animate({
            opacity: 0.5,
            transform: 'translateY(0)'
        }, 300);
        menuItems.find('.embed-menu-line').css('color', 'rgba(255, 0, 0, 0.7)');
    }).on('mouseleave', function() {
        // Hide all menu items and reset position
        menuItems.find('.nav-link').stop().animate({
            opacity: 0,
            transform: 'translateY(-5px)'
        }, 300);
        menuItems.find('.embed-menu-line').css('color', 'rgba(255, 0, 0, 0.5)');
    });
    
    // Individual menu item hover
    menuItems.on('mouseenter', function() {
        // Make the hovered item fully opaque with a slight bounce effect
        $(this).find('.nav-link').stop().animate({
            opacity: 1,
            transform: 'translateY(0)'
        }, 200);
        $(this).find('.embed-menu-line').css('color', 'var(--red)');
    }).on('mouseleave', function() {
        // Return to reduced opacity if still hovering the menu
        if (menuContainer.is(':hover')) {
            $(this).find('.nav-link').stop().animate({
                opacity: 0.5,
                transform: 'translateY(0)'
            }, 200);
            $(this).find('.embed-menu-line').css('color', 'rgba(255, 0, 0, 0.7)');
        }
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

jQuery(window).on( 'scroll', function(){
    document.documentElement.style.setProperty('--scroll', window.scrollY + 'px');
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


/**
 * South African Languages Timeline Visualization
 * 
 * This script controls a scroll-based timeline visualization of South African languages,
 * showing their origins, evolution, and how they were affected during and after apartheid.
 */

(function($) {
    $(document).ready(function() {
      // Configuration
      const config = {
        mapWidth: 800,
        mapHeight: 600,
        minYear: 1652,
        maxYear: 2025,
        apartheidStart: 1948,
        apartheidEnd: 1994
      };
      
      // Language data with origins and timeline information
      const languageData = [
        { id: "zulu", name: "Zulu", origin: "Bantu", center: [31, -28], originPoint: [33, -10], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 25 },
        { id: "xhosa", name: "Xhosa", origin: "Bantu", center: [27, -32], originPoint: [33, -10], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 23 },
        { id: "afrikaans", name: "Afrikaans", origin: "European", center: [20, -30], originPoint: [5, 52], year: 1750, officialStart: 1925, officialDuringApartheid: true, size: 20 },
        { id: "english", name: "English", origin: "European", center: [28, -26], originPoint: [0, 52], year: 1820, officialStart: 1910, officialDuringApartheid: true, size: 18 },
        { id: "sotho", name: "Sotho", origin: "Bantu", center: [27, -29], originPoint: [25, -10], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 15 },
        { id: "tswana", name: "Tswana", origin: "Bantu", center: [24, -26], originPoint: [25, -5], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 15 },
        { id: "tsonga", name: "Tsonga", origin: "Bantu", center: [31, -24], originPoint: [32, -15], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 10 },
        { id: "venda", name: "Venda", origin: "Bantu", center: [30, -23], originPoint: [30, -15], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 8 },
        { id: "ndebele", name: "Ndebele", origin: "Bantu", center: [29, -25], originPoint: [29, -15], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 8 },
        { id: "swati", name: "Swati", origin: "Bantu", center: [31, -26], originPoint: [31, -15], year: 1700, officialStart: 1994, officialDuringApartheid: false, size: 8 },
        { id: "khoi", name: "Khoi", origin: "Khoisan", center: [19, -33], originPoint: [19, -33], year: 1500, officialStart: null, officialDuringApartheid: false, size: 5 },
        { id: "san", name: "San", origin: "Khoisan", center: [22, -28], originPoint: [22, -28], year: 1500, officialStart: null, officialDuringApartheid: false, size: 5 },
        { id: "nama", name: "Nama", origin: "Khoisan", center: [17, -29], originPoint: [17, -29], year: 1500, officialStart: null, officialDuringApartheid: false, size: 3 },
        { id: "dutch", name: "Dutch", origin: "European", center: [19, -29], originPoint: [5, 52], year: 1652, officialStart: 1652, officialDuringApartheid: false, size: 5 },
        { id: "malay", name: "Malay", origin: "Mixed/Creole", center: [18, -34], originPoint: [100, 0], year: 1750, officialStart: null, officialDuringApartheid: false, size: 3 }
      ];
      
      // Historical events for timeline markers
      const historicalEvents = [
        { year: 1652, event: "Dutch colonization begins" },
        { year: 1795, event: "British occupation" },
        { year: 1822, event: "English becomes official language" },
        { year: 1925, event: "Afrikaans replaces Dutch as official language" },
        { year: 1948, event: "Apartheid begins" },
        { year: 1976, event: "Soweto Uprising against Afrikaans in schools" },
        { year: 1994, event: "End of Apartheid, 11 official languages recognized" },
        { year: 2025, event: "Present day" }
      ];
      
      let currentYear = config.minYear;
      let map;
      let projection;
      
      // Initialize the visualization
      function init() {
        // Set up D3 projection for Africa map
        projection = d3.geoMercator()
          .center([25, 0])
          .scale(config.mapWidth / 2)
          .translate([config.mapWidth / 2, config.mapHeight / 2]);
        
        initMap();
        initLanguages();
        initScrollHandler();
        
        // Show initial state
        updateVisualization(config.minYear);
        
        // Show scroll instruction
        $('.instruction').fadeIn(1000).delay(2000).fadeOut(1000);
      }
      
      // Initialize the African map
      function initMap() {
        const svg = d3.select("#map-container")
          .append("svg")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("viewBox", `0 0 ${config.mapWidth} ${config.mapHeight}`);
        
        map = svg;
        
        // Load and render Africa topojson
        d3.json(afctSettings.templateUrl + "/js/countries-110m.json")
          .then(function(data) {
            const path = d3.geoPath().projection(projection);
            
            // Draw Africa map
            svg.append("g")
              .selectAll("path")
              .data(topojson.feature(data, data.objects.countries).features)
              .enter()
              .append("path")
              .attr("d", path)
              .attr("fill", "#f5f5f5")
              .attr("stroke", "#ccc")
              .attr("stroke-width", 0.5);
            
            // Highlight South Africa
            svg.append("circle")
              .attr("cx", projection([24, -29])[0])
              .attr("cy", projection([24, -29])[1])
              .attr("r", 20)
              .attr("fill", "#ffd700")
              .attr("stroke", "#000")
              .attr("stroke-width", 1)
              .attr("opacity", 0.5);
          })
          .catch(error => console.log("Error loading map data:", error));
      }
      
      // Initialize language markers and migration lines
      function initLanguages() {
        // Group origin points
        const originGroups = {};
        languageData.forEach(lang => {
          const key = `${lang.originPoint[0]}-${lang.originPoint[1]}`;
          if (!originGroups[key]) {
            originGroups[key] = [];
          }
          originGroups[key].push(lang);
        });
        
        // Create origin points
        Object.keys(originGroups).forEach(key => {
          const langs = originGroups[key];
          const originPoint = langs[0].originPoint;
          
          map.append("circle")
            .attr("cx", projection(originPoint)[0])
            .attr("cy", projection(originPoint)[1])
            .attr("r", 5)
            .attr("fill", getColorByOrigin(langs[0].origin))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
          
          map.append("text")
            .attr("x", projection(originPoint)[0])
            .attr("y", projection(originPoint)[1] - 8)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(getOriginName(langs[0].origin));
        });
        
        // Create migration lines
        languageData.forEach(lang => {
          map.append("path")
            .attr("class", "migration-line")
            .attr("id", `line-${lang.id}`)
            .attr("d", `M${projection(lang.originPoint)[0]},${projection(lang.originPoint)[1]} L${projection(lang.center)[0]},${projection(lang.center)[1]}`)
            .attr("stroke", getColorByOrigin(lang.origin))
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 2)
            .attr("opacity", 0);
        });
        
        // Create language bubbles
        languageData.forEach(lang => {
          map.append("circle")
            .attr("class", "language-bubble")
            .attr("id", `bubble-${lang.id}`)
            .attr("cx", projection(lang.center)[0])
            .attr("cy", projection(lang.center)[1])
            .attr("r", 0)
            .attr("fill", getColorByOrigin(lang.origin))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", 0);
          
          map.append("text")
            .attr("class", "language-label")
            .attr("id", `label-${lang.id}`)
            .attr("x", projection(lang.center)[0])
            .attr("y", projection(lang.center)[1] + 4)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(lang.name)
            .attr("fill", "#000")
            .attr("opacity", 0);
        });
      }
      
      // Handle scroll events to update the timeline
      function initScrollHandler() {
        const timeRange = config.maxYear - config.minYear;
        const visualContainer = $('#visualization-container');
        
        // Create timeline markers
        const timelineContainer = $('<div class="timeline-markers"></div>').appendTo('#visualization-container');
        
        historicalEvents.forEach(event => {
          const markerPosition = (event.year - config.minYear) / timeRange;
          $(`<div class="timeline-marker" data-year="${event.year}" style="top: ${markerPosition * 100}%">
             <span class="marker-year">${event.year}</span>
             <span class="marker-label">${event.event}</span>
           </div>`).appendTo(timelineContainer);
        });
        
        // Add scroll sections
        const contentSections = $('#content-sections');
        const sectionHeight = window.innerHeight;
        
        historicalEvents.forEach(event => {
          $(`<div class="content-section" data-year="${event.year}" style="height: ${sectionHeight}px;"></div>`)
            .appendTo(contentSections);
        });
        
        // Update on scroll
        $(window).on('scroll', function() {
          const containerRect = visualContainer[0].getBoundingClientRect();
          const containerHeight = containerRect.height;
          const viewportHeight = window.innerHeight;
          
          // Check if section is in viewport
          if (containerRect.top <= viewportHeight && containerRect.bottom >= 0) {
            // Calculate scroll percentage based on container position
            let scrollPercentage;
            
            if (containerRect.height <= viewportHeight) {
              // If container fits in viewport, use position ratio
              scrollPercentage = Math.abs(containerRect.top) / (viewportHeight - containerRect.height);
            } else {
              // If container is taller than viewport, use scroll position within container
              scrollPercentage = Math.abs(containerRect.top) / (containerRect.height - viewportHeight);
            }
            
            scrollPercentage = Math.min(Math.max(scrollPercentage, 0), 1);
            
            const year = Math.floor(config.minYear + scrollPercentage * timeRange);
            if (year !== currentYear) {
              currentYear = year;
              updateVisualization(currentYear);
            }
          }
        });
      }
      
      // Update visualization based on year
      function updateVisualization(year) {
        // Update year display
        $("#year-display").text(year);
        
        // Find closest event
        const events = historicalEvents.filter(event => event.year <= year);
        const closestEvent = events[events.length - 1];
        
        // Update event info
        if (closestEvent) {
          $("#event-info").text(`${closestEvent.event}`);
        } else {
          $("#event-info").text("");
        }
        
        // Update language bubbles
        const isApartheid = year >= config.apartheidStart && year < config.apartheidEnd;
        
        languageData.forEach(lang => {
          const bubble = $(`#bubble-${lang.id}`);
          const label = $(`#label-${lang.id}`);
          const line = $(`#line-${lang.id}`);
          
          // Determine visibility
          const isIntroduced = year >= lang.year;
          const isVisible = isIntroduced && (!isApartheid || lang.officialDuringApartheid || year < config.apartheidStart + 5);
          const isOfficial = (lang.officialStart && year >= lang.officialStart);
          
          // Set size based on status
          let size = 0;
          if (isVisible) {
            size = isOfficial ? lang.size : lang.size * 0.7;
            if (isApartheid && !lang.officialDuringApartheid) {
              size = lang.size * 0.3;
            }
          }
          
          // Animation for apartheid transition
          if (Math.abs(year - config.apartheidStart) < 3 || Math.abs(year - config.apartheidEnd) < 3) {
            bubble.addClass('transitioning');
            label.addClass('transitioning');
          } else {
            bubble.removeClass('transitioning');
            label.removeClass('transitioning');
          }
          
          // Update bubble size and opacity
          d3.select(`#bubble-${lang.id}`)
            .transition()
            .duration(300)
            .attr("r", size)
            .attr("opacity", isVisible ? 0.8 : 0);
          
          d3.select(`#label-${lang.id}`)
            .transition()
            .duration(300)
            .attr("opacity", isVisible ? 1 : 0);
          
          d3.select(`#line-${lang.id}`)
            .transition()
            .duration(300)
            .attr("opacity", isIntroduced ? 0.5 : 0);
        });
      }
      
      // Helper functions
      function getColorByOrigin(origin) {
        switch(origin) {
          case "Bantu": return "#ff7f0e";
          case "European": return "#1f77b4";
          case "Khoisan": return "#2ca02c";
          case "Mixed/Creole": return "#d62728";
          default: return "#999";
        }
      }
      
      function getOriginName(origin) {
        switch(origin) {
          case "Bantu": return "Bantu Origins";
          case "European": return "Europe";
          case "Khoisan": return "Indigenous";
          case "Mixed/Creole": return "Mixed/Creole";
          default: return origin;
        }
      }
      
      // Start the visualization
      init();
    });
  })(jQuery);

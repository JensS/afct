/**
 * South African History Timeline Visualization
 * Enhanced with GSAP animations
 */

import * as d3 from "d3";
import * as topojson from "topojson-client";
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function initHistoryTimeline($) {
    // Configuration
    const config = {
        mapWidth: 800,
        mapHeight: 600,
        minYear: 1000,
        maxYear: 2025,
        colors: {
            migration: "var(--red)",
            languageSupression: "var(--red)",
            languageRecognition: "var(--red)"
        }
    };
    
    let historyData = [];
    let currentYear = config.minYear;
    let map;
    let projection;
    let masterTimeline; // GSAP master timeline
    let cachedParagraphItems = null;
    let storedVisualizations = {}; // Store visualization elements per item ID

    // Helper function to get paragraph items with cache
    function getParagraphItems() {
        if (!cachedParagraphItems) {
            cachedParagraphItems = historyData.filter(item => 
                item.title && item.paragraph
            );
        }
        return cachedParagraphItems;
    }

    // Update arrow states using shared classes, scoped to history
    function updateArrowStates(currentIndex, totalItems) {
        // Special case for welcome screen (index = -1)
        if (currentIndex === -1) {
            // Disable prev, enable next
            $('#the-history .carousel-arrow.prev').prop('disabled', true);
            $('#the-history .carousel-arrow.next').prop('disabled', false);
            $('#the-history .carousel-arrow.prev').addClass('disabled');
            $('#the-history .carousel-arrow.next').removeClass('disabled');
            return;
        }
        
        // Normal case for timeline items
        $('#the-history .carousel-arrow.prev').prop('disabled', currentIndex === 0);
        $('#the-history .carousel-arrow.next').prop('disabled', currentIndex >= totalItems - 1); // Use >= for safety

        // Also toggle class if needed for styling overrides not covered by :disabled pseudo-class
         $('#the-history .carousel-arrow.prev').toggleClass('disabled', currentIndex === 0);
         $('#the-history .carousel-arrow.next').toggleClass('disabled', currentIndex >= totalItems - 1);
    }

    // Initialize scroll handler
    function initScrollHandler() {
        // Add click handlers to timeline markers
        $(document).off('click', '.timeline-marker').on('click', '.timeline-marker', function() {
            if (masterTimeline && masterTimeline.isActive()) return; // Check if timeline is animating

            const year = parseInt($(this).data('year'));
            const paragraphItems = getParagraphItems();

            // Find the first paragraph item associated with this year
            const targetItem = paragraphItems.find(item => item.year_start === year);

            if (targetItem) {
                const targetLabel = `entry_${targetItem.id}`;
                console.log(`Marker click: Tweening to ${targetLabel}`);
                // Use tweenTo for smooth animation to the specific point
                masterTimeline.tweenTo(targetLabel, { duration: 1.5, ease: 'power1.inOut', overwrite: true });
            } else {
                // Optional: Handle clicks on years with no associated paragraph item
                // Just center the marker visually for now
                console.log(`No paragraph item found for year ${year}, centering marker.`);
                updateTimelineMarker(year); // Just center the marker visually
            }
        });
    }


    // Initialize the visualization
    function init() {
        projection = d3.geoMercator()
            .center([20, 20])
            .scale(config.mapWidth / 3)
            .translate([config.mapWidth / 2, config.mapHeight / 2]);
        
        map = initMap();

        try {
            masterTimeline = gsap.timeline({
                paused: true,
                onUpdate: updateTimelineArrowStates,
                onComplete: updateTimelineArrowStates,
                onReverseComplete: updateTimelineArrowStates
            });
        } catch (error) {
            console.error("Error initializing GSAP timeline:", error);
            return;
        }
        
        initTimelineContent();
        initScrollHandler();
        
        buildMasterTimeline();

        // Set timeline to welcome state and ensure welcome elements are visible
        masterTimeline.seek("welcome_end");
        masterTimeline.pause();

        // Manually ensure welcome elements are visible (seek doesn't always render properly)
        const welcomeElements = map.select("#event-layer").selectAll(".welcome-title, .welcome-instructions");
        welcomeElements.each(function() {
            gsap.set(this, { opacity: 1 });
        });

        updateArrowStates(-1, getParagraphItems().length);

        console.log("Timeline initialized with labels:", masterTimeline.labels);
    }


    function showWelcomeMessage() {
        const eventLayer = map.select("#event-layer");
        if (eventLayer.empty()) {
            console.error("Event layer not found for welcome message");
            return {};
        }
        eventLayer.selectAll(".welcome-title, .welcome-instructions").remove();

        const title = eventLayer.append("text")
            .attr("class", "welcome-title")
            .attr("x", config.mapWidth / 2)
            .attr("y", config.mapHeight / 2 - 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "var(--red)")
            .text("South African History Timeline")
            .attr("opacity", 0) // Start invisible
            .node();

        const instructions = eventLayer.append("text")
            .attr("class", "welcome-instructions")
            .attr("x", config.mapWidth / 2)
            .attr("y", config.mapHeight / 2 + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "var(--red)")
            .text("Use the arrows to navigate")
            .attr("opacity", 0) // Start invisible
            .node();

        console.log("Welcome elements created:", {title, instructions});
        return {
            title: title,
            instructions: instructions
        };
    }


    // Load history data
    function loadHistoryData() {
        const visualizationDataEl = document.getElementById('visualization-data');
       
        $.ajax({
            url: afctSettings.historyDataUrl,
            method: 'GET',
            cache: false,
            beforeSend: function(xhr) {
                // Always try to get the latest nonce from wp_rest
                const latestNonce = window.wpApiSettings?.nonce || afctSettings.historyNonce;
                if (latestNonce) {
                    xhr.setRequestHeader('X-WP-Nonce', latestNonce);
                }
            },
            success: function(data) {
                if (!Array.isArray(data)) {
                    console.error("Invalid history data format");
                    return;
                }

                console.log("Raw history data received:", data);

                historyData = data.filter(item => {
                    if (!item?.year_start) return false;
                    // Check if it's a paragraph item - accept either format
                    if (item.visualisation === "paragraph") {
                        const hasTitle = item.title || item.history_paragraph?.title;
                        if (!hasTitle) return false;
                    }
                    return true;
                });

                console.log("Filtered history data:", historyData);

                if (historyData.length === 0) {
                    console.error("No valid history items found");
                    console.log("Check WordPress admin: Pages → Edit History page → Add history entries");
                    return;
                }
                
                cachedParagraphItems = null;
                init();
            },
            error: function(error) {
                if (error.status === 403 && error.responseJSON?.code === 'rest_cookie_invalid_nonce') {
                    console.warn('Nonce validation failed, attempting to refresh...');
                    // Refresh the page to get a new nonce
                    window.location.reload();
                    return;
                }
                console.error("Failed to load history data:", error);
                if (error.status === 401 || error.status === 403) {
                    console.error("Authentication error - please check if you are logged in");
                }
                
            }
        });
    }
    
    // Initialize the African map
    function initMap()  {
        console.log("Initializing map...");
        const svg = d3.select("#map-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${config.mapWidth} ${config.mapHeight}`);

        console.log("SVG created:", svg.node());

        // Create defs for patterns and masks
        const defs = svg.append("defs");

        // Radial gradient for fade-out effect
        const radialGradient = defs.append("radialGradient")
            .attr("id", "mapFadeGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");

        radialGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 1);

        radialGradient.append("stop")
            .attr("offset", "60%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 1);

        radialGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0);

        // Mask using the radial gradient
        const mask = defs.append("mask")
            .attr("id", "mapFadeMask");

        mask.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", config.mapWidth)
            .attr("height", config.mapHeight)
            .attr("fill", "url(#mapFadeGradient)");

        // Country pattern (kept for potential future use)
        defs.append("pattern")
            .attr("id", "countryPattern")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 4)
            .attr("height", 4)
            .append("circle")
            .attr("cx", 2)
            .attr("cy", 2)
            .attr("r", 0.5)
            .attr("fill", "var(--text)");

        // South Africa pattern
        defs.append("pattern")
            .attr("id", "southAfricaPattern")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 3)
            .attr("height", 3)
            .append("circle")
            .attr("cx", 1.5)
            .attr("cy", 1.5)
            .attr("r", 0.6)
            .attr("fill", "var(--text)");
        
        // Load and render map (50m = medium resolution for better detail)
        console.log("Loading map data from:", afctSettings.templateUrl + "/js/countries-50m.json");

        // Assign svg to map FIRST so createAnimationLayers can use it
        map = svg;

        // Create countries layer first (bottom of stack) with radial fade mask
        const countriesLayer = svg.append("g")
            .attr("id", "countries-layer")
            .attr("mask", "url(#mapFadeMask)");

        // Create animation layers on top (these need map to be defined)
        createAnimationLayers();

        d3.json(afctSettings.templateUrl + "/js/countries-50m.json")
            .then(function(data) {
                console.log("Map data loaded successfully:", data);
                const path = d3.geoPath().projection(projection);

                const countries = countriesLayer
                    .selectAll("path")
                    .data(topojson.feature(data, data.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", "var(--red)")
                    .attr("stroke", "var(--background)") // Background color creates transparent gap effect
                    .attr("stroke-width", 2) // Gap width between countries
                    .attr("class", d => "country country-" + d.id)
                    .attr("opacity", d => d.id === 710 ? 0.8 : 0.4);

                console.log("Countries rendered:", countries.size(), "paths");
            })
            .catch(error => console.error("Error loading map:", error));

        return svg;
    }

    // Create animation layers
    function createAnimationLayers() {
        map.append("g").attr("id", "migration-layer");
        map.append("g").attr("id", "language-layer");
        map.append("g").attr("id", "event-layer");
    }

    // Initialize timeline content
    function initTimelineContent() {
        const timelineContent = $("#timeline-content");
        const timelineMarkers = $(".timeline-markers");
        const paragraphItems = getParagraphItems();
        
        createTimelineMarkers(timelineMarkers);
        createTimelineItems(timelineContent, paragraphItems);
        addNavigationArrows(timelineContent, paragraphItems);
        // Arrow states are now managed by updateTimelineArrowStates and the timeline
    }

    // Create timeline markers
    function createTimelineMarkers(timelineMarkers) {
        timelineMarkers.empty().html(`
            <div class="timeline-band-container">
                <div class="timeline-fade left"></div>
                <div class="timeline-band"></div>
                <div class="timeline-fade right"></div>
                <div class="timeline-center-indicator"></div>
            </div>
        `);
        
        const timelineBand = timelineMarkers.find('.timeline-band');
        const years = getAllHistoryYears();
        createTimelineBandMarkers(timelineBand, years);
    }

    // Get all years for timeline
    function getAllHistoryYears() {
        const paragraphItems = getParagraphItems();
        const years = new Set();
        
        paragraphItems.forEach(item => {
            years.add(item.year_start);
            if (item.year_end && item.year_end !== item.year_start) years.add(item.year_end);
        });
        
        historyData.filter(item => item.visualisation === "map").forEach(item => {
            years.add(item.year_start);
            if (item.year_end && item.year_end !== item.year_start) years.add(item.year_end);
        });
        
        const minYear = Math.floor(config.minYear / 100) * 100;
        const maxYear = Math.ceil(config.maxYear / 100) * 100;
        
        for (let year = minYear; year <= maxYear; year += 100) years.add(year);
        for (let year = 1900; year <= maxYear; year += 10) years.add(year);
        for (let year = 1950; year <= maxYear; year += 1) years.add(year);
        
        return Array.from(years).sort((a, b) => a - b);
    }

    // Create timeline band markers
    function createTimelineBandMarkers(timelineBand, years) {
        const bandWidth = 3000;
        const chapterYears = new Set(getParagraphItems().map(item => item.year_start));
        
        years.sort((a, b) => a - b);
        
        years.forEach(year => {
            let position;
            
            if (year < 1900) {
                const normalizedPos = (year - config.minYear) / (1900 - config.minYear);
                position = normalizedPos * (bandWidth * 0.5);
            } else if (year < 1950) {
                const normalizedPos = (year - 1900) / 50;
                position = (bandWidth * 0.5) + (normalizedPos * (bandWidth * 0.2));
            } else {
                const normalizedPos = (year - 1950) / (config.maxYear - 1950);
                position = (bandWidth * 0.7) + (normalizedPos * (bandWidth * 0.3));
            }
            
            let markerClass = "timeline-marker";
            let markerLabel = "";
            
            if (year % 100 === 0) {
                markerClass += " century-marker";
                markerLabel = year.toString();
            } else if (year % 10 === 0 && year >= 1900) {
                markerClass += " decade-marker";
                if (year % 50 === 0) markerLabel = year.toString();
            } else if (year >= 1950) {
                markerClass += " year-marker";
                if (year % 5 === 0) markerLabel = year.toString();
            }

            // Check if it's a chapter marker
            const isChapterMarker = chapterYears.has(year);
            if (isChapterMarker) {
                markerClass += " chapter-marker";
                // Don't set markerLabel for chapter markers to avoid duplicates
                markerLabel = '';
            }

            timelineBand.append(`
                <div class="${markerClass}" data-year="${year}" style="left: ${position}px;">
                    ${markerLabel ? `<span class="marker-year">${markerLabel}</span>` : ''}
                </div>
            `);
        });
    }

    // Create timeline items
    function createTimelineItems(timelineContent, paragraphItems) {
        timelineContent.find('.timeline-item').remove();

        paragraphItems.forEach(item => {
            if (!item?.id || !item.year_start) return;

            // Get title and paragraph from either format
            const title = item.title || item.history_paragraph?.title || '';
            const paragraph = item.paragraph || item.history_paragraph?.paragraph || '';

            if (!title) return; // Skip items without titles

            const timelineItem = $(`
                <div class="timeline-item" data-id="${item.id}" data-year-start="${item.year_start}" style="display: none; visibility: hidden; opacity: 0;">
                    <div class="content-wrapper">
                        <div class="year">
                            ${item.year_start}${(item.year_end && item.year_end !== item.year_start) ? ` - ${item.year_end}` : ''}
                        </div>
                        <h3>${title}</h3>
                        <p>${paragraph}</p>
                    </div>
                </div>
            `);

            timelineContent.append(timelineItem);
        });
    }

    // Add navigation arrows
    function addNavigationArrows(timelineContent, paragraphItems) {
        const arrowContainer = $('#the-history .history-nav-arrows');
        if (!arrowContainer.length) {
            console.error(".history-nav-arrows container not found");
            return;
        }

        arrowContainer.empty();
        arrowContainer.append('<button class="carousel-arrow prev" aria-label="Previous History Entry"></button>');
        arrowContainer.append('<button class="carousel-arrow next" aria-label="Next History Entry"></button>');
        $('#the-history').off('click', '.carousel-arrow.prev').on('click', '.carousel-arrow.prev', function(e) {
            e.preventDefault();
            console.log('Prev arrow clicked');

            if ($(this).hasClass('disabled')) {
                console.log('Prev arrow is disabled');
                return;
            }

            if (masterTimeline && masterTimeline.isActive()) {
                console.log('Timeline is currently animating');
                return;
            }

            // Get current and previous labels
            const currentTime = masterTimeline.time();
            const labels = Object.entries(masterTimeline.labels).sort((a, b) => a[1] - b[1]);
            let prevLabel = null;

            console.log('Current time:', currentTime, 'Labels:', labels);

            // Find the previous label
            for (let i = labels.length - 1; i >= 0; i--) {
                if (labels[i][1] < currentTime - 0.01) { // Add small tolerance
                    prevLabel = labels[i][0];
                    break;
                }
            }

            console.log('Previous label:', prevLabel);

            if (prevLabel) {
                // Tween to the previous label
                console.log('Tweening to:', prevLabel);
                masterTimeline.tweenTo(prevLabel, {
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
            } else {
                console.log('No previous label found');
            }
        });

        $('#the-history').off('click', '.carousel-arrow.next').on('click', '.carousel-arrow.next', function(e) {
            e.preventDefault();
            console.log('Next arrow clicked');

            if ($(this).hasClass('disabled')) {
                console.log('Next arrow is disabled');
                return;
            }

            if (masterTimeline && masterTimeline.isActive()) {
                console.log('Timeline is currently animating');
                return;
            }

            // Get current and next labels
            const currentTime = masterTimeline.time();
            const labels = Object.entries(masterTimeline.labels).sort((a, b) => a[1] - b[1]);
            let nextLabel = null;

            console.log('Current time:', currentTime, 'Labels:', labels);

            // Find the next label
            for (let i = 0; i < labels.length; i++) {
                if (labels[i][1] > currentTime + 0.01) { // Add small tolerance
                    nextLabel = labels[i][0];
                    break;
                }
            }

            console.log('Next label:', nextLabel);

            if (nextLabel) {
                // Tween to the next label
                console.log('Tweening to:', nextLabel);
                masterTimeline.tweenTo(nextLabel, {
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
            } else {
                console.log('No next label found');
            }
        });
    }

    // Update the timeline marker - Calculates target position and updates active class
    function updateTimelineMarker(year) {
        const marker = $(`.timeline-marker[data-year="${year}"]`);
        let targetTranslateX = '50%'; // Default fallback if marker not found

        $('.timeline-marker').removeClass('active'); // Deactivate all first

        if (marker.length) {
            const markerPosition = marker.position().left;
            const bandContainer = $('.timeline-band-container');
            const containerCenter = bandContainer.width() / 2;
            targetTranslateX = `${containerCenter - markerPosition}px`;
            marker.addClass('active'); // Activate the specific marker
        } else {
            console.warn("No marker found for year:", year, "- centering might be approximate.");
            // Optionally find closest marker if exact year not present
            // ... (logic from previous version could be added here if needed) ...
        }
        return targetTranslateX; // Return the calculated value
    }


    // Update map zoom - Returns a GSAP tween that dynamically captures starting state
    function updateMapZoom(item) {
        let mapZoom = item.map_zoom || "europe_and_africa";
        const zoomSettings = {
            europe_and_africa: { center: [20, 30], scale: config.mapWidth / 4 },
            africa: { center: [25, 0], scale: config.mapWidth / 2 },
            south_africa: { center: [25, -25], scale: config.mapWidth * 1.2 },
            south_africa_close: { center: [25, -29], scale: config.mapWidth * 2.5 }, // Close-up filling render area
            southern_africa: { center: [25, -25], scale: config.mapWidth * 0.8 },
            world: { center: [20, 10], scale: config.mapWidth / 6 }
        };
        const settings = zoomSettings[mapZoom] || zoomSettings.europe_and_africa;
        const duration = 1.0; // Zoom duration

        // Return a function that creates the tween when called
        // This ensures the starting state is captured when the tween actually plays
        const tween = gsap.to({}, {
            duration: duration,
            ease: 'power2.inOut',
            onStart: function() {
                // Capture starting state when tween actually starts playing
                this.vars.startScale = projection.scale();
                this.vars.startCx = projection.center()[0];
                this.vars.startCy = projection.center()[1];
                console.log(`🗺️ Zoom starting: [${this.vars.startCx}, ${this.vars.startCy}] scale=${this.vars.startScale} → [${settings.center}] scale=${settings.scale}`);
            },
            onUpdate: function() {
                // Calculate progress (0 to 1)
                const progress = this.progress();

                // Interpolate between start and end values
                const currentScale = this.vars.startScale + (settings.scale - this.vars.startScale) * progress;
                const currentCx = this.vars.startCx + (settings.center[0] - this.vars.startCx) * progress;
                const currentCy = this.vars.startCy + (settings.center[1] - this.vars.startCy) * progress;

                // Update projection
                projection.scale(currentScale).center([currentCx, currentCy]);

                // Redraw map countries
                map.select("#countries-layer").selectAll("path").attr("d", d3.geoPath().projection(projection));
                updateAnimationPositions();
            },
            onComplete: function() {
                // Ensure final state is applied precisely
                projection.scale(settings.scale).center(settings.center);
                map.select("#countries-layer").selectAll("path").attr("d", d3.geoPath().projection(projection));
                updateAnimationPositions();
                console.log(`   ✅ Zoom complete at [${settings.center}] scale=${settings.scale}`);
            }
        });

        return tween;
    }


    // Check if an item has valid visualization data
    function hasValidVisualizationData(item) {
        // Check if item has visualizations array with at least one entry
        return item.visualizations &&
               Array.isArray(item.visualizations) &&
               item.visualizations.length > 0;
    }


    // Create arrow visualization - Returns created DOM nodes
    function createArrowVisualization(viz) {
        if (!viz.origin || !viz.destination) {
            console.warn("Arrow visualization missing origin or destination:", viz);
            return { line: null, originMarker: null, destMarker: null, label: null };
        }

        const layer = map.select("#migration-layer");
        const originPos = projection(viz.origin);
        const destPos = projection(viz.destination);

        console.log("Creating arrow from", viz.origin, "to", viz.destination, "positions:", originPos, destPos);

        // Create line with GSAP animation
        const line = layer.append("path")
            .attr("class", "migration-line")
            .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
            .attr("stroke", "var(--viz-color)")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8, 4")
            .attr("fill", "none")
            .attr("opacity", 0)
            .attr("data-origin-x", viz.origin[0])
            .attr("data-origin-y", viz.origin[1])
            .attr("data-dest-x", viz.destination[0])
            .attr("data-dest-y", viz.destination[1])
            .node(); // Get the DOM node

        // Create origin marker (initially invisible)
        const originMarker = layer.append("circle")
            .attr("class", "origin-marker")
            .attr("cx", originPos[0])
            .attr("cy", originPos[1])
            .attr("r", 8)
            .attr("fill", "var(--viz-color)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        // Create destination marker (initially invisible)
        const destMarker = layer.append("circle")
            .attr("class", "destination-marker")
            .attr("cx", destPos[0])
            .attr("cy", destPos[1])
            .attr("r", 8)
            .attr("fill", "var(--viz-color)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.destination[0])
            .attr("data-y", viz.destination[1])
            .node();

        // Add label if provided (initially invisible)
        let label = null;
        if (viz.label) {
            label = layer.append("text")
                .attr("class", "migration-label")
                .attr("x", (originPos[0] + destPos[0]) / 2)
                .attr("y", (originPos[1] + destPos[1]) / 2 - 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "var(--viz-color)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", (viz.origin[0] + viz.destination[0]) / 2)
                .attr("data-y", (viz.origin[1] + viz.destination[1]) / 2)
                .attr("data-offset", -15)
                .node();
        }

        // Return the created DOM nodes
        const elements = {
            line: line,
            originMarker: originMarker,
            destMarker: destMarker,
            label: label
        };

        console.log("Arrow elements created and returning:", elements);
        return elements;
    }


    // Create dot visualization - Returns created DOM nodes
    function createDotVisualization(viz) {
        if (!viz.origin) {
            console.warn("Dot visualization missing origin:", viz);
            return { dot: null, label: null };
        }

        const layer = map.select("#event-layer");
        const pos = projection(viz.origin);

        console.log("Creating dot at", viz.origin, "position:", pos);

        // Create dot with GSAP animation
        const dot = layer.append("circle")
            .attr("class", "event-marker")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", 12)
            .attr("fill", "var(--viz-color)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        // Add label if provided (initially invisible)
        let label = null;
        if (viz.label) {
            label = layer.append("text")
                .attr("class", "event-label")
                .attr("x", pos[0])
                .attr("y", pos[1] + 28)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "var(--viz-color)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1])
                .attr("data-offset", 28)
                .node();
        }

        const elements = { dot: dot, label: label };
        console.log("Dot elements created and returning:", elements);
        return elements;
    }


    // Create dots visualization - Returns created DOM nodes
    function createDotsVisualization(viz) {
        if (!viz.origin) {
            console.warn("Dots visualization missing origin:", viz);
            return { centralDot: null, dots: [], labels: [], mainLabel: null };
        }

        const elements = { centralDot: null, dots: [], labels: [], mainLabel: null };
        const layer = map.select("#language-layer");
        const pos = projection(viz.origin);

        console.log("Creating dots at", viz.origin, "position:", pos);

        // Create central dot
        const centralDot = layer.append("circle")
            .attr("class", "language-bubble")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", 15)
            .attr("fill", "var(--viz-color)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        elements.centralDot = centralDot; // ASSIGN IT!

        // Create additional dots if coordinates provided
        if (viz.dotCoordinates?.length) {
            viz.dotCoordinates.forEach((coord, i) => {
                if (!Array.isArray(coord) || coord.length < 2) return;

                const dotPos = projection(coord);
                const dot = layer.append("circle")
                    .attr("class", "language-bubble")
                    .attr("cx", dotPos[0])
                    .attr("cy", dotPos[1])
                    .attr("r", 10)
                    .attr("fill", "var(--viz-color)")
                    .attr("opacity", 0) // Start invisible
                    .attr("data-x", coord[0])
                    .attr("data-y", coord[1])
                    .node();
                elements.dots.push(dot);

                if (viz.labels?.[i]) {
                    const label = layer.append("text")
                        .attr("class", "language-label")
                        .attr("x", dotPos[0])
                        .attr("y", dotPos[1] + 24)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("fill", "var(--viz-color)")
                        .text(viz.labels[i])
                        .attr("opacity", 0)
                        .attr("data-x", coord[0])
                        .attr("data-y", coord[1])
                        .attr("data-offset", 24)
                        .node();
                    elements.labels.push(label);
                }
            });
        }
        // Handle case where only labels are provided (circular layout) - Adapt if needed
        else if (viz.labels?.length) {
                viz.labels.forEach((label, i) => {
                const angle = (2 * Math.PI * i) / viz.labels.length;
                const radius = 40; // Adjust radius as needed
                const x = pos[0] + radius * Math.cos(angle);
                const y = pos[1] + radius * Math.sin(angle);
                const coord = projection.invert([x,y]); // Estimate lat/lon for data attributes

                const dot = layer.append("circle")
                    .attr("class", "language-bubble")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 8)
                    .attr("fill", "var(--viz-color)")
                    .attr("opacity", 0)
                    .attr("data-x", coord ? coord[0] : viz.origin[0]) // Use estimated or fallback
                    .attr("data-y", coord ? coord[1] : viz.origin[1])
                    .node();
                elements.dots.push(dot);

                const textLabel = layer.append("text")
                    .attr("class", "language-label")
                    .attr("x", x)
                    .attr("y", y + 24)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("fill", "var(--viz-color)")
                    .text(label)
                    .attr("opacity", 0)
                    .attr("data-x", coord ? coord[0] : viz.origin[0])
                    .attr("data-y", coord ? coord[1] : viz.origin[1])
                    .attr("data-offset", 24)
                    .node();
                elements.labels.push(textLabel);
                });
        }


        // Add main label if provided (initially invisible)
        if (viz.label) {
            const mainLabel = layer.append("text")
                .attr("class", "language-label")
                .attr("x", pos[0])
                .attr("y", pos[1] - 28)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "var(--viz-color)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1])
                .attr("data-offset", -28)
                .node();
            elements.mainLabel = mainLabel; // ASSIGN IT!
        }

        console.log("Dots elements created and returning:", elements);
        return elements;
    }


    // Update animation positions (called during map zoom tween's onUpdate)
    function updateAnimationPositions() { // Removed 'transition' parameter
        const layers = ["migration-layer", "language-layer", "event-layer"];
        layers.forEach(layer => {
            map.select(`#${layer}`).selectAll("*").each(function() {
                const element = d3.select(this);
                const nodeName = element.node().nodeName.toLowerCase();
                const classList = element.attr("class") || "";

                try {
                    const dataX = parseFloat(element.attr("data-x"));
                    const dataY = parseFloat(element.attr("data-y"));

                    if (!isNaN(dataX) && !isNaN(dataY)) {
                        const pos = projection([dataX, dataY]);

                        if (nodeName === 'circle' && (classList.includes("origin-marker") || classList.includes("destination-marker") || classList.includes("event-marker") || classList.includes("language-bubble"))) {
                            element.attr("cx", pos[0]).attr("cy", pos[1]);
                        } else if (nodeName === 'text' && (classList.includes("migration-label") || classList.includes("event-label") || classList.includes("language-label"))) {
                            const offset = parseFloat(element.attr("data-offset") || "0");
                            element.attr("x", pos[0]).attr("y", pos[1] + offset);
                        }
                    } else if (nodeName === 'path' && classList.includes("migration-line")) {
                        const originX = parseFloat(element.attr("data-origin-x"));
                        const originY = parseFloat(element.attr("data-origin-y"));
                        const destX = parseFloat(element.attr("data-dest-x"));
                        const destY = parseFloat(element.attr("data-dest-y"));

                        if (!isNaN(originX) && !isNaN(originY) && !isNaN(destX) && !isNaN(destY)) {
                            const originPos = projection([originX, originY]);
                            const destPos = projection([destX, destY]);
                            element.attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`);
                        }
                    }
                } catch (e) {
                    console.warn("Error updating position for element:", element.node(), e);
                }
            });
        });
    }

    // Creates and animates visualizations for a given item - Returns the elements to animate
    function renderVisualizationsForItem(item) {
        console.log("renderVisualizationsForItem called for item:", item.id, "visualizations:", item.visualizations);

        // Check if item has visualizations
        if (!item.visualizations || !Array.isArray(item.visualizations) || item.visualizations.length === 0) {
            console.log("No visualizations for item:", item.id, "- skipping visual indicators");
            return { elements: [], pulseElements: [] };
        }

        console.log("Rendering", item.visualizations.length, "visualizations for item:", item.id);
            // Clear existing visualizations
        const visualizationsToShow = item.visualizations || [];
        let allElementsToAnimate = [];
        let pulseElements = []; // Elements that should pulse

        visualizationsToShow.forEach((viz, idx) => {
            console.log(`Processing visualization ${idx + 1}/${visualizationsToShow.length}:`, viz);
            let createdElements = {};
            switch (viz.type) {
                case "arrow":
                case "arrows": // Handle potential plural type
                    console.log("Creating arrow visualization");
                    if (Array.isArray(viz.arrows)) {
                            viz.arrows.forEach(arrowViz => {
                                createdElements = createArrowVisualization(arrowViz);
                                Object.values(createdElements).forEach(el => { if (el) allElementsToAnimate.push(el); });
                            });
                        } else { // Handle single arrow case (original structure)
                            createdElements = createArrowVisualization(viz);
                            Object.values(createdElements).forEach(el => { if (el) allElementsToAnimate.push(el); });
                        }
                    console.log("Arrow elements created:", createdElements);
                    break;
                case "dot":
                    console.log("Creating dot visualization");
                    createdElements = createDotVisualization(viz);
                    Object.values(createdElements).forEach(el => {
                        if (el) {
                            allElementsToAnimate.push(el);
                            // Add dot to pulse list
                            if (el.nodeName.toLowerCase() === 'circle') pulseElements.push(el);
                        }
                    });
                    console.log("Dot elements created:", createdElements);
                    break;
                case "dots":
                    console.log("Creating dots visualization");
                    createdElements = createDotsVisualization(viz);
                    // Add central dot, other dots, labels, main label if they exist
                    if (createdElements.centralDot) {
                        allElementsToAnimate.push(createdElements.centralDot);
                        pulseElements.push(createdElements.centralDot); // Pulse central dot
                    }
                    allElementsToAnimate.push(...createdElements.dots.filter(el => el));
                    pulseElements.push(...createdElements.dots.filter(el => el)); // Pulse other dots
                    allElementsToAnimate.push(...createdElements.labels.filter(el => el));
                    if (createdElements.mainLabel) allElementsToAnimate.push(createdElements.mainLabel);
                    console.log("Dots elements created:", createdElements);
                    break;
                default:
                    console.warn("Unknown visualization type:", viz.type);
            }
        });

        console.log("Total elements to animate:", allElementsToAnimate.length, "Pulse elements:", pulseElements.length);

        // Return the elements to be animated by the caller
        return {
            elements: allElementsToAnimate,
            pulseElements: pulseElements
        };
    }


    // Build the master GSAP timeline
    function buildMasterTimeline() {
        const paragraphItems = getParagraphItems();
        if (!paragraphItems || paragraphItems.length === 0) {
            console.error("Cannot build timeline: No paragraph items.");
            return;
        }

        // Clear any existing timeline and stored visualizations
        masterTimeline.clear();
        storedVisualizations = {};

        // --- Step 1: Pre-create all visualizations with validation ---
        paragraphItems.forEach(item => {
            if (hasValidVisualizationData(item)) {
                const vizResult = renderVisualizationsForItem(item);
                storedVisualizations[item.id] = vizResult;
                // Set initial state: hidden
                if (vizResult.elements.length > 0) {
                    gsap.set(vizResult.elements, { opacity: 0 });
                }
            }
        });

        // --- Step 2: Build the timeline ---

        // Welcome screen
        masterTimeline.addLabel("welcome", 0);
        const welcomeElements = showWelcomeMessage();
        const validWelcomeElements = Object.values(welcomeElements).filter(el => el && el.nodeType === 1);

        // Map zoom for welcome
        masterTimeline.add(updateMapZoom({ map_zoom: "africa" }), "welcome");

        // Welcome text fade in
        if (validWelcomeElements.length > 0) {
            masterTimeline.fromTo(validWelcomeElements,
                { opacity: 0 },
                { opacity: 1, duration: 0.75, stagger: 0.2, ease: "power2.out" },
                "welcome+=0.3"
            );
        }

        masterTimeline.addLabel("welcome_end", "welcome+=1.5");

        // --- Step 3: Add each entry's animations ---
        let previousItemId = null;

        paragraphItems.forEach((item, index) => {
            const itemId = item.id;
            const itemLabel = `entry_${itemId}`;
            const itemElement = $(`.timeline-item[data-id="${itemId}"]`).get(0);
            const itemYear = item.year_start;

            // Calculate position: first entry after welcome_end, others follow
            const labelPosition = index === 0 ? "welcome_end+=0.3" : ">=0.3";
            masterTimeline.addLabel(itemLabel, labelPosition);

            // --- Fade out previous content ---
            if (index === 0 && validWelcomeElements.length > 0) {
                // Fade out welcome
                masterTimeline.to(validWelcomeElements, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power1.in"
                }, itemLabel);
            } else if (previousItemId) {
                // Fade out previous item's text
                const prevElement = $(`.timeline-item[data-id="${previousItemId}"]`).get(0);
                if (prevElement) {
                    masterTimeline.to(prevElement, {
                        autoAlpha: 0,
                        duration: 0.3,
                        ease: "power1.in"
                    }, itemLabel);
                }
                // Fade out previous item's visualizations
                const prevViz = storedVisualizations[previousItemId];
                if (prevViz && prevViz.elements.length > 0) {
                    masterTimeline.to(prevViz.elements, {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power1.in"
                    }, itemLabel);
                }
            }

            // --- Map zoom ---
            masterTimeline.add(updateMapZoom(item), itemLabel + "+=0.1");

            // --- Timeline marker update (non-reversible, just visual) ---
            masterTimeline.call(() => updateTimelineMarker(itemYear), null, itemLabel + "+=0.1");

            // --- Fade in current item's text ---
            if (itemElement) {
                masterTimeline.fromTo(itemElement,
                    { autoAlpha: 0, display: 'block' },
                    { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
                    itemLabel + "+=0.4"
                );
            }

            // --- Fade in current item's visualizations ---
            const currentViz = storedVisualizations[itemId];
            if (currentViz && currentViz.elements.length > 0) {
                masterTimeline.fromTo(currentViz.elements,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.5, stagger: 0.03, ease: "power2.out" },
                    itemLabel + "+=0.5"
                );
            }

            previousItemId = itemId;
        });

        // End label
        masterTimeline.addLabel("end", ">=0.5");

        console.log("Master Timeline Built:", masterTimeline.labels);
    }

    // Update navigation arrow states based on masterTimeline progress/state
    function updateTimelineArrowStates() {
        if (!masterTimeline) return;

        const currentTime = masterTimeline.time();
        const totalDuration = masterTimeline.duration();
        const labels = masterTimeline.labels;
        const welcomeTime = labels["welcome"] ?? 0; // Time of the welcome label
        const endTime = labels["end"] ?? totalDuration; // Time of the end label

        // Use a small tolerance for floating point comparisons
        const tolerance = 0.01;

        // Previous arrow logic: Disabled if at or before the 'welcome' label time
        const disablePrev = currentTime <= welcomeTime + tolerance;
        $('#the-history .carousel-arrow.prev').prop('disabled', disablePrev).toggleClass('disabled', disablePrev);

        // Next arrow logic: Disabled if at or after the 'end' label time
        const disableNext = currentTime >= endTime - tolerance;
        $('#the-history .carousel-arrow.next').prop('disabled', disableNext).toggleClass('disabled', disableNext);
    }

    // Load history data
    loadHistoryData();
    
    // Return public methods to interact with the timeline
    return {
        /**
         * Jump to a specific entry in the timeline by ID
         * @param {number} id - The ID of the history entry to jump to
         */
        jumpToEntry: function(id) {
            if (!masterTimeline) return;
            
            const targetLabel = `entry_${id}`;
            if (masterTimeline.labels[targetLabel] !== undefined) {
                masterTimeline.tweenTo(targetLabel, { 
                    duration: 1.0, 
                    ease: 'power2.inOut',
                    overwrite: true 
                });
            } else {
                console.warn(`Entry with id ${id} not found in timeline`);
            }
        },
        
        /**
         * Jump to a specific year in the timeline
         * @param {number} year - The year to jump to
         */
        jumpToYear: function(year) {
            if (!masterTimeline) return;
            
            const paragraphItems = getParagraphItems();
            const item = paragraphItems.find(item => item.year_start === year);
            
            if (item) {
                this.jumpToEntry(item.id);
            } else {
                // Find closest year
                const closestItem = paragraphItems.reduce((prev, curr) => 
                    Math.abs(curr.year_start - year) < Math.abs(prev.year_start - year) ? curr : prev
                );
                this.jumpToEntry(closestItem.id);
            }
        },
        
        /**
         * Re-initialize the timeline (useful after window resize)
         */
        reinitialize: function() {
            cachedParagraphItems = null;
            init();
        },
        
        /**
         * Get the current timeline state
         * @returns {Object} Object containing current state information
         */
        getState: function() {
            if (!masterTimeline) return { initialized: false };
            
            const currentTime = masterTimeline.time();
            const labels = masterTimeline.labels;
            const currentLabel = Object.keys(labels).find((label, i, arr) => {
                const nextLabel = arr[i + 1];
                return labels[label] <= currentTime && (!nextLabel || labels[nextLabel] > currentTime);
            });
            
            let currentId = null;
            if (currentLabel && currentLabel.startsWith('entry_')) {
                currentId = parseInt(currentLabel.replace('entry_', ''));
            }
            
            return {
                initialized: true,
                currentTime,
                currentLabel,
                currentId,
                isAtWelcome: currentLabel === 'welcome',
                isAtEnd: currentLabel === 'end',
                isPlaying: masterTimeline.isActive()
            };
        },
        
        /**
         * Move to the next item in the timeline
         */
        next: function() {
            if (masterTimeline && !masterTimeline.isActive() && !$('#the-history .carousel-arrow.next').prop('disabled')) {
                masterTimeline.play();
            }
        },
        
        /**
         * Move to the previous item in the timeline
         */
        prev: function() {
            if (masterTimeline && !masterTimeline.isActive() && !$('#the-history .carousel-arrow.prev').prop('disabled')) {
                masterTimeline.reverse();
            }
        }
    };
}

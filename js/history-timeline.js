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
                onUpdate: updateTimelineArrowStates, // Update arrows during tweening
                onComplete: updateTimelineArrowStates, // Update arrows on completion
                onReverseComplete: updateTimelineArrowStates // Update arrows on reverse completion
            });
        } catch (error) {
            console.error("Error initializing GSAP timeline:", error);
            return;
        }
        
        initTimelineContent();
        initScrollHandler();
        
        buildMasterTimeline();

        masterTimeline.time(0);
        masterTimeline.seek("welcome");
        
        const welcomeLayer = map.select("#event-layer");
        welcomeLayer.selectAll(".welcome-title, .welcome-instructions, .welcome-start")
            .attr("opacity", 1);
            
        updateArrowStates(-1, getParagraphItems().length);
        
        console.log("Timeline initialized with labels:", masterTimeline.labels);
    }


    function showWelcomeMessage() {
        const eventLayer = map.select("#event-layer");
        if (eventLayer.empty()) {
            console.error("Event layer not found for welcome message");
            return {};
        }
        eventLayer.selectAll(".welcome-title, .welcome-instructions, .welcome-start").remove();

        const title = eventLayer.append("text")
            .attr("class", "welcome-title")
            .attr("x", config.mapWidth / 2)
            .attr("y", config.mapHeight / 2 - 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "var(--text)")
            .text("South African History Timeline")
            .attr("opacity", 0) // Start invisible
            .node();

            const instructions = eventLayer.append("text")
            .attr("class", "welcome-instructions")
            .attr("x", config.mapWidth / 2)
            .attr("y", config.mapHeight / 2 + 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "var(--text)")
            .text("Use the arrows to navigate through history")
            .attr("opacity", 0) // Start invisible
            .node();

            const startArrow = eventLayer.append("text")
            .attr("class", "welcome-start")
            .attr("x", config.mapWidth / 2)
            .attr("y", config.mapHeight / 2 + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "var(--red)")
            .text("Click the right arrow to begin →")
            .attr("opacity", 0) // Start invisible
            .node();
        console.log("Welcome elements created:", {title, instructions, startArrow});
        return {
            title: title,
            instructions: instructions,
            startInstructions: startArrow
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

                historyData = data.filter(item => {
                    if (!item?.year_start) return false;
                    if (item.visualisation === "paragraph" && (!item.history_paragraph?.title)) return false;
                    return true;
                });
                
                if (historyData.length === 0) {
                    console.error("No valid history items found");
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
        const svg = d3.select("#map-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${config.mapWidth} ${config.mapHeight}`);
        
        
        // Create dot patterns
        const defs = svg.append("defs");
        
        // Country pattern
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
        
        // Load and render map
        d3.json(afctSettings.templateUrl + "/js/countries-110m.json")
            .then(function(data) {
                const path = d3.geoPath().projection(projection);
                
                svg.append("g")
                    .selectAll("path")
                    .data(topojson.feature(data, data.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", d => d.id === 710 ? "url(#southAfricaPattern)" : "url(#countryPattern)")
                    .attr("stroke", "var(--background)")
                    .attr("stroke-width", 1)
                    .attr("class", d => "country country-" + d.id)
                    .attr("opacity", d => d.id === 710 ? 0.8 : 0.5);
                
                createAnimationLayers();
            })
            .catch(error => console.error("Error loading map:", error));
            
        map = svg; // Assign svg to map before using it
        createAnimationLayers();
            
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
            
            if (chapterYears.has(year)) {
                markerClass += " chapter-marker";
                markerLabel = year.toString();
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
            if (!item?.id || !item.year_start || !item.title) return;
            
            const timelineItem = $(`
                <div class="timeline-item" data-id="${item.id}" data-year-start="${item.year_start}" style="display: none; visibility: hidden; opacity: 0;">
                    <div class="content-wrapper">
                        <div class="year">
                            ${item.year_start}${(item.year_end && item.year_end !== item.year_start) ? ` - ${item.year_end}` : ''}
                        </div>
                        <h3>${item.title}</h3>
                        <p>${item.paragraph}</p>
                    </div>
                </div>
            `);
            
            timelineContent.append(timelineItem);
        });
    }

    // Add navigation arrows
    function addNavigationArrows(timelineContent, paragraphItems) {
        const historyContainer = $('#the-history');
        if (!historyContainer.length) {
            console.error("#the-history container not found");
            return;
        }
        
        $('#the-history .carousel-arrow.prev, #the-history .carousel-arrow.next').remove();
        historyContainer.append('<button class="carousel-arrow prev" aria-label="Previous History Entry"></button>');
        historyContainer.append('<button class="carousel-arrow next" aria-label="Next History Entry"></button>');
        $('#the-history').off('click', '.carousel-arrow.prev').on('click', '.carousel-arrow.prev', function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled') || (masterTimeline && masterTimeline.isActive())) return;

            // Get current and previous labels
            const currentTime = masterTimeline.time();
            const labels = Object.entries(masterTimeline.labels).sort((a, b) => a[1] - b[1]);
            let prevLabel = null;
            
            // Find the previous label
            for (let i = labels.length - 1; i >= 0; i--) {
                if (labels[i][1] < currentTime) {
                    prevLabel = labels[i][0];
                    break;
                }
            }
            
            if (prevLabel) {
                // Tween to the previous label
                masterTimeline.tweenTo(prevLabel, {
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
            }
        });

        $('#the-history').off('click', '.carousel-arrow.next').on('click', '.carousel-arrow.next', function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled') || (masterTimeline && masterTimeline.isActive())) return;

            // Get current and next labels
            const currentTime = masterTimeline.time();
            const labels = Object.entries(masterTimeline.labels).sort((a, b) => a[1] - b[1]);
            let nextLabel = null;
            
            // Find the next label
            for (let i = 0; i < labels.length; i++) {
                if (labels[i][1] > currentTime) {
                    nextLabel = labels[i][0];
                    break;
                }
            }
            
            if (nextLabel) {
                // Tween to the next label
                masterTimeline.tweenTo(nextLabel, {
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
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


    // Update map zoom - Returns a GSAP tween
    function updateMapZoom(item) {
        let mapZoom = item.map_zoom || "europe_and_africa";
        const zoomSettings = {
            europe_and_africa: { center: [20, 30], scale: config.mapWidth / 4 },
            africa: { center: [25, 0], scale: config.mapWidth / 2 },
            south_africa: { center: [25, -25], scale: config.mapWidth * 1.2 },
            southern_africa: { center: [25, -25], scale: config.mapWidth * 0.8 },
            world: { center: [20, 10], scale: config.mapWidth / 6 }
        };
        const settings = zoomSettings[mapZoom] || zoomSettings.europe_and_africa;
        const duration = 1.0; // Zoom duration

        // Create a proxy object to tween
        let projectionProxy = {
            scale: projection.scale(),
            cx: projection.center()[0],
            cy: projection.center()[1]
        };

        // Return a GSAP tween
        return gsap.to(projectionProxy, {
            scale: settings.scale,
            cx: settings.center[0],
            cy: settings.center[1],
            duration: duration,
            ease: 'power2.inOut',
            onUpdate: function() {
                projection.scale(this.targets()[0].scale).center([this.targets()[0].cx, this.targets()[0].cy]);
                // Redraw map paths without D3 transition
                map.selectAll("path.country").attr("d", d3.geoPath().projection(projection));
                // Update positions of existing D3 elements (visualizations) without transition
                updateAnimationPositions(); // Call without transition parameter
            },
            onComplete: function() {
                // Ensure final state is applied precisely
                projection.scale(settings.scale).center(settings.center);
                map.selectAll("path.country").attr("d", d3.geoPath().projection(projection));
                updateAnimationPositions();
            }
        });
    }


    // Clear all visualizations - Returns a GSAP tween
    function clearAllVisualizations() {
        const layers = ["#migration-layer", "#language-layer", "#event-layer"];
        const elementsToRemove = [];
        
        try {
            layers.forEach(layer => {
                // Check if the layer exists
                const layerSelection = map.select(layer);
                if (!layerSelection.empty()) {
                    // Select all direct children of the layer group to avoid selecting the group itself
                    layerSelection.selectAll(":scope > *").each(function() {
                        // Exclude welcome message elements if they should persist differently
                        if (!d3.select(this).classed('welcome-title') &&
                            !d3.select(this).classed('welcome-instructions') &&
                            !d3.select(this).classed('welcome-start')) {
                            elementsToRemove.push(this);
                        }
                    });
                }
            });
        } catch (error) {
            console.warn("Error selecting elements to clear:", error);
        }

        if (elementsToRemove.length === 0) {
            // Return an empty tween if nothing to remove
            return gsap.to({}, { duration: 0 });
        }

        // Return a tween that fades out and removes elements
        return gsap.to(elementsToRemove, {
            opacity: 0,
            duration: 0.3, // Short fade-out duration
            stagger: 0.02,
            ease: 'power1.in',
            onComplete: () => {
                elementsToRemove.forEach(el => {
                    if (el && el.parentNode) {
                        el.remove();
                    }
                });
            }
        });
    }


    // Create arrow visualization - Returns created DOM nodes
    function createArrowVisualization(viz) {
        const elements = { line: null, originMarker: null, destMarker: null, label: null };
        if (!viz.origin || !viz.destination) return elements;
        
        const layer = map.select("#migration-layer");
        const originPos = projection(viz.origin);
        const destPos = projection(viz.destination);
        
        // Create line with GSAP animation
        const line = layer.append("path")
            .attr("class", "migration-line")
            .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
            .attr("stroke", "var(--red)")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4, 4")
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
            .attr("r", 5)
            .attr("fill", "var(--red)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        // Create destination marker (initially invisible)
        const destMarker = layer.append("circle")
            .attr("class", "destination-marker")
            .attr("cx", destPos[0])
            .attr("cy", destPos[1])
            .attr("r", 5)
            .attr("fill", "var(--red)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.destination[0])
            .attr("data-y", viz.destination[1])
            .node();

        // Add label if provided (initially invisible)
        if (viz.label) {
            const label = layer.append("text")
                .attr("class", "migration-label")
                .attr("x", (originPos[0] + destPos[0]) / 2)
                .attr("y", (originPos[1] + destPos[1]) / 2 - 10)
                .attr("text-anchor", "middle")
                .attr("fill", "var(--red)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", (viz.origin[0] + viz.destination[0]) / 2)
                .attr("data-y", (viz.origin[1] + viz.destination[1]) / 2)
                .attr("data-offset", -10)
                .node();
        }
        return elements; // Return the DOM nodes
    }


    // Create dot visualization - Returns created DOM nodes
    function createDotVisualization(viz) {
        const elements = { dot: null, label: null };
        if (!viz.origin) return elements;
        
        const layer = map.select("#event-layer");
        const pos = projection(viz.origin);
        
        // Create dot with GSAP animation
        const dot = layer.append("circle")
            .attr("class", "event-marker")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", 8)
            .attr("fill", "var(--red)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        // Add label if provided (initially invisible)
        if (viz.label) {
            const label = layer.append("text")
                .attr("class", "event-label")
                .attr("x", pos[0])
                .attr("y", pos[1] + 20)
                .attr("text-anchor", "middle")
                .attr("fill", "var(--red)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1])
                .attr("data-offset", 20)
                .node();
        }
        return elements;
    }


    // Create dots visualization - Returns created DOM nodes
    function createDotsVisualization(viz) {
        const elements = { centralDot: null, dots: [], labels: [], mainLabel: null };
        if (!viz.origin) return elements;
        
        const layer = map.select("#language-layer");
        const pos = projection(viz.origin);
        
        // Create central dot
        const centralDot = layer.append("circle")
            .attr("class", "language-bubble")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", 15)
            .attr("fill", "var(--red)")
            .attr("opacity", 0) // Start invisible
            .attr("data-x", viz.origin[0])
            .attr("data-y", viz.origin[1])
            .node();

        // Create additional dots if coordinates provided
        if (viz.dotCoordinates?.length) {
            viz.dotCoordinates.forEach((coord, i) => {
                if (!Array.isArray(coord) || coord.length < 2) return;
                
                const dotPos = projection(coord);
                const dot = layer.append("circle")
                    .attr("class", "language-bubble")
                    .attr("cx", dotPos[0])
                    .attr("cy", dotPos[1])
                    .attr("r", 8)
                    .attr("fill", "var(--red)")
                    .attr("opacity", 0) // Start invisible
                    .attr("data-x", coord[0])
                    .attr("data-y", coord[1])
                    .node();
                elements.dots.push(dot);

                if (viz.labels?.[i]) {
                    const label = layer.append("text")
                        .attr("class", "language-label")
                        .attr("x", dotPos[0])
                        .attr("y", dotPos[1] + 20)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--red)")
                        .text(viz.labels[i])
                        .attr("opacity", 0)
                        .attr("data-x", coord[0])
                        .attr("data-y", coord[1])
                        .attr("data-offset", 20)
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
                    .attr("fill", "var(--red)")
                    .attr("opacity", 0)
                    .attr("data-x", coord ? coord[0] : viz.origin[0]) // Use estimated or fallback
                    .attr("data-y", coord ? coord[1] : viz.origin[1])
                    .node();
                elements.dots.push(dot);

                const textLabel = layer.append("text")
                    .attr("class", "language-label")
                    .attr("x", x)
                    .attr("y", y + 20)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--red)")
                    .text(label)
                    .attr("opacity", 0)
                    .attr("data-x", coord ? coord[0] : viz.origin[0])
                    .attr("data-y", coord ? coord[1] : viz.origin[1])
                    .attr("data-offset", 20)
                    .node();
                elements.labels.push(textLabel);
                });
        }


        // Add main label if provided (initially invisible)
        if (viz.label) {
            const label = layer.append("text")
                .attr("class", "language-label")
                .attr("x", pos[0])
                .attr("y", pos[1] - 25)
                .attr("text-anchor", "middle")
                .attr("fill", "var(--red)")
                .text(viz.label)
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1])
                .attr("data-offset", -25)
                .node();
        }
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

    // Creates and animates visualizations for a given item onto the masterTimeline
    function renderVisualizationsForItem(item, timeline, position) {
        // Check if item has visualizations
        if (!item.visualizations || !Array.isArray(item.visualizations) || item.visualizations.length === 0) {
            console.log("No visualizations for item:", item.id);
            return;
        }
        
        console.log("Rendering visualizations for item:", item.id, item.visualizations);
            // Clear existing visualizations
        const visualizationsToShow = item.visualizations || [];
        let allElementsToAnimate = [];
        let pulseElements = []; // Elements that should pulse

        visualizationsToShow.forEach(viz => {
            let createdElements = {};
            switch (viz.type) {
                case "arrow":
                case "arrows": // Handle potential plural type
                    if (Array.isArray(viz.arrows)) {
                            viz.arrows.forEach(arrowViz => {
                                createdElements = createArrowVisualization(arrowViz);
                                Object.values(createdElements).forEach(el => { if (el) allElementsToAnimate.push(el); });
                            });
                        } else { // Handle single arrow case (original structure)
                            createdElements = createArrowVisualization(viz);
                            Object.values(createdElements).forEach(el => { if (el) allElementsToAnimate.push(el); });
                        }
                    break;
                case "dot":
                    createdElements = createDotVisualization(viz);
                    Object.values(createdElements).forEach(el => {
                        if (el) {
                            allElementsToAnimate.push(el);
                            // Add dot to pulse list
                            if (el.nodeName.toLowerCase() === 'circle') pulseElements.push(el);
                        }
                    });
                    break;
                case "dots":
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
                    break;
                default:
                    console.warn("Unknown visualization type:", viz.type);
            }
        });

        // Add fade-in animation for all created elements to the timeline
        if (allElementsToAnimate.length > 0 && timeline) {
            try {

                gsap.set(allElementsToAnimate, { opacity: 0 });

                timeline.to(allElementsToAnimate, {
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.05, // Stagger the appearance slightly
                    ease: 'power2.out'
                }, position); // Add at the specified position relative to label

                // Add pulsing animation for specific elements (dots) after they fade in
                if (pulseElements.length > 0) {
                    timeline.to(pulseElements, {
                        scale: 1.2, // Pulse scale effect
                        duration: 0.8,
                        ease: "power1.inOut",
                        yoyo: true,
                        repeat: -1, // Repeat indefinitely while the item is active
                        stagger: 0.1
                    }, ">-0.4"); // Start pulsing slightly after fade-in completes
                }
            } catch (error) {
                console.error("GSAP animation error:", error);
            }
        }
    }


    // Build the master GSAP timeline
    function buildMasterTimeline() {
        const paragraphItems = getParagraphItems();
        if (!paragraphItems || paragraphItems.length === 0) {
            console.error("Cannot build timeline: No paragraph items.");
            return;
        }
        // Clear any existing timeline
        masterTimeline.clear();

        // Create a structure to track animation elements for each timeline entry
        const animationElements = {
            welcome: null,
            items: {}
        };

        // --- Initial State (Welcome Message) ---
        masterTimeline.addLabel("welcome", 0);
        const welcomeElements = showWelcomeMessage(); // Create welcome elements
        // Store welcome elements in our tracking structure
        animationElements.welcome = welcomeElements;
        // Add initial map zoom for welcome screen
        masterTimeline.add(updateMapZoom({ map_zoom: "africa" }), "<"); // Start zoom immediately at welcome label

        try {
             // Only animate elements that are valid DOM nodes
             const validElements = Object.values(welcomeElements)
             .filter(el => el && el.nodeType === 1);
            
            if (validElements.length > 0) {
                // Welcome message fade in - set initial opacity to 0 to ensure animation works
                masterTimeline.set(validElements, { opacity: 0 }, "<");
                masterTimeline.to(validElements, {
                    opacity: 1,
                    duration: 0.75,
                    stagger: 0.2,
                    ease: "power2.out"
                }, ">-=0.5"); // Stagger in after map zoom starts
                
                // Add pulsing arrow animation for start instructions (only if it exists)
                if (welcomeElements.startInstructions && welcomeElements.startInstructions.nodeType === 1) {
                    masterTimeline.to(welcomeElements.startInstructions, {
                        x: "+=10", // Move right
                        repeat: -1, // Repeat indefinitely
                        yoyo: true, // Go back and forth
                        duration: 0.8,
                        ease: "power1.inOut"
                    }, ">-0.5"); // Start pulsing near the end of the text fade-in
                }
            }
        } catch (error) {
            console.error("GSAP welcome animation error:", error);
        }
    
        // --- Transitions Between Items ---
        let previousItemId = null;
        masterTimeline.addLabel("welcome_end", "+=0.5");

        paragraphItems.forEach((item, index) => {
            const itemId = item.id;
            const itemLabel = `entry_${itemId}`;
            
            // Store current item's DOM element in our tracking structure
            const itemElement = $(`.timeline-item[data-id="${itemId}"]`);
            animationElements.items[itemId] = {
                element: itemElement.length > 0 ? itemElement.get(0) : null
            };
            
            const itemYear = item.year_start;

            // --- Add Label for this item ---
            masterTimeline.addLabel(itemLabel, index === 0 ? ">+0.5" : ">+0.3");

            // --- Animations STARTING at itemLabel ---

            // 1. Fade out previous item's text (or welcome message)
            let elementToFadeOut = null;
            if (index === 0 && animationElements.welcome) {
                // For first item, fade out welcome elements if they exist
                const welcomeElementsToFade = Object.values(animationElements.welcome)
                    .filter(el => el && el.nodeType === 1);
                    
                // Only set elementToFadeOut if we have valid welcome elements
                if (welcomeElementsToFade.length > 0) {
                    elementToFadeOut = welcomeElementsToFade;
                }
                
                // Stop pulsing animation on welcome arrow if it exists
                if (animationElements.welcome.startInstructions) {
                    try {
                        gsap.killTweensOf(animationElements.welcome.startInstructions);
                    } catch (error) {
                        console.warn("Could not kill welcome animation tweens:", error);
                    }
                }
            } else if (previousItemId && animationElements.items[previousItemId]?.element) {
                // For subsequent items, fade out the previous item's element if it exists
                elementToFadeOut = animationElements.items[previousItemId].element;
            }

            if (elementToFadeOut) {
                masterTimeline.to(elementToFadeOut, {
                    autoAlpha: 0, // Fades out and sets visibility: hidden
                    duration: 0.4,
                }, itemLabel); // Start fade out exactly at the item label
            }

            // 2. Clear previous visualizations
            masterTimeline.add(clearAllVisualizations(), itemLabel + "+=0.1");

            // 3. Animate Map Zoom
            masterTimeline.add(updateMapZoom(item), itemLabel + "+=0.1");

            // 4. Animate Timeline Band centering
            masterTimeline.call(() => {
                const targetX = updateTimelineMarker(itemYear); // Update active class and get target X
                gsap.to('.timeline-band', { // Animate the band using the calculated value
                    x: targetX,
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
            }, null, itemLabel + "+=0.1"); // Call slightly after label

            // --- Animations STARTING LATER (relative to itemLabel or previous tween) ---

            // 5. Fade In Current Item's Text (only if the element exists)
            const currentElement = animationElements.items[itemId]?.element;
            if (currentElement) {
                // Ensure item is visible before fading in (autoAlpha handles display and opacity)
                masterTimeline.set(currentElement, { display: 'block', autoAlpha: 0 });
                masterTimeline.to(currentElement, {
                    autoAlpha: 1,
                    duration: 0.5
                }, ">-0.3"); // Overlap slightly with map zoom/band animation end
            }

            // 6. Render and Animate New Visualizations
            masterTimeline.call(renderVisualizationsForItem, [item, masterTimeline, ">-0.2"], ">-0.2");

            // Store current item ID for the next iteration
            previousItemId = itemId;
        });

        // --- Final State ---
        // Add a final label to mark the end of the last item's animations
        masterTimeline.addLabel("end", ">+0.5"); // Add a bit of padding at the end

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

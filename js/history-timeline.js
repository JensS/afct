/**
 * South African History Timeline Visualization
 * Enhanced with GSAP animations
 */

(function($) {
    $(document).ready(function() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

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
        let isAnimating = false;
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

        // Initialize the visualization
        function init() {
            projection = d3.geoMercator()
                .center([20, 20])
                .scale(config.mapWidth / 3)
                .translate([config.mapWidth / 2, config.mapHeight / 2]);
            
            initMap();
            addTimelineMarkerStyles();
            
            // Show welcome message with GSAP animation
            gsap.delayedCall(0.5, () => {
                showWelcomeMessage();
                updateMapZoom({map_zoom: "africa"}, () => {});
                updateArrowStates(-1, getParagraphItems().length);
            });
            
            initTimelineContent();
            initScrollHandler();
        }

        // Create timeline markers UI styles
        function addTimelineMarkerStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .timeline-markers {
                    position: fixed;
                    bottom: 20px;
                    left: 0;
                    width: 100%;
                    height: 60px;
                    z-index: 1000;
                    pointer-events: none;
                }
                
                .timeline-band-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .timeline-band {
                    position: absolute;
                    height: 40px;
                    bottom: 0;
                    transform: translateX(50%);
                    white-space: nowrap;
                }
                
                .timeline-fade {
                    position: absolute;
                    bottom: 0;
                    height: 40px;
                    width: 20%;
                    z-index: 1;
                    pointer-events: none;
                }
                
                .timeline-fade.left {
                    left: 0;
                    background: linear-gradient(to right, var(--background) 0%, transparent 100%);
                }
                
                .timeline-fade.right {
                    right: 0;
                    background: linear-gradient(to left, var(--background) 0%, transparent 100%);
                }
                
                .timeline-center-indicator {
                    position: absolute;
                    left: 50%;
                    bottom: 0;
                    height: 40px;
                    width: 1px;
                    background-color: var(--red);
                    transform: translateX(-50%);
                    z-index: 2;
                }
                
                .timeline-marker {
                    position: absolute;
                    bottom: 0;
                    width: 1px;
                    background-color: var(--red);
                    transform: translateX(-50%);
                    opacity: 0.3;
                    pointer-events: auto;
                    cursor: pointer;
                }
                
                .timeline-marker.century-marker {
                    height: 30px;
                    opacity: 0.8;
                }
                
                .timeline-marker.decade-marker {
                    height: 20px;
                    opacity: 0.5;
                }
                
                .timeline-marker.year-marker {
                    height: 10px;
                    opacity: 0.3;
                }
                
                .timeline-marker.chapter-marker {
                    height: 35px;
                    opacity: 1;
                    background-color: var(--text);
                }
                
                .timeline-marker.active {
                    opacity: 1;
                    background-color: var(--red);
                }
                
                .marker-year {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 12px;
                    color: var(--text);
                    white-space: nowrap;
                    margin-bottom: 5px;
                }
            `;
            document.head.appendChild(styleElement);
        }

        // Show welcome message with GSAP animation
        function showWelcomeMessage() {
            clearAllVisualizations();
            
            const layer = map.select("#event-layer");
            
            // Add title with GSAP animation
            const title = layer.append("text")
                .attr("class", "welcome-title")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 - 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "var(--text)")
                .text("South African History Timeline")
                .attr("opacity", 0);

            gsap.to(title.node(), {
                opacity: 1,
                duration: 0.75,
                ease: "power2.inOut"
            });
            
            // Add instructions with GSAP animation
            const instructions = layer.append("text")
                .attr("class", "welcome-instructions")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--text)")
                .text("Use the arrows to navigate through history")
                .attr("opacity", 0);

            gsap.to(instructions.node(), {
                opacity: 1,
                duration: 0.75,
                delay: 0.25,
                ease: "power2.inOut"
            });
            
            // Add start instruction with GSAP animation
            const startInstructions = layer.append("text")
                .attr("class", "welcome-start")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--red)")
                .text("Click the right arrow to begin →")
                .attr("opacity", 0);

            gsap.to(startInstructions.node(), {
                opacity: 1,
                duration: 0.75,
                delay: 0.5,
                ease: "power2.inOut"
            });
        }

        // Load history data
        function loadHistoryData() {
            const visualizationDataEl = document.getElementById('visualization-data');
            if (visualizationDataEl?.dataset.historyEntries) {
                try {
                    historyData = JSON.parse(visualizationDataEl.dataset.historyEntries);
                    if (Array.isArray(historyData)) {
                        cachedParagraphItems = null;
                        init();
                        return;
                    }
                } catch (e) {
                    console.error("Error parsing history entries:", e);
                }
            }
            
            $.ajax({
                url: afctSettings.historyDataUrl,
                method: 'GET',
                cache: false,
                beforeSend: function(xhr) {
                    if (afctSettings.historyNonce) {
                        xhr.setRequestHeader('X-WP-Nonce', afctSettings.historyNonce);
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
                    console.error("Failed to load history data:", error);
                }
            });
        }
        
        // Initialize the African map
        function initMap() {
            const svg = d3.select("#map-container")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${config.mapWidth} ${config.mapHeight}`);
            
            map = svg;
            
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
            
            updateArrowStates(0, paragraphItems.length);
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
                    <div class="timeline-item" data-id="${item.id}" data-year-start="${item.year_start}">
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
                if ($(this).hasClass('disabled') || isAnimating) return;
                
                const visibleItem = $('.timeline-item:visible');
                if (!visibleItem.length) {
                    transitionToItem(paragraphItems[0], 0, paragraphItems.length);
                    return;
                }
                
                const currentId = parseInt(visibleItem.attr('data-id'));
                const currentIndex = paragraphItems.findIndex(item => item.id === currentId);
                
                if (currentIndex > 0) {
                    transitionToItem(paragraphItems[currentIndex - 1], currentIndex - 1, paragraphItems.length);
                }
            });
            
            $('#the-history').off('click', '.carousel-arrow.next').on('click', '.carousel-arrow.next', function(e) {
                e.preventDefault();
                if ($(this).hasClass('disabled') || isAnimating) return;
                
                const visibleItem = $('.timeline-item:visible');
                const paragraphItems = getParagraphItems();
                
                if (!visibleItem.length) {
                    clearAllVisualizations();
                    transitionToItem(paragraphItems[0], 0, paragraphItems.length);
                    return;
                }
                
                const currentId = parseInt(visibleItem.attr('data-id'));
                const currentIndex = paragraphItems.findIndex(item => item.id === currentId);
                
                if (currentIndex < paragraphItems.length - 1) {
                    transitionToItem(paragraphItems[currentIndex + 1], currentIndex + 1, paragraphItems.length);
                }
            });
        }

        // Transition to a specific item
        function transitionToItem(item, currentIndex, totalItems) {
            if (isAnimating || !item?.year_start || !item.id) return;
            
            isAnimating = true;
            currentYear = item.year_start;
            
            clearAllVisualizations();
            
            const visualizationsToShow = item.visualizations || [];
            
            updateMapZoom(item, () => {
                visualizationsToShow.forEach(viz => {
                    switch(viz.type) {
                        case "arrow":
                            createArrowVisualization(viz);
                            break;
                        case "dot":
                            createDotVisualization(viz);
                            break;
                        case "dots":
                            createDotsVisualization(viz);
                            break;
                        case "arrows":
                            if (viz.arrows?.length) {
                                viz.arrows.forEach((arrow, i) => {
                                    createArrowVisualization({
                                        type: "arrow",
                                        origin: arrow.origin,
                                        destination: arrow.destination,
                                        label: i === 0 ? viz.label : null
                                    });
                                });
                            }
                            break;
                    }
                });
            });
            
            updateTimelineMarker(item.year_start);
            
            const timelineItem = $(`.timeline-item[data-id="${item.id}"]`);
            if (!timelineItem.length) {
                console.error('Timeline item not found:', item.id);
                isAnimating = false;
                return;
            }
            
            gsap.to(".timeline-item", {
                autoAlpha: 0,
                duration: 0.3,
                onComplete: () => {
                    $(".timeline-item").hide();
                    timelineItem.show();
                    gsap.to(timelineItem, {
                        autoAlpha: 1,
                        duration: 0.3,
                        onComplete: () => {
                            isAnimating = false;
                        }
                    });
                }
            });
            
            updateArrowStates(currentIndex, totalItems);
        }

        // Clear all visualizations
        function clearAllVisualizations() {
            ["#migration-layer", "#language-layer", "#event-layer"].forEach(layer => {
                const elements = map.select(layer).selectAll("*");
                gsap.to(elements.nodes(), {
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    onComplete: () => elements.remove()
                });
            });
        }

        // Create arrow visualization
        function createArrowVisualization(viz) {
            if (!viz.origin || !viz.destination) return;
            
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
                .attr("data-dest-y", viz.destination[1]);
            
            gsap.to(line.node(), {
                opacity: 1,
                duration: 0.5,
                ease: "power2.inOut"
            });
            
            // Create origin marker
            const originMarker = layer.append("circle")
                .attr("class", "origin-marker")
                .attr("cx", originPos[0])
                .attr("cy", originPos[1])
                .attr("r", 5)
                .attr("fill", "var(--red)")
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1]);
            
            gsap.to(originMarker.node(), {
                opacity: 1,
                duration: 0.5,
                delay: 0.2,
                ease: "power2.inOut"
            });
            
            // Create destination marker
            const destMarker = layer.append("circle")
                .attr("class", "destination-marker")
                .attr("cx", destPos[0])
                .attr("cy", destPos[1])
                .attr("r", 5)
                .attr("fill", "var(--red)")
                .attr("opacity", 0)
                .attr("data-x", viz.destination[0])
                .attr("data-y", viz.destination[1]);
            
            gsap.to(destMarker.node(), {
                opacity: 1,
                duration: 0.5,
                delay: 0.4,
                ease: "power2.inOut"
            });
            
            // Add label if provided
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
                    .attr("data-offset", -10);
                
                gsap.to(label.node(), {
                    opacity: 1,
                    duration: 0.5,
                    delay: 0.6,
                    ease: "power2.inOut"
                });
            }
        }

        // Create dot visualization
        function createDotVisualization(viz) {
            if (!viz.origin) return;
            
            const layer = map.select("#event-layer");
            const pos = projection(viz.origin);
            
            // Create dot with GSAP animation
            const dot = layer.append("circle")
                .attr("class", "event-marker")
                .attr("cx", pos[0])
                .attr("cy", pos[1])
                .attr("r", 8)
                .attr("fill", "var(--red)")
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1]);
            
            gsap.to(dot.node(), {
                opacity: 1,
                scale: 1.2,
                duration: 0.5,
                ease: "power2.inOut",
                yoyo: true,
                repeat: -1
            });
            
            // Add label if provided
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
                    .attr("data-offset", 20);
                
                gsap.to(label.node(), {
                    opacity: 1,
                    duration: 0.5,
                    delay: 0.2,
                    ease: "power2.inOut"
                });
            }
        }

        // Create dots visualization
        function createDotsVisualization(viz) {
            if (!viz.origin) return;
            
            const layer = map.select("#language-layer");
            const pos = projection(viz.origin);
            
            // Create central dot
            const centralDot = layer.append("circle")
                .attr("class", "language-bubble")
                .attr("cx", pos[0])
                .attr("cy", pos[1])
                .attr("r", 15)
                .attr("fill", "var(--red)")
                .attr("opacity", 0)
                .attr("data-x", viz.origin[0])
                .attr("data-y", viz.origin[1]);
            
            gsap.to(centralDot.node(), {
                opacity: 0.8,
                scale: 1.2,
                duration: 1,
                ease: "power2.inOut",
                yoyo: true,
                repeat: -1
            });
            
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
                        .attr("opacity", 0)
                        .attr("data-x", coord[0])
                        .attr("data-y", coord[1]);
                    
                    gsap.to(dot.node(), {
                        opacity: 0.8,
                        scale: 1.2,
                        duration: 1,
                        delay: i * 0.2,
                        ease: "power2.inOut",
                        yoyo: true,
                        repeat: -1
                    });
                    
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
                            .attr("data-offset", 20);
                        
                        gsap.to(label.node(), {
                            opacity: 1,
                            duration: 0.5,
                            delay: (i * 0.2) + 0.2,
                            ease: "power2.inOut"
                        });
                    }
                });
            }
            
            // Add main label if provided
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
                    .attr("data-offset", -25);
                
                gsap.to(label.node(), {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            }
        }

        // Update map zoom
        function updateMapZoom(item, callback) {
            let mapZoom = item.map_zoom || "europe_and_africa";
            
            const zoomSettings = {
                europe_and_africa: { center: [20, 30], scale: config.mapWidth / 4 },
                africa: { center: [25, 0], scale: config.mapWidth / 2 },
                south_africa: { center: [25, -25], scale: config.mapWidth * 1.2 },
                southern_africa: { center: [25, -25], scale: config.mapWidth * 0.8 },
                world: { center: [20, 10], scale: config.mapWidth / 6 }
            
        }

        // Update timeline content based on year
        function updateTimelineContent(year) {
            if (isAnimating) return;
            
            const paragraphItems = getParagraphItems();
            const visibleItem = $(".timeline-item:visible");
            
            let currentVisibleIndex = -1;
            if (visibleItem.length) {
                const currentId = parseInt(visibleItem.attr('data-id'));
                currentVisibleIndex = paragraphItems.findIndex(item => item.id === currentId);
            }
            
            const itemsForYear = paragraphItems.reduce((acc, item, index) => {
                if (year >= item.year_start) {
                    acc.push(index);
                }
                return acc;
            }, []);
            
            let targetIndex;
            if (itemsForYear.length) {
                const currentInYearIndex = itemsForYear.indexOf(currentVisibleIndex);
                if (currentInYearIndex === -1 || currentInYearIndex === itemsForYear.length - 1) {
                    targetIndex = itemsForYear[0];
                } else {
                    targetIndex = itemsForYear[currentInYearIndex + 1];
                }
            } else {
                const closestItem = paragraphItems.reduce((closest, item, index) => {
                    const diff = Math.abs(year - item.year_start);
                    
                    if (closest === null || diff < closest.diff) {
                        return { index, diff: diff };
                    }
                    return closest;
                }, null);
                
                targetIndex = closestItem ? closestItem.index : 0; // Default to first item if no match found
            }
            
            // Validate paragraphItems and targetIndex
            if (!paragraphItems || paragraphItems.length === 0) {
                console.error('No paragraph items available');
                return;
            }
            
            if (typeof targetIndex !== 'number' || targetIndex < 0 || targetIndex >= paragraphItems.length) {
                console.error('Invalid target index:', targetIndex);
                return;
            }
            
            const targetItem = paragraphItems[targetIndex];
            if (!targetItem) {
                console.error('Target item not found at index:', targetIndex);
                return;
            }
            
            const currentVisibleId = visibleItem.length ? parseInt(visibleItem.attr('data-id')) : null;
            
            if (!visibleItem.length || targetItem.id !== currentVisibleId) {
                transitionToItem(targetItem, targetIndex, paragraphItems.length);
            }
        }

        // Update the updateTimelineMarker function to correctly center the active year
        function updateTimelineMarker(year) {
            // Find the marker for this year
            const marker = $(`.timeline-marker[data-year="${year}"]`);
            
            if (marker.length) {
                // Get the marker's position
                const markerPosition = marker.position().left;
                
                // Calculate the offset to center this marker
                const bandContainer = $('.timeline-band-container');
                const containerCenter = bandContainer.width() / 2;
                
                // Update the band position to center the marker
                $('.timeline-band').css('transform', `translateX(calc(50% - ${markerPosition}px))`);
                
                // Highlight the active marker
                $('.timeline-marker').removeClass('active');
                marker.addClass('active');
            } else {
                // If no exact marker exists for this year, find the closest one
                console.log("No marker found for year:", year);
                
                // Get all markers and their years
                const markers = $('.timeline-marker');
                let closestMarker = null;
                let minDiff = Infinity;
                
                markers.each(function() {
                    const markerYear = parseInt($(this).data('year'));
                    const diff = Math.abs(markerYear - year);
                    
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestMarker = $(this);
                    }
                });
                
                if (closestMarker) {
                    const markerPosition = closestMarker.position().left;
                    $('.timeline-band').css('transform', `translateX(calc(50% - ${markerPosition}px))`);
                    $('.timeline-marker').removeClass('active');
                    closestMarker.addClass('active');
                }
            }
        }

        // Initialize scroll handler
        function initScrollHandler() {
            const timelineInfo = $('#timeline-info');
            const timelineMarkers = $('.timeline-markers');
            const timelineContent = $('#timeline-content');
            const historySection = $('#the-history');
            
            // Hide all timeline items initially
            $(".timeline-item").hide();
            
            $(window).on('scroll', function() {
                const historyRect = historySection[0].getBoundingClientRect();
                const isHistoryVisible = 
                    historyRect.top < window.innerHeight && 
                    historyRect.bottom > 0;
                
                timelineMarkers.toggle(isHistoryVisible);
                timelineInfo.toggle(isHistoryVisible);
                timelineContent.toggle(isHistoryVisible);
            }).trigger('scroll');
            
            // Add click handlers to timeline markers
            $(document).off('click', '.timeline-marker').on('click', '.timeline-marker', function() {
                if (isAnimating) return;
                
                const year = parseInt($(this).data('year'));
                currentYear = year;
                
                // Find paragraph items for this year
                const paragraphItems = getParagraphItems();
                const itemsForYear = paragraphItems.filter(item => 
                    item.year_start === year
                );
                
                // If there's a paragraph item for this year, transition to it
                if (itemsForYear.length > 0) {
                    const targetItem = itemsForYear[0];
                    const targetIndex = paragraphItems.findIndex(item => item.id === targetItem.id);
                    transitionToItem(targetItem, targetIndex, paragraphItems.length);
                } else {
                    // Otherwise just update the visualization
                    clearAllVisualizations();
                    updateVisualization(year);
                }
            });
        }

        // Update map zoom
        function updateMapZoom(item, callback) {
            let mapZoom = item.map_zoom || "europe_and_africa";
            
            const zoomSettings = {
                europe_and_africa: { center: [20, 30], scale: config.mapWidth / 4 },
                africa: { center: [25, 0], scale: config.mapWidth / 2 },
                south_africa: { center: [25, -25], scale: config.mapWidth * 1.2 },
                southern_africa: { center: [25, -25], scale: config.mapWidth * 0.8 },
                world: { center: [20, 10], scale: config.mapWidth / 6 }
            };
            
            // Get zoom settings or use defaults
            const settings = zoomSettings[mapZoom] || zoomSettings.europe_and_africa;
            
            // Add transition duration to config if not exists
            if (!config.zoomTransitionDuration) {
                config.zoomTransitionDuration = 1000; // 1 second transition
            }
            
            const t = d3.transition().duration(config.zoomTransitionDuration);
            const oldProjection = {
                center: projection.center(),
                scale: projection.scale()
            };
            
            projection.center(settings.center).scale(settings.scale);
            
            map.selectAll("path")
                .transition(t)
                .attrTween("d", function() {
                    const d = d3.select(this).attr("d");
                    const interpolate = d3.interpolate(
                        [oldProjection.center, oldProjection.scale],
                        [settings.center, settings.scale]
                    );
                    return function(t) {
                        const i = interpolate(t);
                        projection.center(i[0]).scale(i[1]);
                        return d3.geoPath().projection(projection)(d3.select(this).datum());
                    };
                })
                .on("end", function() {
                    // Call the callback when the transition is complete
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            
            updateAnimationPositions(t);
        }
        }

        // Update animation positions
        function updateAnimationPositions(transition) {
            const layers = ["migration-layer", "language-layer", "event-layer"];
            layers.forEach(layer => {
                map.select(`#${layer}`).selectAll("*").each(function() {
                    const element = d3.select(this);
                    
                    if (element.classed("migration-line")) {
                        const originPos = projection([
                            parseFloat(element.attr("data-origin-x")),
                            parseFloat(element.attr("data-origin-y"))
                        ]);
                        const destPos = projection([
                            parseFloat(element.attr("data-dest-x")),
                            parseFloat(element.attr("data-dest-y"))
                        ]);
                        
                        element.transition(transition)
                            .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`);
                    } else if (element.classed("language-bubble") || element.classed("event-marker")) {
                        const pos = projection([
                            parseFloat(element.attr("data-x")),
                            parseFloat(element.attr("data-y"))
                        ]);
                        
                        element.transition(transition)
                            .attr("cx", pos[0])
                            .attr("cy", pos[1]);
                    } else if (element.classed("language-label") || element.classed("event-label")) {
                        const pos = projection([
                            parseFloat(element.attr("data-x")),
                            parseFloat(element.attr("data-y"))
                        ]);
                        
                        element.transition(transition)
                            .attr("x", pos[0])
                            .attr("y", pos[1] + parseFloat(element.attr("data-offset") || "0"));
                    }
                });
            });
        }

        // Update country highlights
        function updateCountryHighlights(activeKeyframes) {
            map.selectAll(".country")
                .transition()
                .duration(300)
                .attr("opacity", d => d.id === 710 ? 1 : 0.3);
            
            activeKeyframes.forEach(keyframe => {
                if (keyframe.highlight_country) {
                    const countryCode = getCountryCode(keyframe.highlight_country);
                    if (countryCode) {
                        map.select(`.country-${countryCode}`)
                            .transition()
                            .duration(300)
                            .attr("opacity", 1);
                    }
                }
            });
        }

        // Create new visualization functions
        function createArrowVisualization(viz, yearStart) {
            const id = `arrow-${yearStart}-${Math.random().toString(36).substr(2, 5)}`;
            const layer = map.select("#migration-layer");
            
            if (viz.origin && viz.destination) {
                const originPos = projection(viz.origin);
                const destPos = projection(viz.destination);
                
                // Create the animated dotted line
                layer.append("path")
                    .attr("class", `migration-line ${id}`)
                    .attr("data-origin-x", viz.origin[0])
                    .attr("data-origin-y", viz.origin[1])
                    .attr("data-dest-x", viz.destination[0])
                    .attr("data-dest-y", viz.destination[1])
                    .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
                    .attr("stroke", "var(--red)") // Use --red color
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "4, 4") // Ensure dotted line is visible
                    .attr("fill", "none");
                
                // Add origin marker (pulsing dot)
                layer.append("circle")
                    .attr("class", `origin-marker ${id}`)
                    .attr("cx", originPos[0])
                    .attr("cy", originPos[1])
                    .attr("r", 5)
                    .attr("fill", "var(--red)") // Use --red color
                    .attr("stroke", "none"); // No border
                
                // Add destination marker (pulsing dot)
                layer.append("circle")
                    .attr("class", `destination-marker ${id}`)
                    .attr("cx", destPos[0])
                    .attr("cy", destPos[1])
                    .attr("r", 5)
                    .attr("fill", "var(--red)") // Use --red color
                    .attr("stroke", "none"); // No border
                
                // Add label if provided
                if (viz.label) {
                    layer.append("text")
                        .attr("class", `migration-label ${id}`)
                        .attr("x", (originPos[0] + destPos[0]) / 2)
                        .attr("y", (originPos[1] + destPos[1]) / 2 - 10)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--red)") // Use --red color
                        .text(viz.label);
                }
            }
        }

        // Debug function to help diagnose visualization issues
        function debugVisualization(item) {
            console.log("Visualizing item:", item);
            if (item.visualizations) {
                console.log("Visualizations:", item.visualizations);
                item.visualizations.forEach((viz, i) => {
                    console.log(`Visualization ${i}:`, viz);
                    if (viz.type === "dots" && viz.dotCoordinates) {
                        console.log("Dot coordinates:", viz.dotCoordinates);
                    }
                });
            }
        }

        function createDotVisualization(viz, yearStart) {
            const id = `dot-${yearStart}-${Math.random().toString(36).substr(2, 5)}`;
            const layer = map.select("#event-layer");
            
            if (viz.origin) {
                const pos = projection(viz.origin);
                
                // Create pulsing dot
                layer.append("circle")
                    .attr("class", `event-marker ${id}`)
                    .attr("data-x", viz.origin[0])
                    .attr("data-y", viz.origin[1])
                    .attr("cx", pos[0])
                    .attr("cy", pos[1])
                    .attr("r", 8)
                    .attr("fill", "var(--red)") // Use --red color
                    .attr("stroke", "none"); // No border
                
                if (viz.label) {
                    layer.append("text")
                        .attr("class", `event-label ${id}`)
                        .attr("data-x", viz.origin[0])
                        .attr("data-y", viz.origin[1])
                        .attr("data-offset", 20)
                        .attr("x", pos[0])
                        .attr("y", pos[1] + 20)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--red)") // Use --red color
                        .text(viz.label);
                }
            }
        }

        function createDotsVisualization(viz, yearStart) {
            const id = `dots-${yearStart}-${Math.random().toString(36).substr(2, 5)}`;
            const layer = map.select("#language-layer");
            
            if (viz.origin) {
                const pos = projection(viz.origin);
                
                // Create a central bubble (pulsing)
                layer.append("circle")
                    .attr("class", `language-bubble ${id}`)
                    .attr("data-x", viz.origin[0])
                    .attr("data-y", viz.origin[1])
                    .attr("cx", pos[0])
                    .attr("cy", pos[1])
                    .attr("r", 15)
                    .attr("fill", "var(--red)") // Use --red color
                    .attr("stroke", "none"); // No border
                
                // Add dot coordinates if available
                if (viz.dotCoordinates && viz.dotCoordinates.length > 0) {
                    viz.dotCoordinates.forEach((coord, i) => {
                        if (!coord || !Array.isArray(coord) || coord.length < 2) {
                            console.error("Invalid dot coordinate:", coord);
                            return;
                        }
                        
                        const dotPos = projection(coord);
                        
                        // Add pulsing dots with sequential appearance
                        layer.append("circle")
                            .attr("class", `language-bubble ${id}`)
                            .attr("data-x", coord[0])
                            .attr("data-y", coord[1])
                            .attr("cx", dotPos[0])
                            .attr("cy", dotPos[1])
                            .attr("r", 8)
                            .attr("fill", "var(--red)") // Use --red color
                            .attr("stroke", "none") // No border
                            .style("animation-delay", `${i * 0.2}s`); // Stagger the animation
                        
                        // If we have labels in the visualization and they match the number of dots, add labels
                        if (viz.labels && viz.labels[i]) {
                            layer.append("text")
                                .attr("class", `language-label ${id}`)
                                .attr("data-x", coord[0])
                                .attr("data-y", coord[1])
                                .attr("data-offset", 20)
                                .attr("x", dotPos[0])
                                .attr("y", dotPos[1] + 20)
                                .attr("text-anchor", "middle")
                                .attr("fill", "var(--red)") // Use --red color
                                .text(viz.labels[i]);
                        }
                    });
                }
                // If no dot coordinates but we have labels, create dots in a circle around origin
                else if (viz.labels && viz.labels.length > 0) {
                    viz.labels.forEach((label, i) => {
                        const angle = (2 * Math.PI * i) / viz.labels.length;
                        const radius = 40;
                        const x = pos[0] + radius * Math.cos(angle);
                        const y = pos[1] + radius * Math.sin(angle);
                        
                        // Add pulsing dots in a circle
                        layer.append("circle")
                            .attr("class", `language-bubble ${id}`)
                            .attr("cx", x)
                            .attr("cy", y)
                            .attr("r", 8)
                            .attr("fill", "var(--red)") // Use --red color
                            .attr("stroke", "none") // No border
                            .style("animation-delay", `${i * 0.2}s`); // Stagger the animation
                        
                        layer.append("text")
                            .attr("class", `language-label ${id}`)
                            .attr("x", x)
                            .attr("y", y + 20)
                            .attr("text-anchor", "middle")
                            .attr("fill", "var(--red)") // Use --red color
                            .text(label);
                    });
                }
                
                if (viz.label) {
                    layer.append("text")
                        .attr("class", `language-label ${id}`)
                        .attr("data-x", viz.origin[0])
                        .attr("data-y", viz.origin[1])
                        .attr("x", pos[0])
                        .attr("y", pos[1] - 25)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--red)") // Use --red color
                        .text(viz.label);
                }
            }
        }

        // Add migration markers and labels
        function addMigrationMarkers(layer, id, originPos, destPos, label) {
            layer.append("circle")
                .attr("class", `origin-marker ${id}`)
                .attr("cx", originPos[0])
                .attr("cy", originPos[1])
                .attr("r", 5)
                .attr("fill", config.colors.migration)
                .attr("stroke", "var(--background)")
                .attr("opacity", 0)
                .transition()
                .duration(config.animationDuration)
                .attr("opacity", 1);
            
            if (label) {
                layer.append("text")
                    .attr("class", `migration-label ${id}`)
                    .attr("x", (originPos[0] + destPos[0]) / 2)
                    .attr("y", (originPos[1] + destPos[1]) / 2 - 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--text)")
                    .text(label)
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 1);
            }
        }

        // Create multiple migrations
        function createMultipleMigrations(layer, id, animation) {
            animation.originPoints.forEach((origin, i) => {
                const originPos = projection(origin);
                
                layer.append("circle")
                    .attr("class", `origin-marker ${id}`)
                    .attr("cx", originPos[0])
                    .attr("cy", originPos[1])
                    .attr("r", 4)
                    .attr("fill", config.colors.migration)
                    .attr("stroke", "var(--background)")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 1);
                
                animation.destinationPoints.forEach((dest, j) => {
                    const destPos = projection(dest);
                    
                    layer.append("path")
                        .attr("class", `migration-line ${id}`)
                        .attr("data-origin-x", origin[0])
                        .attr("data-origin-y", origin[1])
                        .attr("data-dest-x", dest[0])
                        .attr("data-dest-y", dest[1])
                        .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
                        .attr("stroke", config.colors.migration)
                        .attr("stroke-width", 1.5)
                        .attr("stroke-dasharray", "3,3")
                        .attr("opacity", 0)
                        .transition()
                        .duration(config.animationDuration)
                        .delay(j * 100)
                        .attr("opacity", 0.6);
                });
            });
            
            if (animation.label) {
                layer.append("text")
                    .attr("class", `migration-label ${id}`)
                    .attr("x", config.mapWidth / 2)
                    .attr("y", 30)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--text)")
                    .text(animation.label)
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 1);
            }
        }

        // Create language animation
        function createLanguageAnimation(animation, yearStart) {
            const id = `language-${yearStart}`;
            const layer = map.select("#language-layer");
            
            if (animation.languages) {
                animation.languages.forEach((lang, i) => {
                    const pos = projection(lang.position);
                    
                    layer.append("circle")
                        .attr("class", `language-bubble ${id}`)
                        .attr("data-x", lang.position[0])
                        .attr("data-y", lang.position[1])
                        .attr("cx", pos[0])
                        .attr("cy", pos[1])
                        .attr("r", lang.size || 10)
                        .attr("fill", config.colors[animation.type] || config.colors.migration)
                        .attr("stroke", "var(--background)")
                        .attr("opacity", 0)
                        .classed("transitioning", true)
                        .transition()
                        .duration(config.animationDuration)
                        .attr("opacity", 0.7);
                    
                    if (lang.name) {
                        layer.append("text")
                            .attr("class", `language-label ${id}`)
                            .attr("data-x", lang.position[0])
                            .attr("data-y", lang.position[1])
                            .attr("data-offset", 20)
                            .attr("x", pos[0])
                            .attr("y", pos[1] + 20)
                            .attr("text-anchor", "middle")
                            .attr("fill", "var(--text)")
                            .text(lang.name)
                            .attr("opacity", 0)
                            .classed("transitioning", true)
                            .transition()
                            .duration(config.animationDuration)
                            .attr("opacity", 1);
                    }
                });
            }
            
            if (animation.label) {
                layer.append("text")
                    .attr("class", `language-label ${id}`)
                    .attr("x", config.mapWidth / 2)
                    .attr("y", 30)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--text)")
                    .text(animation.label)
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 1);
            }
        }
        
        // Create event animation
        function createEventAnimation(animation, yearStart) {
            const id = `event-${yearStart}`;
            const layer = map.select("#event-layer");
            
            if (animation.position) {
                const pos = projection(animation.position);
                
                layer.append("circle")
                    .attr("class", `event-marker ${id}`)
                    .attr("data-x", animation.position[0])
                    .attr("data-y", animation.position[1])
                    .attr("cx", pos[0])
                    .attr("cy", pos[1])
                    .attr("r", 8)
                    .attr("fill", "#ff9800")
                    .attr("stroke", "var(--background)")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 0.8);
                
                if (animation.label) {
                    layer.append("text")
                        .attr("class", `event-label ${id}`)
                        .attr("data-x", animation.position[0])
                        .attr("data-y", animation.position[1])
                        .attr("data-offset", 20)
                        .attr("x", pos[0])
                        .attr("y", pos[1] + 20)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--text)")
                        .text(animation.label)
                        .attr("opacity", 0)
                        .transition()
                        .duration(config.animationDuration)
                        .attr("opacity", 1);
                }
            }
        }
        
        // Deactivate keyframe
        function deactivateKeyframe(item) {
            if (item.visualizations) {
                item.visualizations.forEach(viz => {
                    const idPrefix = `${viz.type}-${item.year_start}`;
                    
                    map.selectAll(`[class*="${idPrefix}"]`)
                        .transition()
                        .duration(config.animationDuration / 2)
                        .attr("opacity", 0)
                        .remove();
                });
            }
        }
        
        // Helper function to get country code
        function getCountryCode(countryName) {
            const countryMap = {
                "South Africa": 710,
                "Namibia": 516,
                "Botswana": 72,
                "Zimbabwe": 716,
                "Mozambique": 508,
                "Lesotho": 426,
                "Swaziland": 748,
                "Angola": 24,
                "Zambia": 894,
                "Malawi": 454,
                "Tanzania": 834,
                "Democratic Republic of the Congo": 180,
                "Congo": 178,
                "Kenya": 404,
                "Uganda": 800,
                "Rwanda": 646,
                "Burundi": 108,
                "Ethiopia": 231,
                "Somalia": 706,
                "Sudan": 736,
                "South Sudan": 728,
                "Central African Republic": 140,
                "Chad": 148,
                "Niger": 562,
                "Nigeria": 566,
                "Cameroon": 120,
                "Ghana": 288,
                "Ivory Coast": 384,
                "Guinea": 324,
                "Senegal": 686,
                "Mali": 466,
                "Burkina Faso": 854,
                "Benin": 204,
                "Togo": 768,
                "Liberia": 430,
                "Sierra Leone": 694,
                "Guinea-Bissau": 624,
                "Gambia": 270,
                "Mauritania": 478,
                "Western Sahara": 732,
                "Morocco": 504,
                "Algeria": 12,
                "Tunisia": 788,
                "Libya": 434,
                "Egypt": 818,
                "Eritrea": 232,
                "Djibouti": 262,
                "Madagascar": 450,
                "Comoros": 174,
                "Mauritius": 480,
                "Seychelles": 690,
                "Cape Verde": 132,
                "Sao Tome and Principe": 678,
                "Equatorial Guinea": 226,
                "Gabon": 266
            };
            
            return countryMap[countryName];
        }
        
        // Load history data
        loadHistoryData();
    });
})(jQuery);

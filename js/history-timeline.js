/**
 * South African History Timeline Visualization
 * Enhanced with GSAP animations
 */

(function($) {
    $(document).ready(function() {

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
            
            initMap();
            addTimelineMarkerStyles();

            // Initialize and build the master timeline
            masterTimeline = gsap.timeline({
                paused: true,
                onUpdate: updateTimelineArrowStates, // Update arrows during tweening
                onComplete: updateTimelineArrowStates, // Update arrows on completion
                onReverseComplete: updateTimelineArrowStates // Update arrows on reverse completion
            });
            buildMasterTimeline(); // Build the timeline structure

            // Initialize UI elements after timeline structure is ready
            initTimelineContent();
            initScrollHandler();

            // Set initial state (show welcome) without auto-playing the timeline
            masterTimeline.seek("welcome"); // Go to the start without animating
            updateTimelineArrowStates(); // Set initial arrow state for welcome screen
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

        // Show welcome message - Creates elements, returns nodes for timeline animation
        function showWelcomeMessage() {
            // Clear any previous non-timeline visualizations if necessary
            // clearAllVisualizations(); // This might be redundant if timeline handles clearing

            const layer = map.select("#event-layer");
            const elements = {};

            // Add title
            elements.title = layer.append("text")
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

            // Add instructions
            elements.instructions = layer.append("text")
                .attr("class", "welcome-instructions")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--text)")
                .text("Use the arrows to navigate through history")
                .attr("opacity", 0) // Start invisible
                .node();

            // Add start instruction
            elements.startInstructions = layer.append("text")
                .attr("class", "welcome-start")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--red)")
                .text("Click the right arrow to begin →")
                .attr("opacity", 0) // Start invisible
                .node();

            return elements; // Return the DOM nodes
        }


        // Load history data
        function loadHistoryData() {
            const visualizationDataEl = document.getElementById('visualization-data');
            console.log('Visualization data element:', visualizationDataEl);
            
            if (visualizationDataEl?.dataset.historyEntries) {
                try {
                    const rawData = visualizationDataEl.dataset.historyEntries;
                    console.log('Raw history data:', rawData);
                    
                    historyData = JSON.parse(rawData);
                    console.log('Parsed history data:', historyData);
                    
                    if (Array.isArray(historyData)) {
                        cachedParagraphItems = null;
                        init();
                        return;
                    } else {
                        console.error("History data is not an array:", historyData);
                    }
                } catch (e) {
                    console.error("Error parsing history entries:", e);
                    console.error("Raw data causing error:", visualizationDataEl.dataset.historyEntries);
                }
            } else {
                console.error("visualization-data element or historyEntries dataset not found");
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
                if ($(this).hasClass('disabled') || (masterTimeline && masterTimeline.isActive())) return;

                console.log("Prev arrow clicked");
                // Reverse the timeline by one step (tween backwards to previous label)
                masterTimeline.reverse();
            });

            $('#the-history').off('click', '.carousel-arrow.next').on('click', '.carousel-arrow.next', function(e) {
                e.preventDefault();
                if ($(this).hasClass('disabled') || (masterTimeline && masterTimeline.isActive())) return;

                console.log("Next arrow clicked");
                // Play the timeline forward by one step (tween forwards to next label)
                masterTimeline.play();
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
            layers.forEach(layer => {
                // Select all direct children of the layer group to avoid selecting the group itself
                map.select(layer).selectAll(":scope > *").each(function() {
                    // Exclude welcome message elements if they should persist differently
                    if (!d3.select(this).classed('welcome-title') &&
                        !d3.select(this).classed('welcome-instructions') &&
                        !d3.select(this).classed('welcome-start')) {
                        elementsToRemove.push(this);
                    }
                });
            });

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
                    elementsToRemove.forEach(el => el.remove());
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
            if (allElementsToAnimate.length > 0) {
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
            }
        }


        // Build the master GSAP timeline
        function buildMasterTimeline() {
            const paragraphItems = getParagraphItems();
            if (!paragraphItems || paragraphItems.length === 0) {
                console.error("Cannot build timeline: No paragraph items.");
                return;
            }

            masterTimeline.clear(); // Clear any previous timeline

            // --- Initial State (Welcome Message) ---
            masterTimeline.addLabel("welcome");
            const welcomeElements = showWelcomeMessage(); // Create welcome elements
            // Add initial map zoom for welcome screen
            masterTimeline.add(updateMapZoom({ map_zoom: "africa" }), "<"); // Start zoom immediately at welcome label
            // Animate welcome message elements in
            masterTimeline.to([welcomeElements.title, welcomeElements.instructions, welcomeElements.startInstructions], {
                opacity: 1,
                duration: 0.75,
                stagger: 0.2,
                ease: "power2.out"
            }, ">-=0.5"); // Stagger in after map zoom starts
            // Add pulsing arrow animation
            masterTimeline.to(welcomeElements.startInstructions, {
                x: "+=10", // Move right
                repeat: -1, // Repeat indefinitely
                yoyo: true, // Go back and forth
                duration: 0.8,
                ease: "power1.inOut"
            }, ">-0.5"); // Start pulsing near the end of the text fade-in


            // --- Transitions Between Items ---
            let previousItemElement = null; // Keep track of the previous text element

            paragraphItems.forEach((item, index) => {
                const itemLabel = `entry_${item.id}`;
                const itemElement = $(`.timeline-item[data-id="${item.id}"]`);
                const itemYear = item.year_start;

                // --- Add Label for this item ---
                // Position the label. Add a slight delay after welcome or previous item.
                masterTimeline.addLabel(itemLabel, index === 0 ? ">+0.5" : ">+0.3");

                // --- Animations STARTING at itemLabel ---

                // 1. Fade out previous item's text (or welcome message)
                const elementToFadeOut = index === 0
                    ? [welcomeElements.title, welcomeElements.instructions, welcomeElements.startInstructions]
                    : (previousItemElement ? previousItemElement.get(0) : null); // Get DOM node

                if (elementToFadeOut) {
                    // Stop pulsing animation on welcome arrow before fading out
                    if (index === 0) gsap.killTweensOf(welcomeElements.startInstructions);

                    masterTimeline.to(elementToFadeOut, {
                        autoAlpha: 0, // Fades out and sets visibility: hidden
                        duration: 0.4,
                        // Remove welcome elements after fade out if desired
                        // onComplete: index === 0 ? () => d3.selectAll(".welcome-title, .welcome-instructions, .welcome-start").remove() : null
                    }, itemLabel); // Start fade out exactly at the item label
                }

                // 2. Clear previous visualizations
                // Add the clearing tween slightly after the label
                masterTimeline.add(clearAllVisualizations(), itemLabel + "+=0.1");

                // 3. Animate Map Zoom
                // Add the zoom tween, starting slightly after the label
                masterTimeline.add(updateMapZoom(item), itemLabel + "+=0.1");

                // 4. Animate Timeline Band centering
                // Use a .call to get the value, then tween the band
                masterTimeline.call(() => {
                    const targetX = updateTimelineMarker(itemYear); // Update active class and get target X
                    gsap.to('.timeline-band', { // Animate the band using the calculated value
                        x: targetX,
                        duration: 0.8,
                        ease: 'power2.inOut'
                    });
                }, null, itemLabel + "+=0.1"); // Call slightly after label


                // --- Animations STARTING LATER (relative to itemLabel or previous tween) ---

                // 5. Fade In Current Item's Text
                if (itemElement.length) {
                    // Ensure item is visible before fading in (autoAlpha handles display and opacity)
                    masterTimeline.set(itemElement.get(0), { display: 'block', autoAlpha: 0 }); // Ensure it's block for autoAlpha
                    masterTimeline.to(itemElement.get(0), {
                        autoAlpha: 1,
                        duration: 0.5
                    }, ">-0.3"); // Overlap slightly with map zoom/band animation end
                }

                // 6. Render and Animate New Visualizations
                // Use .call() to trigger the rendering function, which adds its own animations to the timeline
                // Start rendering slightly before text is fully visible
                masterTimeline.call(renderVisualizationsForItem, [item, masterTimeline, ">-0.2"], ">-0.2");

                // Store current item element for the next iteration's fade-out
                previousItemElement = itemElement;
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

            // Log state for debugging if needed
            // console.log(`Timeline state: time=${currentTime.toFixed(2)}, duration=${totalDuration.toFixed(2)}, disablePrev=${disablePrev}, disableNext=${disableNext}`);
        }

        // Load history data
        loadHistoryData();
    });
})(jQuery);

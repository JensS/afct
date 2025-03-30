/**
 * South African History Timeline Visualization
 */

(function($) {
    $(document).ready(function() {
        // Configuration
        const config = {
            mapWidth: 800,
            mapHeight: 600,
            minYear: 1000, // Updated to match the earliest year in history.json
            maxYear: 2025,
            animationDuration: 400,
            zoomTransitionDuration: 750,
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
        let activeKeyframes = [];
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

        // Initialize the visualization
        function init() {
            projection = d3.geoMercator()
                .center([20, 20])
                .scale(config.mapWidth / 3)
                .translate([config.mapWidth / 2, config.mapHeight / 2]);
            
            initMap();
            
            // Add styles for the new timeline markers UI
            addTimelineMarkerStyles();
            
            // Add this line to ensure the welcome message is shown after map initialization
            setTimeout(function() {
                showWelcomeMessage();
                // Set default map zoom for welcome screen
                updateMapZoom({map_zoom: "africa"}, function() {
                    // Callback after zoom is complete
                });
                // Update arrow states - only enable next arrow
                updateArrowStates(-1, getParagraphItems().length);
            }, 500); // Small delay to ensure map is ready
            
            initTimelineContent();
            initScrollHandler();
        }
        
        // Function to add CSS for the new timeline markers UI
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
                    transition: transform 0.5s ease;
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
                    width: 2px;
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
                    width: 2px;
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
                    opacity: 1;
                }
                
                .timeline-marker.chapter-marker::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--red);
                }
                
                .timeline-marker.active {
                    opacity: 1;
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
                
                .timeline-marker:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Add welcome message function to display on map initialization
        function showWelcomeMessage() {
            // Clear any existing visualizations
            clearAllVisualizations();
            
            // Get the map container and add welcome text
            const layer = map.select("#event-layer");
            
            // Add a title
            layer.append("text")
                .attr("class", "welcome-title")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 - 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "var(--text)")
                .text("South African History Timeline")
                .attr("opacity", 0)
                .transition()
                .duration(config.animationDuration)
                .attr("opacity", 1);
            
            // Add instructions
            layer.append("text")
                .attr("class", "welcome-instructions")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--text)")
                .text("Use the arrows to navigate through history")
                .attr("opacity", 0)
                .transition()
                .duration(config.animationDuration)
                .attr("opacity", 1);
            
            // Add start instruction
            layer.append("text")
                .attr("class", "welcome-start")
                .attr("x", config.mapWidth / 2)
                .attr("y", config.mapHeight / 2 + 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "var(--red)")
                .text("Click the right arrow to begin →")
                .attr("opacity", 0)
                .transition()
                .duration(config.animationDuration)
                .attr("opacity", 1);
        }

        console.log(afctSettings.historyDataUrl);
        // Load history data from visualization-data element or WordPress REST API
        function loadHistoryData() {
            // Try to get data from the visualization-data element first
            const visualizationDataEl = document.getElementById('visualization-data');
            if (visualizationDataEl && visualizationDataEl.dataset.historyEntries) {
                try {
                    historyData = JSON.parse(visualizationDataEl.dataset.historyEntries);
                    if (Array.isArray(historyData)) {
                        // Don't cache paragraph items
                        cachedParagraphItems = null;
                        init();
                        return;
                    }
                } catch (e) {
                    console.error("Error parsing history entries from data attribute:", e);
                }
            }
            
            // Always make a fresh AJAX request (no caching)
            $.ajax({
                url: afctSettings.historyDataUrl,
                method: 'GET',
                cache: false, // Disable caching
                beforeSend: function(xhr) {
                    if (typeof afctSettings.historyNonce !== 'undefined') {
                        xhr.setRequestHeader('X-WP-Nonce', afctSettings.historyNonce);
                    }
                },
                success: function(data) {
                    if (!Array.isArray(data)) {
                        console.error("History data is not an array:", data);
                        return;
                    }
                    
                    // Validate and filter out invalid items
                    historyData = data.filter(item => {
                        if (!item || typeof item !== 'object') {
                            console.error("Invalid history item:", item);
                            return false;
                        }
                        if (!item.year_start) {
                            console.error("History item missing year_start:", item);
                            return false;
                        }
                        if (item.visualisation === "paragraph" && (!item.history_paragraph || !item.history_paragraph.title)) {
                            console.error("Paragraph item missing required fields:", item);
                            return false;
                        }
                        return true;
                    });
                    
                    if (historyData.length === 0) {
                        console.error("No valid history items found in data");
                        return;
                    }
                    
                    // Don't cache paragraph items
                    cachedParagraphItems = null;
                    
                    init();
                },
                error: function(jqxhr, textStatus, error) {
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
                        .attr("fill", config.colors.migration)
                        .attr("stroke", "var(--background)")
                        .attr("stroke-width", 2)
                        .attr("class", d => "country country-" + d.id)
                        .attr("opacity", d => d.id === 710 ? 1 : 0.3);
                    
                    // South Africa highlight is handled dynamically through the visualization system
                        
                    createAnimationLayers();
                })
                .catch(error => console.error("Error loading map data:", error));
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
            // Clear existing markers
            timelineMarkers.empty();
            
            // Create the container with fade effects
            timelineMarkers.html(`
                <div class="timeline-band-container">
                    <div class="timeline-fade left"></div>
                    <div class="timeline-band"></div>
                    <div class="timeline-fade right"></div>
                    <div class="timeline-center-indicator"></div>
                </div>
            `);
            
            const timelineBand = timelineMarkers.find('.timeline-band');
            
            // Get all years from history data
            const years = getAllHistoryYears();
            
            // Create the timeline band with markers
            createTimelineBandMarkers(timelineBand, years);
        }

        // Function to get all years from history data
        function getAllHistoryYears() {
            // Get all paragraph items to ensure we have markers for all chapters
            const paragraphItems = getParagraphItems();
            
            // Create a set of significant years from both paragraph items and map animations
            const years = new Set();
            
            // Add years from paragraph items (chapters) first
            paragraphItems.forEach(item => {
                years.add(item.year_start);
                if (item.year_end && item.year_end !== item.year_start) years.add(item.year_end);
            });
            
            // Add years from map animations
            historyData.filter(item => item.visualisation === "map").forEach(item => {
                years.add(item.year_start);
                if (item.year_end && item.year_end !== item.year_start) years.add(item.year_end);
            });
            
            // Add century markers
            const minYear = Math.floor(config.minYear / 100) * 100;
            const maxYear = Math.ceil(config.maxYear / 100) * 100;
            
            for (let year = minYear; year <= maxYear; year += 100) {
                years.add(year);
            }
            
            // Add decade markers for recent history (1900 onwards)
            for (let year = 1900; year <= maxYear; year += 10) {
                years.add(year);
            }
            
            // Add individual years for 1950 onwards
            for (let year = 1950; year <= maxYear; year += 1) {
                years.add(year);
            }
            
            return Array.from(years).sort((a, b) => a - b);
        }

        // Function to create timeline band markers
        function createTimelineBandMarkers(timelineBand, years) {
            const minYear = config.minYear;
            const maxYear = config.maxYear;
            const totalRange = maxYear - minYear;
            
            // Calculate the band width (make it wider than the visible area)
            const bandWidth = 3000; // px
            
            years.forEach(year => {
                // Calculate position based on year
                let position;
                
                // Apply different scaling for different time periods
                if (year < 1900) {
                    // Normal scaling for years before 1900
                    const normalizedPos = (year - minYear) / (1900 - minYear);
                    position = normalizedPos * (bandWidth * 0.5); // Use 50% of band width for pre-1900
                } else if (year < 1950) {
                    // Slightly expanded scaling for 1900-1950
                    const normalizedPos = (year - 1900) / 50;
                    position = (bandWidth * 0.5) + (normalizedPos * (bandWidth * 0.2)); // Use 20% of band width for 1900-1950
                } else {
                    // Expanded scaling for 1950 onwards
                    const normalizedPos = (year - 1950) / (maxYear - 1950);
                    position = (bandWidth * 0.7) + (normalizedPos * (bandWidth * 0.3)); // Use 30% of band width for post-1950
                }
                
                // Determine marker type
                let markerClass = "timeline-marker";
                let markerLabel = "";
                
                if (year % 100 === 0) {
                    // Century marker
                    markerClass += " century-marker";
                    markerLabel = year.toString();
                } else if (year % 10 === 0 && year >= 1900) {
                    // Decade marker for recent history
                    markerClass += " decade-marker";
                    if (year % 50 === 0) {
                        markerLabel = year.toString();
                    }
                } else if (year >= 1950) {
                    // Year marker for very recent history
                    markerClass += " year-marker";
                    // Only show labels for every 5 years to avoid crowding
                    if (year % 5 === 0) {
                        markerLabel = year.toString();
                    }
                }
                
                // Check if this year corresponds to a paragraph item (chapter)
                const isParagraphYear = getParagraphItems().some(item => item.year_start === year);
                if (isParagraphYear) {
                    markerClass += " chapter-marker";
                }
                
                // Create marker element
                const marker = $(`<div class="${markerClass}" data-year="${year}" style="left: ${position}px;">
                    ${markerLabel ? `<span class="marker-year">${markerLabel}</span>` : ''}
                </div>`);
                
                timelineBand.append(marker);
            });
        }

        // Create timeline items
        function createTimelineItems(timelineContent, paragraphItems) {
            if (!Array.isArray(paragraphItems)) {
                console.error('Invalid paragraphItems:', paragraphItems);
                return;
            }
            
            timelineContent.find('.timeline-item').remove();
            
            paragraphItems.forEach(item => {
                // Validate item has all required fields
                if (!item || !item.id || !item.year_start || !item.title) {
                    console.error('Invalid timeline item:', item);
                    return;
                }
                
                try {
                    const timelineItem = $(`
                        <div class="timeline-item" 
                             data-id="${item.id}" 
                             data-year-start="${item.year_start}">
                            <div class="content-wrapper">
                                <div class="year">
                                    ${item.year_start}
                                    ${(item.year_end && item.year_end !== item.year_start) ? ` - ${item.year_end}` : ''}
                                </div>
                                <h3>${item.title}</h3>
                                <p>${item.paragraph}</p>
                            </div>
                        </div>
                    `);
                    
                    timelineContent.append(timelineItem);
                } catch (error) {
                    console.error('Error creating timeline item:', error, item);
                }
            });
        }

        // Add navigation arrows using shared classes
        function addNavigationArrows(timelineContent, paragraphItems) {
            // Remove any existing arrows first
            $('#the-history .carousel-arrow.prev, #the-history .carousel-arrow.next').remove();

            // Append new arrows using shared classes, potentially wrapped or positioned specifically for history
            // We add them outside timelineContent, perhaps directly to #the-history or body
            // Let's append them relative to the #the-history container for better control
            const historyContainer = $('#the-history');
            if (historyContainer.length) {
                 // Add ARIA labels for accessibility
                historyContainer.append('<button class="carousel-arrow prev" aria-label="Previous History Entry"></button>');
                historyContainer.append('<button class="carousel-arrow next" aria-label="Next History Entry"></button>');
            } else {
                console.error("#the-history container not found for appending arrows.");
                return; // Stop if container not found
            }

            // Add event handlers for navigation arrows using the new shared classes, scoped to history
            $('#the-history').off('click', '.carousel-arrow.prev').on('click', '.carousel-arrow.prev', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if ($(this).hasClass('disabled') || isAnimating) return;
                
                const visibleItem = $('.timeline-item:visible');
                if (visibleItem.length === 0) {
                    transitionToItem(paragraphItems[0], 0, paragraphItems.length);
                    return;
                }
                
                const currentId = parseInt(visibleItem.attr('data-id'));
                const currentIndex = paragraphItems.findIndex(item => item.id === currentId);
                
                if (currentIndex > 0) {
                    const prevItem = paragraphItems[currentIndex - 1];
                    transitionToItem(prevItem, currentIndex - 1, paragraphItems.length);
                }
            });

            // Use event delegation on the container for the next arrow
            $('#the-history').off('click', '.carousel-arrow.next').on('click', '.carousel-arrow.next', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if ($(this).hasClass('disabled') || isAnimating) return;
                
                const visibleItem = $('.timeline-item:visible');
                const paragraphItems = getParagraphItems();
                
                // If no item is visible, we're in the welcome state
                if (visibleItem.length === 0) {
                    // Clear welcome message
                    clearAllVisualizations();
                    // Show the first item
                    transitionToItem(paragraphItems[0], 0, paragraphItems.length);
                    return;
                }
                
                // Normal navigation logic
                const currentId = parseInt(visibleItem.attr('data-id'));
                const currentIndex = paragraphItems.findIndex(item => item.id === currentId);
                
                if (currentIndex < paragraphItems.length - 1) {
                    const nextItem = paragraphItems[currentIndex + 1];
                    transitionToItem(nextItem, currentIndex + 1, paragraphItems.length);
                }
            });

            // Ensure arrows are interactive (redundant if using buttons, but good practice)
            $('#the-history .carousel-arrow').css('pointer-events', 'auto');
        }

        // Function to handle item transitions
        function transitionToItem(item, currentIndex, totalItems) {
            if (isAnimating || !item) return;
            
            // Validate the item has required properties
            if (!item.year_start || !item.id) {
                console.error('Invalid timeline item:', item);
                return;
            }
            
            // Debug visualization data
            debugVisualization(item);
            
            isAnimating = true;
            
            $(".timeline-item").hide();
            
            currentYear = item.year_start;
            
            // Clear existing visualizations
            clearAllVisualizations();
            
            // Store the visualizations to be drawn after zoom completes
            const visualizationsToShow = item.visualizations || [];
            
            // First update the map zoom and wait for it to complete
            updateMapZoom(item, function() {
                // Draw visualizations only after zoom completes
                if (visualizationsToShow.length > 0) {
                    visualizationsToShow.forEach(viz => {
                        switch(viz.type) {
                            case "arrow":
                                createArrowVisualization(viz, item.year_start);
                                break;
                            case "dot":
                                createDotVisualization(viz, item.year_start);
                                break;
                            case "dots":
                                createDotsVisualization(viz, item.year_start);
                                break;
                            case "arrows": // Support for multiple arrows
                                if (viz.arrows && Array.isArray(viz.arrows)) {
                                    viz.arrows.forEach((arrow, i) => {
                                        const arrowViz = {
                                            type: "arrow",
                                            origin: arrow.origin,
                                            destination: arrow.destination,
                                            label: i === 0 ? viz.label : null, // Only add label to first arrow
                                            color: "var(--red)" // Use --red for all visualizations
                                        };
                                        createArrowVisualization(arrowViz, item.year_start);
                                    });
                                }
                                break;
                        }
                    });
                }
            });
            
            updateTimelineMarker(item.year_start);
            
            const timelineItem = $(`.timeline-item[data-id="${item.id}"]`);
            if (timelineItem.length === 0) {
                console.error('Timeline item element not found for id:', item.id);
                isAnimating = false;
                return;
            }
            
            timelineItem.fadeIn(config.animationDuration, function() {
                isAnimating = false;
            });
            
            updateArrowStates(currentIndex, totalItems);
        }
        
        // Function to clear all visualizations
        function clearAllVisualizations() {
            const layers = ["#migration-layer", "#language-layer", "#event-layer"];
            layers.forEach(layer => {
                map.select(layer).selectAll("*").remove();
            });
        }

        // Update visualization based on year
        function updateVisualization(year) {
            if (isAnimating) return;
            
            $("#year-display").text(year);
            
            // Clear existing visualizations
            clearAllVisualizations();
            
            // Find the item for this year
            const itemsForYear = historyData.filter(item => item.year_start === year);
            
            if (itemsForYear.length > 0) {
                const item = itemsForYear[0];
                
                // Store the visualizations to be drawn after zoom completes
                const visualizationsToShow = item.visualizations || [];
                
                // Update map zoom and wait for it to complete
                updateMapZoom(item, function() {
                    // Draw visualizations only after zoom completes
                    if (visualizationsToShow.length > 0) {
                        visualizationsToShow.forEach(viz => {
                            switch(viz.type) {
                                case "arrow":
                                    createArrowVisualization(viz, item.year_start);
                                    break;
                                case "dot":
                                    createDotVisualization(viz, item.year_start);
                                    break;
                                case "dots":
                                    createDotsVisualization(viz, item.year_start);
                                    break;
                                case "arrows":
                                    if (viz.arrows && Array.isArray(viz.arrows)) {
                                        viz.arrows.forEach((arrow, i) => {
                                            const arrowViz = {
                                                type: "arrow",
                                                origin: arrow.origin,
                                                destination: arrow.destination,
                                                label: i === 0 ? viz.label : null, // Only add label to first arrow
                                                color: "var(--red)" // Use --red for all visualizations
                                            };
                                            createArrowVisualization(arrowViz, item.year_start);
                                        });
                                    }
                                    break;
                            }
                        });
                    }
                    
                    // Update country highlights if needed
                    updateCountryHighlights([item]);
                });
            }
            
            updateTimelineContent(year);
            updateTimelineMarker(year);
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

        // Update the updateTimelineMarker function to center the active year
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
            }
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
            let mapZoom = "europe_and_africa"; // Default zoom level
            
            // Get the map_zoom directly from the item
            if (item.map_zoom) {
                mapZoom = item.map_zoom;
            }
            
            let center, scale;
            switch(mapZoom) {
                case "europe_and_africa":
                    center = [20, 30];
                    scale = config.mapWidth / 4;
                    break;
                case "africa":
                    center = [25, 0];
                    scale = config.mapWidth / 2;
                    break;
                case "south_africa":
                    // Move South Africa view higher up to avoid text overlay
                    center = [25, -25]; // Changed from -28 to -25 to move it up
                    scale = config.mapWidth * 1.2;
                    break;
                case "southern_africa": // Add support for southern_africa zoom level from the data
                    center = [25, -25];
                    scale = config.mapWidth * 0.8;
                    break;
                case "world": // Add support for world zoom level from the data
                    center = [20, 10];
                    scale = config.mapWidth / 6;
                    break;
                default:
                    center = [20, 20];
                    scale = config.mapWidth / 3;
            }
            
            const t = d3.transition().duration(config.zoomTransitionDuration);
            const oldProjection = {
                center: projection.center(),
                scale: projection.scale()
            };
            
            projection.center(center).scale(scale);
            
            map.selectAll("path")
                .transition(t)
                .attrTween("d", function() {
                    const d = d3.select(this).attr("d");
                    const interpolate = d3.interpolate(
                        [oldProjection.center, oldProjection.scale],
                        [center, scale]
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
                
                layer.append("path")
                    .attr("class", `migration-line ${id}`)
                    .attr("data-origin-x", viz.origin[0])
                    .attr("data-origin-y", viz.origin[1])
                    .attr("data-dest-x", viz.destination[0])
                    .attr("data-dest-y", viz.destination[1])
                    .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
                    .attr("stroke", "var(--red)") // Always use --red
                    .attr("stroke-width", 2)
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 0.8);
                
                // Add origin marker
                layer.append("circle")
                    .attr("class", `origin-marker ${id}`)
                    .attr("cx", originPos[0])
                    .attr("cy", originPos[1])
                    .attr("r", 5)
                    .attr("fill", "var(--red)") // Always use --red
                    .attr("stroke", "var(--background)")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 1);
                
                // Add label if provided
                if (viz.label) {
                    layer.append("text")
                        .attr("class", `migration-label ${id}`)
                        .attr("x", (originPos[0] + destPos[0]) / 2)
                        .attr("y", (originPos[1] + destPos[1]) / 2 - 10)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--text)") // Use --text CSS variable
                        .text(viz.label)
                        .attr("opacity", 0)
                        .transition()
                        .duration(config.animationDuration)
                        .attr("opacity", 1);
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
                
                layer.append("circle")
                    .attr("class", `event-marker ${id}`)
                    .attr("data-x", viz.origin[0])
                    .attr("data-y", viz.origin[1])
                    .attr("cx", pos[0])
                    .attr("cy", pos[1])
                    .attr("r", 8)
                    .attr("fill", "var(--red)") // Always use --red
                    .attr("stroke", "var(--background)")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 0.8);
                
                if (viz.label) {
                    layer.append("text")
                        .attr("class", `event-label ${id}`)
                        .attr("data-x", viz.origin[0])
                        .attr("data-y", viz.origin[1])
                        .attr("data-offset", 20)
                        .attr("x", pos[0])
                        .attr("y", pos[1] + 20)
                        .attr("text-anchor", "middle")
                        .attr("fill", "var(--text)") // Use --text CSS variable
                        .text(viz.label)
                        .attr("opacity", 0)
                        .transition()
                        .duration(config.animationDuration)
                        .attr("opacity", 1);
                }
            }
        }

        function createDotsVisualization(viz, yearStart) {
            const id = `dots-${yearStart}-${Math.random().toString(36).substr(2, 5)}`;
            const layer = map.select("#language-layer");
            
            if (viz.origin) {
                const pos = projection(viz.origin);
                
                // Create a central bubble
                layer.append("circle")
                    .attr("class", `language-bubble ${id}`)
                    .attr("data-x", viz.origin[0])
                    .attr("data-y", viz.origin[1])
                    .attr("cx", pos[0])
                    .attr("cy", pos[1])
                    .attr("r", 15)
                    .attr("fill", "var(--red)") // Always use --red
                    .attr("stroke", "var(--background)")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 0.7);
                
                // Add dot coordinates if available
                if (viz.dotCoordinates && viz.dotCoordinates.length > 0) {
                    viz.dotCoordinates.forEach((coord, i) => {
                        if (!coord || !Array.isArray(coord) || coord.length < 2) {
                            console.error("Invalid dot coordinate:", coord);
                            return;
                        }
                        
                        const dotPos = projection(coord);
                        
                        // Add sequential delay for fade-in animation
                        layer.append("circle")
                            .attr("class", `language-bubble ${id}`)
                            .attr("data-x", coord[0])
                            .attr("data-y", coord[1])
                            .attr("cx", dotPos[0])
                            .attr("cy", dotPos[1])
                            .attr("r", 8)
                            .attr("fill", "var(--red)") // Always use --red
                            .attr("stroke", "var(--background)")
                            .attr("opacity", 0)
                            .transition()
                            .duration(config.animationDuration)
                            .delay(i * 200) // Increased delay between dots
                            .attr("opacity", 0.7);
                        
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
                                .attr("fill", "var(--text)")
                                .text(viz.labels[i])
                                .attr("opacity", 0)
                                .transition()
                                .duration(config.animationDuration)
                                .delay(i * 200) // Match the dot delay
                                .attr("opacity", 1);
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
                        
                        layer.append("circle")
                            .attr("class", `language-bubble ${id}`)
                            .attr("cx", x)
                            .attr("cy", y)
                            .attr("r", 8)
                            .attr("fill", "var(--red)") // Always use --red
                            .attr("stroke", "var(--background)")
                            .attr("opacity", 0)
                            .transition()
                            .duration(config.animationDuration)
                            .delay(i * 200) // Increased delay
                            .attr("opacity", 0.7);
                        
                        layer.append("text")
                            .attr("class", `language-label ${id}`)
                            .attr("x", x)
                            .attr("y", y + 20)
                            .attr("text-anchor", "middle")
                            .attr("fill", "var(--text)") // Use --text CSS variable
                            .text(label)
                            .attr("opacity", 0)
                            .transition()
                            .duration(config.animationDuration)
                            .delay(i * 200) // Match the dot delay
                            .attr("opacity", 1);
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
                        .attr("fill", "var(--text)")
                        .text(viz.label)
                        .attr("opacity", 0)
                        .transition()
                        .duration(config.animationDuration)
                        .attr("opacity", 1);
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

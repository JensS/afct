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
            initTimelineContent();
            initScrollHandler();
            
            updateVisualization(config.minYear);
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
            
            const sortedYears = Array.from(years).sort((a, b) => a - b);
            const timeRange = config.maxYear - config.minYear;
            
            timelineMarkers.empty();
            
            sortedYears.forEach(year => {
                const markerPosition = (year - config.minYear) / timeRange;

                // Determine if this year corresponds to a paragraph item (chapter)
                const isParagraphYear = paragraphItems.some(item => item.year_start === year);
                const markerClass = isParagraphYear ? "timeline-marker chapter-marker" : "timeline-marker";

                // Create the marker with only the year and the chapter marker dot if applicable
                $(`<div class="${markerClass}" data-year="${year}">
                   <span class="marker-year">${year}</span>
                 </div>`).appendTo(timelineMarkers);
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

        // Add navigation arrows
        function addNavigationArrows(timelineContent, paragraphItems) {
            timelineContent.find('.nav-arrow').remove();
            
            timelineContent
                .append('<div class="nav-arrow prev-arrow">&larr;</div>')
                .append('<div class="nav-arrow next-arrow">&rarr;</div>');
            
            // Add event handlers for navigation arrows
            $('.prev-arrow').off('click').on('click', function(e) {
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
            
            $('.next-arrow').off('click').on('click', function(e) {
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
                
                if (currentIndex < paragraphItems.length - 1) {
                    const nextItem = paragraphItems[currentIndex + 1];
                    transitionToItem(nextItem, currentIndex + 1, paragraphItems.length);
                }
            });
            
            $('.nav-arrow').css('pointer-events', 'auto');
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

        // Update timeline marker
        function updateTimelineMarker(year) {
            $(".timeline-marker").removeClass("active");
            
            let closestMarker = null;
            let minDiff = Infinity;
            
            $(".timeline-marker").each(function() {
                const marker = $(this);
                const markerYear = parseInt(marker.attr("data-year"));
                const diff = Math.abs(markerYear - year);
                
                if (diff < minDiff) {
                    minDiff = diff;
                    closestMarker = marker;
                }
            });
            
            if (closestMarker) {
                closestMarker.addClass("active");
            }
        }

        // Update arrow states
        function updateArrowStates(currentIndex, totalItems) {
            $('.prev-arrow').toggleClass('disabled', currentIndex === 0);
            $('.next-arrow').toggleClass('disabled', currentIndex === totalItems - 1);
        }

        // Initialize scroll handler
        function initScrollHandler() {
            const timelineInfo = $('#timeline-info');
            const timelineMarkers = $('.timeline-markers');
            const timelineContent = $('#timeline-content');
            const historySection = $('#the-history');
            
            updateVisualization(config.minYear);
            updateTimelineMarker(config.minYear);
            
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
                    .attr("stroke-dasharray", "5,5")
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

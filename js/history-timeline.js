/**
 * South African History Timeline Visualization
 */

(function($) {
    $(document).ready(function() {
        // Configuration
        const config = {
            mapWidth: 800,
            mapHeight: 600,
            minYear: 1500,
            maxYear: 2025,
            animationDuration: 400,
            zoomTransitionDuration: 750,
            colors: {
                migration: "var(--red)",
                languageSupression: "#d62728",
                languageRecognition: "#2ca02c"
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
                    item.visualisation === "paragraph" && item.history_paragraph
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
        // Load history data from WordPress REST API and assign sequential IDs
        function loadHistoryData() {
            $.ajax({
                url: afctSettings.historyDataUrl,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (typeof afctSettings.historyNonce !== 'undefined') {
                        xhr.setRequestHeader('X-WP-Nonce', afctSettings.historyNonce);
                    }
                },
                success: function(data) {
                    historyData = data;
                    
                    // Clear cache when data is loaded
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
                    
                    // Highlight South Africa
                    svg.append("circle")
                        .attr("cx", projection([24, -29])[0])
                        .attr("cy", projection([24, -29])[1])
                        .attr("r", 20)
                        .attr("fill", "#ffd700")
                        .attr("stroke", "var(--background)")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.5);
                        
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
                
                // Find all events for this year
                const events = historyData.filter(item => item.year_start === year);
                let label = year.toString();
                
                // Prioritize paragraph items (chapters) for labels
                if (events.length > 0) {
                    // First try to find a paragraph item
                    const paragraphEvent = events.find(e => e.history_paragraph && e.history_paragraph.title);
                    // If no paragraph, then look for an animation
                    const animationEvent = events.find(e => e.animation && e.animation.label);
                    
                    const event = paragraphEvent || animationEvent;
                    if (event) {
                        label += ": " + (event.history_paragraph?.title || event.animation?.label);
                    }
                }
                
                // Create the marker with appropriate styling
                const isParagraphYear = paragraphItems.some(item => item.year_start === year);
                const markerClass = isParagraphYear ? "timeline-marker chapter-marker" : "timeline-marker";
                
                $(`<div class="${markerClass}" data-year="${year}" style="left: ${markerPosition * 100}%">
                   <span class="marker-year">${year}</span>
                   <span class="marker-label">${label.replace(year + ": ", "")}</span>
                 </div>`).appendTo(timelineMarkers);
            });
        }

        // Create timeline items
        function createTimelineItems(timelineContent, paragraphItems) {
            timelineContent.find('.timeline-item').remove();
            
            paragraphItems.forEach(item => {
                const paragraph = item.history_paragraph;
                const yearRange = item.year_start;
                
                const timelineItem = $(`
                    <div class="timeline-item" 
                         data-id="${item.id}" 
                         data-year-start="${item.year_start}">
                        <div class="content-wrapper">
                            <div class="year">${yearRange}</div>
                            <h3>${paragraph.title}</h3>
                            <p>${paragraph.paragraph}</p>
                            <!-- Impact field removed -->
                        </div>
                    </div>
                `);
                
                timelineContent.append(timelineItem);
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
            if (isAnimating) return;
            
            isAnimating = true;
            
            $(".timeline-item").hide();
            
            currentYear = item.year_start;
            updateVisualization(item.year_start);
            updateTimelineMarker(item.year_start);
            
            $(`.timeline-item[data-id="${item.id}"]`)
                .fadeIn(config.animationDuration, function() {
                    isAnimating = false;
                });
            
            updateArrowStates(currentIndex, totalItems);
        }

        // Update visualization based on year
        function updateVisualization(year) {
            if (isAnimating) return;
            
            $("#year-display").text(year);
            
            const newActiveKeyframes = historyData.filter(item => 
                year >= item.year_start
            );
            
            const keyframesToActivate = newActiveKeyframes.filter(item => 
                !activeKeyframes.some(active => active.id === item.id)
            );
            
            const keyframesToDeactivate = activeKeyframes.filter(item => 
                !newActiveKeyframes.some(active => active.id === item.id)
            );
            
            activeKeyframes = newActiveKeyframes;
            
            updateTimelineContent(year);
            updateMapZoom(year, newActiveKeyframes);
            updateCountryHighlights(newActiveKeyframes);
            
            keyframesToDeactivate.forEach(deactivateKeyframe);
            keyframesToActivate.forEach(item => {
                if (item.visualisation === "map") {
                    // Debug the animation data
                    console.log("Map animation item:", item);
                    
                    // If animation data is missing, try to create it from the available fields
                    if (!item.animation && item.animation_type) {
                        item.animation = {
                            type: item.animation_type,
                            label: item.animation_label || ''
                        };
                        
                        // Add center point if available
                        if (item.center_lng && item.center_lat) {
                            item.animation.center = [parseFloat(item.center_lng), parseFloat(item.center_lat)];
                        }
                        
                        // Add migration points if available
                        if (item.origin_points && item.destination_points) {
                            if (item.origin_points.length === 1 && item.destination_points.length === 1) {
                                item.animation.originPoint = item.origin_points[0];
                                item.animation.destinationPoint = item.destination_points[0];
                            } else {
                                item.animation.originPoints = item.origin_points;
                                item.animation.destinationPoints = item.destination_points;
                            }
                        }
                        
                        // Add languages if available
                        if (item.languages) {
                            if (item.animation_type === 'language_suppression') {
                                item.animation.suppressed_languages = item.languages.split(',').map(l => l.trim());
                            } else if (item.animation_type === 'language_development' || 
                                      item.animation_type === 'language_recognition') {
                                item.animation.languages = item.languages.split(',').map(l => l.trim());
                            }
                        }
                    }
                    
                    if (item.animation) {
                        switch(item.animation.type) {
                        case "migration":
                            createMigrationAnimation(item.animation, item.year_start);
                            break;
                        case "language_development":
                        case "language_suppression":
                        case "language_recognition":
                            createLanguageAnimation(item.animation, item.year_start);
                            break;
                        case "event":
                            createEventAnimation(item.animation, item.year_start);
                            break;
                        }
                    }
                }
            });
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
            
            const targetItem = paragraphItems[targetIndex];
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
                    updateVisualization(year);
                    updateTimelineMarker(year);
                }
            });
        }

        // Update map zoom
        function updateMapZoom(year, activeKeyframes) {
            let mapZoom = "europe_and_africa";
            
            activeKeyframes.forEach(keyframe => {
                if (keyframe.map_zoom) {
                    if (keyframe.map_zoom === "south_africa" || 
                        (keyframe.map_zoom === "africa" && mapZoom === "europe_and_africa")) {
                        mapZoom = keyframe.map_zoom;
                    }
                }
            });
            
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
                    center = [25, -28];
                    scale = config.mapWidth * 1.2;
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

        // Create migration animation
        function createMigrationAnimation(animation, yearStart) {
            const id = `migration-${yearStart}`;
            const layer = map.select("#migration-layer");
            
            if (animation.originPoint && animation.destinationPoint) {
                const originPos = projection(animation.originPoint);
                const destPos = projection(animation.destinationPoint);
                
                layer.append("path")
                    .attr("class", `migration-line ${id}`)
                    .attr("data-origin-x", animation.originPoint[0])
                    .attr("data-origin-y", animation.originPoint[1])
                    .attr("data-dest-x", animation.destinationPoint[0])
                    .attr("data-dest-y", animation.destinationPoint[1])
                    .attr("d", `M${originPos[0]},${originPos[1]} L${destPos[0]},${destPos[1]}`)
                    .attr("stroke", config.colors.migration)
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5")
                    .attr("opacity", 0)
                    .transition()
                    .duration(config.animationDuration)
                    .attr("opacity", 0.8);
                
                addMigrationMarkers(layer, id, originPos, destPos, animation.label);
            }
            
            if (animation.originPoints && animation.destinationPoints) {
                createMultipleMigrations(layer, id, animation);
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
            if (item.visualisation === "map" && item.animation) {
                const id = `${item.animation.type}-${item.year_start}`;
                
                map.selectAll(`.${id}`)
                    .transition()
                    .duration(config.animationDuration / 2)
                    .attr("opacity", 0)
                    .remove();
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

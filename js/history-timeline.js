import * as d3 from 'd3';
import { gsap } from 'gsap';
import * as topojson from 'topojson-client';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const RULER_ENTRY_GAP = 66;
const RULER_PADDING = 600;
const RULER_TICK_PITCH = 9;

const mapViews = {
    africa: { center: [20, 0], scale: 365 },
    europe_and_africa: { center: [20, 11], scale: 285 },
    south_africa: { center: [25, -28], scale: 920 },
    south_africa_close: { center: [25, -29], scale: 1450 },
    southern_africa: { center: [25, -25], scale: 650 },
    world: { center: [12, 5], scale: 125 },
};

export default function initHistoryTimeline($) {
    const historySection = document.getElementById('the-history');

    if (!historySection) {
        return createEmptyPublicApi();
    }

    const historyLayout = historySection.querySelector('.history-layout');
    const timelineContent = historySection.querySelector('#timeline-content');
    const timelineMarkers = historySection.querySelector('.timeline-markers');
    const mapContainer = historySection.querySelector('#map-container');
    const previousButton = historySection.querySelector('.history-nav-arrows .prev');
    const nextButton = historySection.querySelector('.history-nav-arrows .next');
    const dataElement = historySection.querySelector('#visualization-data');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let historyEntries = [];
    let currentIndex = -1;
    let mapSvg;
    let countriesLayer;
    let migrationLayer;
    let languageLayer;
    let eventLayer;
    let projection;
    let projectionTween;
    let resizeObserver;
    let touchStart = null;

    function normalizeHistoryEntries(entries) {
        if (!Array.isArray(entries)) {
            return [];
        }

        return entries
            .map((entry, index) => {
                const yearStart = Number.parseInt(entry?.year_start, 10);
                const yearEnd = Number.parseInt(entry?.year_end, 10);
                const title = entry?.title || entry?.history_paragraph?.title || '';
                const paragraph = entry?.paragraph || entry?.history_paragraph?.paragraph || '';

                return {
                    ...entry,
                    id: entry?.id || `${yearStart}-${index}`,
                    year_start: yearStart,
                    year_end: Number.isFinite(yearEnd) ? yearEnd : yearStart,
                    title,
                    paragraph,
                    visualizations: Array.isArray(entry?.visualizations) ? entry.visualizations : [],
                };
            })
            .filter(entry => Number.isFinite(entry.year_start) && entry.title && entry.paragraph);
    }

    function getEmbeddedHistoryEntries() {
        if (!dataElement?.dataset.historyEntries) {
            return [];
        }

        try {
            return normalizeHistoryEntries(JSON.parse(dataElement.dataset.historyEntries));
        } catch (error) {
            console.error('Unable to parse the embedded history entries.', error);
            return [];
        }
    }

    function loadHistoryEntries() {
        const embeddedEntries = getEmbeddedHistoryEntries();

        if (embeddedEntries.length > 0) {
            initialize(embeddedEntries);
            return;
        }

        if (!window.afctSettings?.historyDataUrl) {
            showEmptyState();
            return;
        }

        $.ajax({
            url: window.afctSettings.historyDataUrl,
            method: 'GET',
            cache: false,
        })
            .done(entries => {
                const normalizedEntries = normalizeHistoryEntries(entries);

                if (normalizedEntries.length === 0) {
                    showEmptyState();
                    return;
                }

                initialize(normalizedEntries);
            })
            .fail(error => {
                console.error('Unable to load the history entries.', error);
                showEmptyState();
            });
    }

    function initialize(entries) {
        historyEntries = entries;

        createTimelineMarkers();
        createMap();
        bindInteractions();
        observeLayout();
        setActiveEntry(0, false);

        historySection.classList.add('history-ready');
        historySection.dispatchEvent(new CustomEvent('afct:history-ready'));
    }

    function showEmptyState() {
        timelineContent.replaceChildren();

        const message = document.createElement('p');
        message.className = 'history-empty-state';
        message.textContent = 'History entries are not available yet.';
        timelineContent.append(message);

        previousButton.disabled = true;
        nextButton.disabled = true;
    }

    function createTimelineMarkers() {
        timelineMarkers.replaceChildren();

        const rulerBand = document.createElement('div');
        rulerBand.className = 'hruler-band';

        const bandHeight = (RULER_PADDING * 2) + ((historyEntries.length - 1) * RULER_ENTRY_GAP);
        rulerBand.style.height = `${bandHeight}px`;

        const tickCount = Math.ceil(bandHeight / RULER_TICK_PITCH);

        for (let tickIndex = 0; tickIndex <= tickCount; tickIndex += 1) {
            const tick = document.createElement('span');
            tick.className = 'hruler-tick';
            tick.style.top = `${tickIndex * RULER_TICK_PITCH}px`;
            rulerBand.append(tick);
        }

        historyEntries.forEach((entry, entryIndex) => {
            const marker = document.createElement('button');
            marker.className = 'timeline-marker hruler-entry';
            marker.type = 'button';
            marker.tabIndex = -1;
            marker.dataset.index = String(entryIndex);
            marker.dataset.year = String(entry.year_start);
            marker.style.top = `${getRulerEntryPosition(entryIndex)}px`;

            const label = document.createElement('span');
            label.className = 'hruler-label';
            label.textContent = formatYear(entry);
            marker.append(label);

            marker.addEventListener('click', () => setActiveEntry(entryIndex));
            rulerBand.append(marker);
        });

        timelineMarkers.append(rulerBand);
    }

    function getRulerEntryPosition(entryIndex) {
        return RULER_PADDING + (entryIndex * RULER_ENTRY_GAP);
    }

    function getRulerSlotRatio() {
        return window.matchMedia('(max-width: 991px)').matches ? 0.035 : 0.3;
    }

    function updateRuler(animate = true) {
        const rulerBand = timelineMarkers.querySelector('.hruler-band');

        if (!rulerBand || currentIndex < 0) {
            return;
        }

        const activeSlot = timelineMarkers.clientHeight * getRulerSlotRatio();
        const translateY = activeSlot - getRulerEntryPosition(currentIndex);
        const markers = rulerBand.querySelectorAll('.hruler-entry');

        markers.forEach((marker, markerIndex) => {
            const isActive = markerIndex === currentIndex;
            marker.classList.toggle('active', isActive);
            marker.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        gsap.to(rulerBand, {
            y: translateY,
            duration: animate && !prefersReducedMotion ? 0.65 : 0,
            ease: 'power2.inOut',
            overwrite: true,
        });
    }

    function renderTimelineContent(entry, animate) {
        timelineContent.replaceChildren();

        const timelineItem = document.createElement('article');
        timelineItem.className = 'timeline-item';
        timelineItem.dataset.id = String(entry.id);
        timelineItem.dataset.yearStart = String(entry.year_start);

        const year = document.createElement('div');
        year.className = 'year';
        year.textContent = formatYear(entry);

        const title = document.createElement('h3');
        title.textContent = entry.title;

        const paragraph = document.createElement('p');
        paragraph.textContent = entry.paragraph;

        timelineItem.append(year, title, paragraph);
        timelineContent.append(timelineItem);

        gsap.fromTo(
            timelineItem,
            { autoAlpha: 0, y: animate ? 12 : 0 },
            {
                autoAlpha: 1,
                y: 0,
                duration: animate && !prefersReducedMotion ? 0.45 : 0,
                ease: 'power2.out',
                overwrite: true,
            },
        );
    }

    function formatYear(entry) {
        if (entry.year_end && entry.year_end !== entry.year_start) {
            return `${entry.year_start}–${entry.year_end}`;
        }

        return String(entry.year_start);
    }

    function updateNavigationButtons() {
        const isFirstEntry = currentIndex <= 0;
        const isLastEntry = currentIndex >= historyEntries.length - 1;

        previousButton.disabled = isFirstEntry;
        nextButton.disabled = isLastEntry;
        previousButton.classList.toggle('disabled', isFirstEntry);
        nextButton.classList.toggle('disabled', isLastEntry);
    }

    function setActiveEntry(entryIndex, animate = true) {
        if (entryIndex < 0 || entryIndex >= historyEntries.length || entryIndex === currentIndex) {
            return;
        }

        currentIndex = entryIndex;
        historyLayout.dataset.activeIndex = String(entryIndex);

        const entry = historyEntries[entryIndex];

        renderTimelineContent(entry, animate);
        updateRuler(animate);
        updateNavigationButtons();
        updateMap(entry, animate);

        if (animate) {
            window.requestAnimationFrame(() => {
                historySection.dispatchEvent(new CustomEvent('afct:history-change'));
            });
        }
    }

    function createMap() {
        mapContainer.replaceChildren();

        projection = d3
            .geoMercator()
            .center(mapViews.africa.center)
            .scale(mapViews.africa.scale)
            .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

        mapSvg = d3
            .select(mapContainer)
            .append('svg')
            .attr('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        createMapDefinitions();

        const mapRoot = mapSvg.append('g').attr('class', 'history-map-root');
        countriesLayer = mapRoot.append('g').attr('id', 'countries-layer');
        migrationLayer = mapRoot.append('g').attr('id', 'migration-layer');
        languageLayer = mapRoot.append('g').attr('id', 'language-layer');
        eventLayer = mapRoot.append('g').attr('id', 'event-layer');

        d3.json(`${window.afctSettings.templateUrl}/js/countries-50m.json`)
            .then(mapData => {
                const countryObject = mapData?.objects?.countries;

                if (!countryObject) {
                    throw new Error('The map data does not contain a countries layer.');
                }

                const countries = topojson.feature(mapData, countryObject).features;

                countriesLayer
                    .selectAll('path')
                    .data(countries)
                    .join('path')
                    .attr('class', country => {
                        const southAfricaClass = String(country.id) === '710' ? ' is-south-africa' : '';
                        return `history-country${southAfricaClass}`;
                    });

                redrawMap();
            })
            .catch(error => {
                mapContainer.classList.add('map-unavailable');
                console.error('Unable to render the history map.', error);
            });
    }

    function createMapDefinitions() {
        const definitions = mapSvg.append('defs');

        definitions
            .append('marker')
            .attr('id', 'history-arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 8)
            .attr('refY', 5)
            .attr('markerWidth', 7)
            .attr('markerHeight', 7)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z');
    }

    function updateMap(entry, animate) {
        if (!projection || !mapSvg) {
            return;
        }

        const mapView = mapViews[entry.map_zoom] || mapViews.africa;

        if (projectionTween) {
            projectionTween.kill();
        }

        renderVisualizations(entry, animate);

        if (!animate || prefersReducedMotion) {
            projection.center(mapView.center).scale(mapView.scale);
            redrawMap();
            return;
        }

        const currentCenter = projection.center();
        const projectionState = {
            centerX: currentCenter[0],
            centerY: currentCenter[1],
            scale: projection.scale(),
        };

        projectionTween = gsap.to(projectionState, {
            centerX: mapView.center[0],
            centerY: mapView.center[1],
            scale: mapView.scale,
            duration: 0.55,
            ease: 'power2.inOut',
            overwrite: true,
            onUpdate() {
                projection
                    .center([projectionState.centerX, projectionState.centerY])
                    .scale(projectionState.scale);
                redrawMap();
            },
        });
    }

    function redrawMap() {
        if (!projection) {
            return;
        }

        const path = d3.geoPath().projection(projection);
        countriesLayer?.selectAll('path').attr('d', path);

        migrationLayer?.selectAll('.history-route').attr('d', route => createRoutePath(route));
        migrationLayer?.selectAll('.history-route-label').each(positionRouteLabel);
        languageLayer?.selectAll('.history-map-dot').each(positionMapDot);
        languageLayer?.selectAll('.history-map-label').each(positionMapLabel);
        eventLayer?.selectAll('.history-map-dot').each(positionMapDot);
        eventLayer?.selectAll('.history-map-label').each(positionMapLabel);
    }

    function createRoutePath(route) {
        const origin = projection(route.origin);
        const destination = projection(route.destination);

        if (!origin || !destination) {
            return '';
        }

        const middleX = (origin[0] + destination[0]) / 2;
        const middleY = (origin[1] + destination[1]) / 2;
        const curve = Math.max(22, Math.abs(destination[0] - origin[0]) * 0.12);

        return `M${origin[0]},${origin[1]} Q${middleX},${middleY - curve} ${destination[0]},${destination[1]}`;
    }

    function positionRouteLabel(route) {
        const origin = projection(route.origin);
        const destination = projection(route.destination);

        d3.select(this)
            .attr('x', (origin[0] + destination[0]) / 2)
            .attr('y', ((origin[1] + destination[1]) / 2) - 16);
    }

    function positionMapDot(dot) {
        const position = projection(dot.coordinate);
        d3.select(this).attr('cx', position[0]).attr('cy', position[1]);
    }

    function positionMapLabel(label) {
        const position = projection(label.coordinate);
        d3.select(this)
            .attr('x', position[0])
            .attr('y', position[1] + (label.offset || 0));
    }

    function renderVisualizations(entry, animate) {
        if (!migrationLayer || !languageLayer || !eventLayer) {
            return;
        }

        migrationLayer.selectAll('*').remove();
        languageLayer.selectAll('*').remove();
        eventLayer.selectAll('*').remove();

        entry.visualizations.forEach(visualization => {
            if (visualization.type === 'arrow') {
                drawRoute(visualization);
                return;
            }

            if (visualization.type === 'arrows' && Array.isArray(visualization.arrows)) {
                visualization.arrows.forEach((route, routeIndex) => {
                    drawRoute({
                        ...route,
                        label: route.label || (routeIndex === 0 ? visualization.label : ''),
                    });
                });
                return;
            }

            if (visualization.type === 'dot') {
                drawDots(visualization, eventLayer);
                return;
            }

            if (visualization.type === 'dots') {
                drawDots(visualization, languageLayer);
            }
        });

        redrawMap();
        animateVisualizations(animate);
    }

    function drawRoute(route) {
        if (!isCoordinate(route.origin) || !isCoordinate(route.destination)) {
            return;
        }

        migrationLayer
            .append('path')
            .datum({ origin: route.origin, destination: route.destination })
            .attr('class', 'history-route')
            .attr('marker-end', 'url(#history-arrowhead)');

        if (!route.label) {
            return;
        }

        migrationLayer
            .append('text')
            .datum({ origin: route.origin, destination: route.destination })
            .attr('class', 'history-route-label')
            .attr('text-anchor', 'middle')
            .text(route.label);
    }

    function drawDots(visualization, layer) {
        const coordinates = [];

        if (isCoordinate(visualization.origin)) {
            coordinates.push(visualization.origin);
        }

        if (Array.isArray(visualization.dotCoordinates)) {
            visualization.dotCoordinates.forEach(coordinate => {
                if (isCoordinate(coordinate) && !coordinates.some(item => coordinatesMatch(item, coordinate))) {
                    coordinates.push(coordinate);
                }
            });
        }

        coordinates.forEach((coordinate, coordinateIndex) => {
            layer
                .append('circle')
                .datum({ coordinate })
                .attr('class', coordinateIndex === 0 ? 'history-map-dot is-primary' : 'history-map-dot')
                .attr('r', coordinateIndex === 0 ? 7 : 5);

            const coordinateLabel = visualization.labels?.[coordinateIndex];

            if (coordinateLabel) {
                drawMapLabel(layer, coordinate, coordinateLabel, 20);
            }
        });

        if (visualization.label && isCoordinate(visualization.origin)) {
            drawMapLabel(layer, visualization.origin, visualization.label, -16);
        }
    }

    function drawMapLabel(layer, coordinate, label, offset) {
        layer
            .append('text')
            .datum({ coordinate, offset })
            .attr('class', 'history-map-label')
            .attr('text-anchor', 'middle')
            .text(label);
    }

    function animateVisualizations(animate) {
        const dots = [...languageLayer.selectAll('.history-map-dot').nodes(), ...eventLayer.selectAll('.history-map-dot').nodes()];
        const labels = [
            ...migrationLayer.selectAll('text').nodes(),
            ...languageLayer.selectAll('text').nodes(),
            ...eventLayer.selectAll('text').nodes(),
        ];
        const duration = animate && !prefersReducedMotion ? 0.55 : 0;

        if (dots.length > 0) {
            gsap.fromTo(
                dots,
                { opacity: 0, scale: 0, transformOrigin: 'center' },
                { opacity: 1, scale: 1, duration, stagger: duration ? 0.05 : 0, ease: 'back.out(1.8)' },
            );
        }

        if (labels.length > 0) {
            gsap.fromTo(labels, { opacity: 0 }, { opacity: 1, duration });
        }
    }

    function isCoordinate(coordinate) {
        return Array.isArray(coordinate)
            && coordinate.length >= 2
            && Number.isFinite(Number(coordinate[0]))
            && Number.isFinite(Number(coordinate[1]));
    }

    function coordinatesMatch(firstCoordinate, secondCoordinate) {
        return Number(firstCoordinate[0]) === Number(secondCoordinate[0])
            && Number(firstCoordinate[1]) === Number(secondCoordinate[1]);
    }

    function bindInteractions() {
        previousButton.addEventListener('click', showPreviousEntry);
        nextButton.addEventListener('click', showNextEntry);
        historyLayout.addEventListener('keydown', handleKeydown);
        historyLayout.addEventListener('pointerdown', handlePointerDown);
        historyLayout.addEventListener('pointerup', handlePointerUp);
    }

    function showPreviousEntry() {
        setActiveEntry(currentIndex - 1);
    }

    function showNextEntry() {
        setActiveEntry(currentIndex + 1);
    }

    function handleKeydown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            showPreviousEntry();
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            showNextEntry();
        }
    }

    function handlePointerDown(event) {
        if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
            return;
        }

        touchStart = { x: event.clientX, y: event.clientY };
    }

    function handlePointerUp(event) {
        if (!touchStart) {
            return;
        }

        const distanceX = event.clientX - touchStart.x;
        const distanceY = event.clientY - touchStart.y;
        touchStart = null;

        if (Math.abs(distanceX) < 45 || Math.abs(distanceX) < Math.abs(distanceY)) {
            return;
        }

        distanceX > 0 ? showPreviousEntry() : showNextEntry();
    }

    function observeLayout() {
        if (!window.ResizeObserver) {
            return;
        }

        resizeObserver = new ResizeObserver(() => updateRuler(false));
        resizeObserver.observe(timelineMarkers);
    }

    function destroy() {
        projectionTween?.kill();
        resizeObserver?.disconnect();
        previousButton.removeEventListener('click', showPreviousEntry);
        nextButton.removeEventListener('click', showNextEntry);
        historyLayout.removeEventListener('keydown', handleKeydown);
        historyLayout.removeEventListener('pointerdown', handlePointerDown);
        historyLayout.removeEventListener('pointerup', handlePointerUp);
        mapContainer.replaceChildren();
        timelineMarkers.replaceChildren();
        timelineContent.replaceChildren();
    }

    loadHistoryEntries();

    return {
        destroy,
        getState() {
            return {
                initialized: historyEntries.length > 0,
                currentIndex,
                currentId: historyEntries[currentIndex]?.id || null,
                currentYear: historyEntries[currentIndex]?.year_start || null,
                totalEntries: historyEntries.length,
            };
        },
        jumpToEntry(id) {
            const entryIndex = historyEntries.findIndex(entry => String(entry.id) === String(id));
            setActiveEntry(entryIndex);
        },
        jumpToYear(year) {
            if (historyEntries.length === 0) {
                return;
            }

            const targetYear = Number(year);
            const closestEntry = historyEntries.reduce((closest, entry, entryIndex) => {
                const distance = Math.abs(entry.year_start - targetYear);
                return distance < closest.distance ? { distance, entryIndex } : closest;
            }, { distance: Number.POSITIVE_INFINITY, entryIndex: 0 });

            setActiveEntry(closestEntry.entryIndex);
        },
        next: showNextEntry,
        prev: showPreviousEntry,
    };
}

function createEmptyPublicApi() {
    return {
        destroy() {},
        getState() {
            return { initialized: false };
        },
        jumpToEntry() {},
        jumpToYear() {},
        next() {},
        prev() {},
    };
}

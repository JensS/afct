# African Face Theme (AFCT)

A comprehensive WordPress/ClassicPress theme for the non-profit project africanface.org that provides rich content management and display functionality.

## Architecture Overview

### Current Architecture
The theme is built with a traditional WordPress architecture:

- **PHP Templates**: Core rendering is handled by PHP template files
- **JavaScript Enhancements**: Interactive features use vanilla JS and jQuery
- **CSS Styling**: Responsive design with mobile-first approach
- **WordPress Integration**: Custom meta boxes, REST API endpoints, and admin interfaces

### One-Page Architecture
The site uses a unique one-page architecture:
- Main template (`template-homepage.php`) assembles content from individual WordPress pages
- Pages are selected and ordered based on the primary menu configuration
- Each page is wrapped in a section with an ID based on the page slug
- The `IN_ONEPAGER` constant manages template inclusion to prevent duplicate headers/footers

## Core Features

- **Theme Switcher**: Toggle between light and dark visual modes
- **Responsive Design**: Optimized layouts for all device sizes (mobile-first approach)
- **Custom Navigation**: Enhanced menu walker class for specialized navigation
- **Split Headlines**: Support for comma-separated headlines that display in two parts
- **Interactive Components**: Custom-built carousels, audio players, and visualizations

## Content Templates

| Template | Purpose | Key Features |
|----------|---------|-------------|
| `template-homepage.php` | One-page main site | Assembles content from menu items |
| `template-intro.php` | Introduction section | Fullscreen background video |
| `template-gallery.php` | Photography display | Flexible image grid layouts |
| `template-history.php` | Historical timeline | Interactive map visualizations |
| `template-podcast.php` | Audio content | Custom audio player with chapters |
| `template-prospect.php` | Future initiatives | Image carousel with CTAs |
| `template-credits.php` | Team information | Structured credits display |

## JavaScript Components

The theme includes several custom JavaScript components:

- **History Timeline**: Complex D3.js visualization (`history-timeline.js`)
- **Prospect Carousel**: Custom image slider (`prospect-carousel.js`)
- **YouTube Consent**: GDPR-compliant video embedding (`youtube-consent.js`)
- **Headline Positioning**: Dynamic text layout (`headline-positioning.js`)
- **Custom Audio Player**: Chapter-based audio interface

## CSS Architecture

- **Mobile-First Approach**: Base styles for mobile with progressive enhancement
- **Responsive Breakpoints**:
  - Mobile landscape: 768px+
  - Desktop base: 1025px+
  - Desktop L: 1281px+
  - Desktop XL: 1441px+
  - Desktop XXL: 1921px+
- **Component-Based**: Modular CSS files for maintainability
- **CSS Variables**: Theme colors and typography defined as CSS variables

## Data Management

### Custom Meta Boxes
The theme uses custom meta boxes for specialized content:
- Gallery layout configuration
- Podcast episode management
- History timeline entries
- Prospect carousel slides

### REST API
Custom endpoints provide structured data:
- `/wp-json/afct/v1/history`: Timeline visualization data

## React Migration Considerations

### Components to Migrate
Key components that would benefit from React implementation:

1. **History Timeline Visualization**: Currently uses D3.js with jQuery
2. **Prospect Carousel**: Currently uses jQuery for animation
3. **Custom Audio Player**: Currently uses vanilla JS
4. **Gallery Grid**: Currently uses static HTML generation

### Data Flow Considerations
- Current data flow relies on PHP template variables and localized JS objects
- React implementation would need to access data via REST API endpoints
- WordPress admin interfaces would still manage content creation

### Progressive Enhancement Strategy
A phased approach to React migration could include:
1. Create React components that replace existing JS functionality
2. Implement a data fetching layer using the WordPress REST API
3. Gradually replace PHP template rendering with React components
4. Maintain backward compatibility with existing admin interfaces

## Performance Optimizations

The theme includes several performance optimizations:
- Emoji removal for reduced overhead
- Selective script and style loading
- Version string generation based on file modification time for cache busting
- Minimal external dependencies

## Development Workflow

Current development workflow uses:
- Node.js and npm for dependency management
- SASS compilation for CSS
- Manual JavaScript bundling
- WordPress coding standards

## Additional Resources

- Theme documentation is maintained in this README
- Custom data structures are documented in their respective sections
- Admin interfaces include contextual help

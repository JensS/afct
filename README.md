The WordPress/Classicpress theme for the non-profit project africanface.org                                                                             
                                                                                                                                           
A comprehensive theme that provides rich content management and display functionality for the African Face project.                        
                                                                                                                                           
## Core Features                                                                                                                           
                                                                                                                                           
- **Bright/Dark Theme Switcher**: Toggle between light and dark visual modes                                                               
- **One-Page Architecture**: Assembles content segments from individual WordPress pages for easier management                              
- **Responsive Design**: Optimized layouts for desktop and mobile devices                                                                  
- **Custom Navigation**: Special menu walker class for enhanced navigation experience                                                      
- **Split Headlines**: Support for comma-separated headlines that display in two parts for visual interest

## Content Management Features                                                                                                             
                                                                                                                                           
### Homepage Management                                                                                                                    
- Customizable homepage sections with drag-and-drop reordering                                                                               
- takes primary menu pages and order as data source for onepager                                                                

### Intro Page
-  Fullscreen Background video support with cover image fallback    

### About Page
- About section with customizable text and image   

### Gallery Page                                                                                                                         
- Flexible gallery layout manager for "Stills" pages                                                                                       
- Row-based organization with customizable image arrangements                                                                              
- Add, remove, and reorder images within each row                                                                                          
                                                                                                                                           
### History Page                                                                                                                       
- Interactive visualization of historical events                                                                                           
- Custom data structure for representing complex historical information                                                                    
- Map integration with multiple zoom levels                                                                                                
- Multiple visualization types (arrows, dots, dot clusters)                                                                                
                                                                                                                                           
### Podcast Page                                                                                                                         
- Audio file management with embedded player                                                                                               
- Chapter markers with timestamps                                                                                                          
- Guest management with images and information                                                                                             
- Custom meta fields for podcast details                                                                                                   
                                                                                                                                           
### Prospect Page                                                                                                                      
- Carousel slider for showcasing content                                                                                                   
- Customizable slides with images, labels, and URLs                                                                                        
- Text content section above the carousel                                                                                                  
                                                                                                                                           
### Credits Page                                                                                                                         
- Team credits management                                                                                                                  
- Default credits loaded from JSON file                                                                                                    
- Customizable through admin interface                                                                                                     
                                                                                                                                           
## Admin Interfaces                                                                                                                        
                                                                                                                                           
### Meta Boxes                                                                                                                             
- **Gallery Layout**: Configure image galleries for "Stills" pages                                                                         
- **Hero Video**: Add background videos with cover images                                                                                  
- **History Timeline**: Create and manage historical entries with visualizations                                                           
- **Homepage Sections**: Manage homepage content sections                                                                                  
- **Podcast Management**: Configure podcast episodes, guests, and chapters                                                                 
- **Prospect Carousel**: Manage carousel slides and content                                                                                
- **About Section**: Customize about text and image                                                                                        
- **YouTube Embed**: Add YouTube videos to pages                                                                                           
- **Credits**: Manage team credits information                                                                                             
                                                                                                                                           
## Templates                                                                                                                               
- `template-homepage.php`: One-page main site template                                                                                     
- `template-intro.php`: Intro page with fullscreen background video
- `template-gallery.php`: Gallery/Stills page with flexible image layouts
- `template-history.php`: Interactive history timeline with map visualizations
- `template-podcast.php`: Podcast page with audio player and episode information
- `template-prospect.php`: Prospect page with carousel                                                                                     
- `template-credits.php`: Team credits display                                                                                             
                                                                                                                                           
## REST API                                                                                                                                
The theme exposes data through custom REST API endpoints:                                                                                  
                                                                                                                                           
### History Timeline                                                                                                                       
- Endpoint: `/wp-json/afct/v1/history`                                                                                                     
- Returns structured history timeline data           

## Additional Features

### One-Page Architecture
- Defined by `template-homepage.php`
- Uses `IN_ONEPAGER` constant to manage template inclusion
- Automatically assembles pages from menu items in the primary menu
- Wraps each page in a section with ID based on the page slug

### Theme Optimization
- Emoji removal for improved performance
- Selective script and style loading
- Version string generation based on file modification time for cache busting

### JavaScript Utilities
- Headline positioning for visual layout
- YouTube consent mechanism for GDPR compliance
- Custom admin interfaces for meta boxes

### Admin Customizations
- Simplified WordPress admin footer
- Removal of default meta boxes for cleaner editing experience
- Custom admin scripts for managing complex content types

### Split Headlines
- Upper and lower headline positioning for visual interest
- Consistent implementation across all templates

### Custom JSON Data Sources
- Credits data loaded from external JSON file
- Fallback mechanisms for missing data
- Structured data approach for complex content types
## History Timeline Data Structure

The history timeline feature uses a structured data format to represent historical events and visualizations:

### Entry Structure
Each history entry contains:
- `id`: Unique identifier (same as year_start)
- `year_start`: Starting year of the event
- `title`: Title of the event
- `paragraph`: Description text
- `map_zoom`: Map zoom level (south_africa, africa, europe_and_africa)
- `visualizations`: Array of visualization objects

### Visualization Types
The timeline supports three types of visualizations:

1. **Arrow** (`type: "arrow"`):
   - `origin`: [longitude, latitude] coordinates
   - `destination`: [longitude, latitude] coordinates
   - `label`: Optional text label

2. **Dot** (`type: "dot"`):
   - `origin`: [longitude, latitude] coordinates
   - `label`: Optional text label

3. **Dots** (`type: "dots"`):
   - `origin`: [longitude, latitude] coordinates for the central point (used for initial placement and label)
   - `label`: Optional text label
   - `dotCoordinates`: Array of coordinate pairs for precise dot placement. If omitted, only the `origin` point is used.
     ```json
     "dotCoordinates": [
       [24.0, -28.5],  // [longitude, latitude]
       [26.0, -29.5],
       [25.5, -30.0]
     ]
     ```

### Example JSON Structure

```json
[
  {
    "id": 1500,
    "year_start": 1500,
    "year_end": 1550,
    "title": "Bantu Languages",
    "paragraph": "The spread of Bantu languages across southern Africa...",
    "map_zoom": "africa",
    "visualizations": [
      {
        "type": "dots",
        "label": "Bantu Language Distribution",
        "origin": [25.0, -29.0],
        "dotCoordinates": [
          [24.0, -28.5],
          [26.0, -29.5],
          [25.5, -30.0]
        ]
      }
    ]
  }
]
```

### REST API
Timeline data is accessible via the REST API endpoint:
`/wp-json/afct/v1/history`

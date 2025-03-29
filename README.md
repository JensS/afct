# African Face WordPress Plugin

The WordPress plugin for the non-profit project africanface.org 

A onepage theme that provides the following functionality:
- Bright/dark theme switcher
- Assembles the contents of the segments from individual WordPress pages for easier management
- Podcast player
- Desktop/mobile layouts
- Interactive history timeline

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

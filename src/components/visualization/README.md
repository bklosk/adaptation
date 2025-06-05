# Point Cloud Visualization Components

This directory contains the organized point cloud visualization components for the photo-demo application.

## Component Structure

### Core Components

- **`PointCloudVisualization.tsx`** - Main visualization component that orchestrates the entire point cloud display
- **`SatelliteVisualization.tsx`** - Component for displaying satellite imagery using Mapbox
- **`FloodVisualization.tsx`** - Component for displaying 100-year flood depth visualization from the API
- **`StatusDisplay.tsx`** - Component for showing job status and point count
- **`PointSizeControl.tsx`** - Component for controlling point size with a slider
- **`CameraControls.tsx`** - Component for camera manipulation with zoom, pitch, bearing controls and preset views
- **`KeyboardShortcuts.tsx`** - Component showing keyboard shortcuts help and handling keyboard navigation

### Utility Classes

- **`apiService.ts`** - Service class for handling API communication with the backend
- **`dataProcessor.ts`** - Utility class for processing LAS files and coordinate transformations
- **`types.ts`** - TypeScript interfaces and type definitions

### Index File

- **`index.ts`** - Barrel export file for easy importing of components and utilities

## Usage

```tsx
import { PointCloudVisualization } from "../components/visualization";

<PointCloudVisualization
  address="1250 Wildwood Road, Boulder, CO"
  bufferKm={1.0}
  initialViewState={{
    longitude: -105.2705,
    latitude: 40.015,
    zoom: 15,
    pitch: 60,
    bearing: 0,
  }}
/>;
```

## Features

- **Modular Architecture**: Each component has a single responsibility
- **TypeScript Support**: Full type safety with shared interfaces
- **Error Handling**: Robust error handling for network and processing issues
- **Coordinate Transformation**: Automatic UTM to WGS84 coordinate conversion
- **Progress Tracking**: Real-time download progress indication
- **Responsive UI**: Tailwind CSS styling for modern appearance
- **Automatic Zoom Calculation**: Intelligently calculates optimal zoom level based on point cloud extent
- **Advanced Camera Controls**: Interactive controls for zoom, pitch, bearing with preset views
- **Enhanced 3D Navigation**: Smooth panning, rotation, and zooming with inertia
- **Keyboard Navigation**: Full keyboard support for camera movement and control
 - **Better Point Cloud Rendering**: Improved depth testing and material properties for realistic 3D visualization
 - **Softer Lighting**: Reduced specular highlights for a less harsh light source

## Camera Controls

The new `CameraControls` component provides:

- **Zoom Control**: Precise zoom adjustment from 8x to 22x
- **Pitch Control**: Tilt angle from 0° (top-down) to 85° (side view)
- **Bearing Control**: 360° rotation control
- **Preset Views**: Quick buttons for common viewing angles
  - Top View (0° pitch, 0° bearing)
  - Angle View (45° pitch, 0° bearing)
  - Side View (85° pitch, 0° bearing)
  - Corner View (45° pitch, 45° bearing)
- **Reset View**: Automatically centers and optimally zooms to the point cloud

## Keyboard Controls

The visualization now supports comprehensive keyboard navigation:

### Navigation

- **Arrow Keys**: Pan camera view (up/down/left/right)
- **W A S D**: Alternative pan controls (forward/left/backward/right)

### Zoom

- **+ or =**: Zoom in
- **- or \_**: Zoom out

### Rotation & Pitch

- **Q / E**: Rotate camera left/right (bearing)
- **R / F**: Tilt camera up/down (pitch)

### Utility

- **Spacebar**: Reset to optimal view (centers and zooms to point cloud)

_Note: The keyboard shortcuts help panel (?) in the top-left provides a quick reference._

## API Integration

The components integrate with a backend API running on `http://localhost:8000` that provides:

- `/process` - Start a new point cloud processing job
- `/job/{id}` - Check job status
- `/download/{id}` - Download processed LAS files

## Data Processing

The `dataProcessor.ts` handles:

- LAS file parsing using `@loaders.gl/las`
- Color data extraction (8-bit and 16-bit support)
- Coordinate system transformations using `proj4`
- Point cloud data structure conversion for DeckGL

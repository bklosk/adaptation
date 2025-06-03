# Point Cloud Visualization Components

This directory contains the organized point cloud visualization components for the photo-demo application.

## Component Structure

### Core Components

- **`PointCloudVisualization.tsx`** - Main visualization component that orchestrates the entire point cloud display
- **`StatusDisplay.tsx`** - Component for showing job status and point count
- **`PointSizeControl.tsx`** - Component for controlling point size with a slider

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

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SatelliteVisualizationProps {
  address: string;
  imageSize?: string;
  resolution?: number;
}

const SatelliteVisualization: React.FC<SatelliteVisualizationProps> = ({
  address,
  resolution = 2048,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFloodLoading, setIsFloodLoading] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const floodImageUrl = useRef<string | null>(null);

  // Clean up flood layer and source
  const cleanupFloodLayer = useCallback(() => {
    if (!map.current) return;

    // Remove layer if it exists
    if (map.current.getLayer("flood-layer")) {
      map.current.removeLayer("flood-layer");
    }

    // Remove source if it exists
    if (map.current.getSource("flood-source")) {
      map.current.removeSource("flood-source");
    }

    // Revoke previous blob URL to prevent memory leaks
    if (floodImageUrl.current) {
      URL.revokeObjectURL(floodImageUrl.current);
      floodImageUrl.current = null;
    }
  }, []);

  // Fetch flood raster from API
  const fetchFloodRaster = useCallback(
    async (bounds: mapboxgl.LngLatBounds) => {
      if (!address) return;

      setIsFloodLoading(true);
      try {
        // Calculate bounding box size in meters (approximate)
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Rough conversion: 1 degree latitude ≈ 111,000 meters
        const latDiff = ne.lat - sw.lat;
        const lngDiff = ne.lng - sw.lng;
        const avgLat = (ne.lat + sw.lat) / 2;

        // Account for longitude compression at higher latitudes
        const latMeters = latDiff * 111000;
        const lngMeters = lngDiff * 111000 * Math.cos((avgLat * Math.PI) / 180);

        // Use the larger dimension for square bbox
        const bboxSize = Math.max(latMeters, lngMeters);

        const params = new URLSearchParams({
          address: address,
          bbox_m: bboxSize.toString(),
          resolution: resolution.toString(),
        });

        const response = await fetch(
          `http://localhost:8000/flood-overhead?${params}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch flood data: ${response.status} ${response.statusText}`
          );
        }

        const blob = await response.blob();

        // Clean up previous flood layer
        cleanupFloodLayer();

        // Create blob URL for the image
        floodImageUrl.current = URL.createObjectURL(blob);

        // Add flood raster source and layer
        if (map.current) {
          // Get current bounds for the raster coordinates
          const currentBounds = map.current.getBounds();
          if (currentBounds) {
            const coords: [
              [number, number],
              [number, number],
              [number, number],
              [number, number]
            ] = [
              [currentBounds.getWest(), currentBounds.getNorth()],
              [currentBounds.getEast(), currentBounds.getNorth()],
              [currentBounds.getEast(), currentBounds.getSouth()],
              [currentBounds.getWest(), currentBounds.getSouth()],
            ];

            map.current.addSource("flood-source", {
              type: "image",
              url: floodImageUrl.current,
              coordinates: coords,
            });

            map.current.addLayer({
              id: "flood-layer",
              type: "raster",
              source: "flood-source",
              paint: {
                "raster-opacity": 0.6,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch flood raster:", error);
        // Don't set main error state for flood layer failures
      } finally {
        setIsFloodLoading(false);
      }
    },
    [address, resolution, cleanupFloodLayer]
  );

  // Geocode address to get coordinates
  const geocodeAddress = async (
    addressQuery: string
  ): Promise<[number, number]> => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      throw new Error(
        "Mapbox access token not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file."
      );
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      addressQuery
    )}.json?access_token=${token}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Geocoding API error:", response.status, errorText);
      throw new Error(
        `Failed to geocode address: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }

    return data.features[0].center; // [longitude, latitude]
  };

  const initializeMap = useCallback(async () => {
    if (!address || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      setError(
        "Mapbox access token not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file."
      );
      return;
    }

    // Set the Mapbox access token
    mapboxgl.accessToken = token;

    setIsLoading(true);
    setError(null);

    try {
      const [longitude, latitude] = await geocodeAddress(address);

      // Clean up existing map
      if (map.current) {
        map.current.remove();
      }

      // Initialize new map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [longitude, latitude],
        zoom: 18,
        interactive: false, // Disable all interactions
        attributionControl: false, // Remove attribution
        logoPosition: "bottom-right", // Position logo (we'll hide it with CSS)
      });

      // Remove the Mapbox logo and load flood raster
      map.current.on("load", () => {
        const logo = document.querySelector(
          ".mapboxgl-ctrl-logo"
        ) as HTMLElement;
        if (logo) {
          logo.style.display = "none";
        }

        // Load initial flood raster
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
          }
        }
      });

      // Add event listeners for map view changes
      map.current.on("moveend", () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
          }
        }
      });

      map.current.on("zoomend", () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load satellite view"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchFloodRaster]);

  useEffect(() => {
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Clean up flood layer resources
      cleanupFloodLayer();
    };
  }, [initializeMap, cleanupFloodLayer]);

  // Hide any remaining Mapbox UI elements
  useEffect(() => {
    const hideMapboxUI = () => {
      const elementsToHide = [
        ".mapboxgl-ctrl-logo",
        ".mapboxgl-ctrl-attrib",
        ".mapboxgl-ctrl",
        ".mapboxgl-canvas:focus",
      ];

      elementsToHide.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      });
    };

    const timer = setTimeout(hideMapboxUI, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    initializeMap();
  };

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: "#1B2223" }}
    >
      {/* Header */}
      <div
        className="p-4 shadow-sm border-b-2 border-white"
        style={{ backgroundColor: "#1B2223" }}
      >
        <h2 className="text-lg font-black text-white mb-1 font-space-grotesk">
          Satellite View
        </h2>
        <p className="text-sm text-gray-300 truncate font-space-grotesk">
          {address}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {(isLoading || isFloodLoading) && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "#1B2223" }}
          >
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-300 font-space-grotesk">
                {isLoading
                  ? "Loading satellite view..."
                  : "Loading flood data..."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "#1B2223" }}
          >
            <div className="text-center p-6">
              <div className="text-red-400 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-space-grotesk">
                Failed to load satellite view
              </h3>
              <p className="text-gray-300 mb-4 max-w-md font-space-grotesk">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors border-2 border-blue-600 font-space-grotesk font-black"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="h-full w-full"
          style={{
            // Hide any remaining Mapbox UI elements
            filter: "none",
          }}
        />
      </div>

      {/* Controls */}
      {!isLoading && !error && (
        <div
          className="p-3 border-t-2 border-white flex justify-between items-center"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-300 font-space-grotesk">
              Satellite imagery for location
            </div>
            {isFloodLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-3 w-3 border border-blue-400 border-t-transparent" />
                <span className="text-xs text-blue-400 font-space-grotesk">
                  Loading flood data
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-white font-space-grotesk"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default SatelliteVisualization;

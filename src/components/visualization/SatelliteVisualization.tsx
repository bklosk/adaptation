"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SatelliteVisualizationProps {
  address: string;
  imageSize?: string;
}

const SatelliteVisualization: React.FC<SatelliteVisualizationProps> = ({
  address,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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

      // Remove the Mapbox logo
      map.current.on("load", () => {
        const logo = document.querySelector(
          ".mapboxgl-ctrl-logo"
        ) as HTMLElement;
        if (logo) {
          logo.style.display = "none";
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
  }, [address]);

  useEffect(() => {
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initializeMap]);

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
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "#1B2223" }}
          >
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-300 font-space-grotesk">
                Loading satellite view...
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
          <div className="text-xs text-gray-300 font-space-grotesk">
            Satellite imagery for location
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

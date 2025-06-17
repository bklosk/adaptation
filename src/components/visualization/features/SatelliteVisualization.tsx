"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isFloodVisible, setIsFloodVisible] = useState<boolean>(true);
  const [isWrtcLoading, setIsWrtcLoading] = useState<boolean>(false);
  const [isWrtcVisible, setIsWrtcVisible] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<"flood" | "wrtc">("flood");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const floodImageUrl = useRef<string | null>(null);
  const wrtcImageUrl = useRef<string | null>(null);

  // Style for panels and buttons, consistent with LocationForm
  const panelStyle = {
    backdropFilter: "blur(10px) saturate(180%)",
    WebkitBackdropFilter: "blur(10px) saturate(180%)",
    backgroundColor: "rgba(23, 23, 23, 0.75)", // Darker, less transparent background
    border: "1px solid rgba(56, 189, 125, 0.4)", // Emerald border, less opaque
    borderRadius: "0.75rem", // Consistent rounded corners
    color: "#E5E7EB", // Light gray text for better contrast
    fontFamily: '"Space Grotesk", sans-serif',
  };

  const buttonStyle = {
    ...panelStyle, // Inherit panel styling for consistency
    padding: "0.5rem 1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition:
      "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  };

  const buttonHoverStyle = {
    backgroundColor: "rgba(56, 189, 125, 0.2)", // Emerald accent on hover
    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
  };

  // Clean up flood layer and source
  const cleanupFloodLayer = useCallback(() => {
    if (!map.current) return;

    try {
      // Check if map is still valid and loaded before attempting operations
      if (!map.current.isStyleLoaded()) return;

      // Remove layer if it exists
      if (map.current.getLayer("flood-layer")) {
        map.current.removeLayer("flood-layer");
      }

      // Remove source if it exists
      if (map.current.getSource("flood-source")) {
        map.current.removeSource("flood-source");
      }
    } catch (error) {
      // Silently handle errors that occur during cleanup (e.g., map already destroyed)
      console.warn("Error during flood layer cleanup:", error);
    }

    // Revoke previous blob URL to prevent memory leaks
    if (floodImageUrl.current) {
      URL.revokeObjectURL(floodImageUrl.current);
      floodImageUrl.current = null;
    }
  }, []);

  // Clean up WRTC layer and source
  const cleanupWrtcLayer = useCallback(() => {
    if (!map.current) return;

    try {
      // Check if map is still valid and loaded before attempting operations
      if (!map.current.isStyleLoaded()) return;

      // Remove layer if it exists
      if (map.current.getLayer("wrtc-layer")) {
        map.current.removeLayer("wrtc-layer");
      }

      // Remove source if it exists
      if (map.current.getSource("wrtc-source")) {
        map.current.removeSource("wrtc-source");
      }
    } catch (error) {
      // Silently handle errors that occur during cleanup (e.g., map already destroyed)
      console.warn("Error during WRTC layer cleanup:", error);
    }

    // Revoke previous blob URL to prevent memory leaks
    if (wrtcImageUrl.current) {
      URL.revokeObjectURL(wrtcImageUrl.current);
      wrtcImageUrl.current = null;
    }
  }, []);

  // Toggle flood layer visibility
  const toggleFloodLayer = useCallback(() => {
    if (!map.current) return;

    try {
      // Check if map is still valid and loaded before attempting operations
      if (!map.current.isStyleLoaded()) return;

      // If WRTC is currently active, switch to flood
      if (activeLayer === "wrtc") {
        setActiveLayer("flood");
        setIsWrtcVisible(false);
        setIsFloodVisible(true);

        // Hide WRTC layer with animation
        if (map.current.getLayer("wrtc-layer")) {
          const startTime = Date.now();
          const duration = 300;
          const startOpacity = 0.6;

          const animateOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity * (1 - progress);

            if (map.current && map.current.getLayer("wrtc-layer")) {
              map.current.setPaintProperty(
                "wrtc-layer",
                "raster-opacity",
                currentOpacity
              );

              if (progress >= 1) {
                map.current.setLayoutProperty(
                  "wrtc-layer",
                  "visibility",
                  "none"
                );
              }
            }

            if (progress < 1) {
              requestAnimationFrame(animateOut);
            }
          };
          requestAnimationFrame(animateOut);
        }

        // Show flood layer with animation
        if (map.current.getLayer("flood-layer")) {
          map.current.setLayoutProperty("flood-layer", "visibility", "visible");
          map.current.setPaintProperty("flood-layer", "raster-opacity", 0);

          const startTime = Date.now();
          const duration = 300;
          const targetOpacity = 0.6;

          const animateIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = progress * targetOpacity;

            if (map.current && map.current.getLayer("flood-layer")) {
              map.current.setPaintProperty(
                "flood-layer",
                "raster-opacity",
                currentOpacity
              );
            }

            if (progress < 1) {
              requestAnimationFrame(animateIn);
            }
          };
          requestAnimationFrame(animateIn);
        }
        return;
      }

      // Toggle flood layer visibility when it's already active
      const newVisibility = !isFloodVisible;
      setIsFloodVisible(newVisibility);

      if (map.current.getLayer("flood-layer")) {
        if (newVisibility) {
          // Show layer: make visible and animate opacity from 0 to 0.6
          map.current.setLayoutProperty("flood-layer", "visibility", "visible");
          map.current.setPaintProperty("flood-layer", "raster-opacity", 0);

          // Animate opacity increase
          const startTime = Date.now();
          const duration = 300; // 300ms
          const targetOpacity = 0.6;

          const animateIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = progress * targetOpacity;

            if (map.current && map.current.getLayer("flood-layer")) {
              map.current.setPaintProperty(
                "flood-layer",
                "raster-opacity",
                currentOpacity
              );
            }

            if (progress < 1) {
              requestAnimationFrame(animateIn);
            }
          };
          requestAnimationFrame(animateIn);
        } else {
          // Hide layer: animate opacity from 0.6 to 0, then hide
          const startTime = Date.now();
          const duration = 300; // 300ms
          const startOpacity = 0.6;

          const animateOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity * (1 - progress);

            if (map.current && map.current.getLayer("flood-layer")) {
              map.current.setPaintProperty(
                "flood-layer",
                "raster-opacity",
                currentOpacity
              );

              if (progress >= 1) {
                // Animation complete, hide the layer
                map.current.setLayoutProperty(
                  "flood-layer",
                  "visibility",
                  "none"
                );
              }
            }

            if (progress < 1) {
              requestAnimationFrame(animateOut);
            }
          };
          requestAnimationFrame(animateOut);
        }
      }
    } catch (error) {
      console.warn("Error toggling flood layer:", error);
    }
  }, [isFloodVisible, activeLayer]);

  // Toggle WRTC layer visibility
  const toggleWrtcLayer = useCallback(() => {
    if (!map.current) return;

    try {
      // Check if map is still valid and loaded before attempting operations
      if (!map.current.isStyleLoaded()) return;

      // If flood is currently active, switch to WRTC
      if (activeLayer === "flood") {
        setActiveLayer("wrtc");
        setIsFloodVisible(false);
        setIsWrtcVisible(true);

        // Hide flood layer with animation
        if (map.current.getLayer("flood-layer")) {
          const startTime = Date.now();
          const duration = 300;
          const startOpacity = 0.6;

          const animateOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity * (1 - progress);

            if (map.current && map.current.getLayer("flood-layer")) {
              map.current.setPaintProperty(
                "flood-layer",
                "raster-opacity",
                currentOpacity
              );

              if (progress >= 1) {
                map.current.setLayoutProperty(
                  "flood-layer",
                  "visibility",
                  "none"
                );
              }
            }

            if (progress < 1) {
              requestAnimationFrame(animateOut);
            }
          };
          requestAnimationFrame(animateOut);
        }

        // Show WRTC layer with animation
        if (map.current.getLayer("wrtc-layer")) {
          map.current.setLayoutProperty("wrtc-layer", "visibility", "visible");
          map.current.setPaintProperty("wrtc-layer", "raster-opacity", 0);

          const startTime = Date.now();
          const duration = 300;
          const targetOpacity = 0.6;

          const animateIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = progress * targetOpacity;

            if (map.current && map.current.getLayer("wrtc-layer")) {
              map.current.setPaintProperty(
                "wrtc-layer",
                "raster-opacity",
                currentOpacity
              );
            }

            if (progress < 1) {
              requestAnimationFrame(animateIn);
            }
          };
          requestAnimationFrame(animateIn);
        }
        return;
      }

      // Toggle WRTC layer visibility when it's already active
      const newVisibility = !isWrtcVisible;
      setIsWrtcVisible(newVisibility);

      if (map.current.getLayer("wrtc-layer")) {
        if (newVisibility) {
          // Show layer: make visible and animate opacity from 0 to 0.6
          map.current.setLayoutProperty("wrtc-layer", "visibility", "visible");
          map.current.setPaintProperty("wrtc-layer", "raster-opacity", 0);

          // Animate opacity increase
          const startTime = Date.now();
          const duration = 300; // 300ms
          const targetOpacity = 0.6;

          const animateIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = progress * targetOpacity;

            if (map.current && map.current.getLayer("wrtc-layer")) {
              map.current.setPaintProperty(
                "wrtc-layer",
                "raster-opacity",
                currentOpacity
              );
            }

            if (progress < 1) {
              requestAnimationFrame(animateIn);
            }
          };
          requestAnimationFrame(animateIn);
        } else {
          // Hide layer: animate opacity from 0.6 to 0, then hide
          const startTime = Date.now();
          const duration = 300; // 300ms
          const startOpacity = 0.6;

          const animateOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity * (1 - progress);

            if (map.current && map.current.getLayer("wrtc-layer")) {
              map.current.setPaintProperty(
                "wrtc-layer",
                "raster-opacity",
                currentOpacity
              );

              if (progress >= 1) {
                // Animation complete, hide the layer
                map.current.setLayoutProperty(
                  "wrtc-layer",
                  "visibility",
                  "none"
                );
              }
            }

            if (progress < 1) {
              requestAnimationFrame(animateOut);
            }
          };
          requestAnimationFrame(animateOut);
        }
      }
    } catch (error) {
      console.warn("Error toggling WRTC layer:", error);
    }
  }, [isWrtcVisible, activeLayer]);

  // Get state abbreviation from address (improved approach)
  const getStateFromAddress = (address: string): string => {
    console.log("Extracting state from address:", address);

    // Extract state from address - look for common patterns
    const stateMatch = address.match(/,\s*([A-Z]{2})(?:\s|$|,)/i);
    if (stateMatch) {
      const state = stateMatch[1].toUpperCase();
      console.log("Found state:", state);
      return state;
    }

    // Look for state names and convert to abbreviations
    const stateNames: Record<string, string> = {
      alabama: "AL",
      alaska: "AK",
      arizona: "AZ",
      arkansas: "AR",
      california: "CA",
      colorado: "CO",
      connecticut: "CT",
      delaware: "DE",
      florida: "FL",
      georgia: "GA",
      hawaii: "HI",
      idaho: "ID",
      illinois: "IL",
      indiana: "IN",
      iowa: "IA",
      kansas: "KS",
      kentucky: "KY",
      louisiana: "LA",
      maine: "ME",
      maryland: "MD",
      massachusetts: "MA",
      michigan: "MI",
      minnesota: "MN",
      mississippi: "MS",
      missouri: "MO",
      montana: "MT",
      nebraska: "NE",
      nevada: "NV",
      "new hampshire": "NH",
      "new jersey": "NJ",
      "new mexico": "NM",
      "new york": "NY",
      "north carolina": "NC",
      "north dakota": "ND",
      ohio: "OH",
      oklahoma: "OK",
      oregon: "OR",
      pennsylvania: "PA",
      "rhode island": "RI",
      "south carolina": "SC",
      "south dakota": "SD",
      tennessee: "TN",
      texas: "TX",
      utah: "UT",
      vermont: "VT",
      virginia: "VA",
      washington: "WA",
      "west virginia": "WV",
      wisconsin: "WI",
      wyoming: "WY",
    };

    const lowerAddress = address.toLowerCase();
    for (const [name, abbr] of Object.entries(stateNames)) {
      if (lowerAddress.includes(name)) {
        console.log("Found state by name:", name, "->", abbr);
        return abbr;
      }
    }

    // Fallback to Colorado for demo purposes
    console.log("No state found, defaulting to CO");
    return "CO";
  };

  // Fetch WRTC raster from API using COG endpoint
  const fetchWrtcRaster = useCallback(
    async (bounds: mapboxgl.LngLatBounds) => {
      if (!address) return;

      setIsWrtcLoading(true);
      try {
        // Get state from address
        const state = getStateFromAddress(address);

        // Get bounds coordinates
        const minLon = bounds.getWest();
        const minLat = bounds.getSouth();
        const maxLon = bounds.getEast();
        const maxLat = bounds.getNorth();

        console.log("WRTC raster request:", {
          state,
          bounds: { minLon, minLat, maxLon, maxLat },
          layer: "wildfire_hazard_potential",
        });

        const params = new URLSearchParams({
          state: state,
          layer: "wildfire_hazard_potential",
          min_lon: minLon.toString(),
          min_lat: minLat.toString(),
          max_lon: maxLon.toString(),
          max_lat: maxLat.toString(),
          width: "512",
          height: "512",
          colormap: "Reds",
        });

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://api.climateriskplan.com";

        console.log(
          "Making WRTC API request to:",
          `${apiUrl}/cog/raster?${params}`
        );

        const response = await fetch(`${apiUrl}/cog/raster?${params}`);

        console.log("WRTC API response:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          url: response.url,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("WRTC API error response:", errorText);
          throw new Error(
            `Failed to fetch WRTC data: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const blob = await response.blob();

        console.log("WRTC blob received:", {
          size: blob.size,
          type: blob.type,
        });

        // Clean up previous WRTC layer
        cleanupWrtcLayer();

        // Create blob URL for the image
        wrtcImageUrl.current = URL.createObjectURL(blob);

        // Add WRTC raster source and layer
        if (map.current) {
          // Create coordinates for the raster based on the actual bounds
          const coords: [
            [number, number],
            [number, number],
            [number, number],
            [number, number]
          ] = [
            [minLon, maxLat], // top-left
            [maxLon, maxLat], // top-right
            [maxLon, minLat], // bottom-right
            [minLon, minLat], // bottom-left
          ];

          map.current.addSource("wrtc-source", {
            type: "image",
            url: wrtcImageUrl.current,
            coordinates: coords,
          });

          map.current.addLayer({
            id: "wrtc-layer",
            type: "raster",
            source: "wrtc-source",
            paint: {
              "raster-opacity": 0, // Always start hidden
            },
            layout: {
              visibility: "none", // Always start hidden
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch WRTC raster:", error);
        // Don't set main error state for WRTC layer failures
      } finally {
        setIsWrtcLoading(false);
      }
    },
    [address, cleanupWrtcLayer]
  );

  // Fetch flood raster from API
  const fetchFloodRaster = useCallback(
    async (bounds: mapboxgl.LngLatBounds) => {
      if (!address) return;

      setIsFloodLoading(true);
      try {
        // Get the center of the current map bounds
        const center = bounds.getCenter();

        // Use a fixed bbox size that covers the visible area well
        // Calculate approximate meters per degree at this latitude
        const metersPerDegree = 111000 * Math.cos((center.lat * Math.PI) / 180);

        // Calculate the map bounds in meters
        const latSpan = (bounds.getNorth() - bounds.getSouth()) * 111000;
        const lngSpan = (bounds.getEast() - bounds.getWest()) * metersPerDegree;

        // Use the larger dimension and add substantial padding for better coverage
        const bboxSize = Math.max(latSpan, lngSpan) * 2.0; // 100% padding for larger coverage area

        console.log("Flood raster request:", {
          center: { lat: center.lat, lng: center.lng },
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          },
          bboxSize,
          latSpan,
          lngSpan,
        });

        const params = new URLSearchParams({
          address: address,
          bbox_m: bboxSize.toString(),
          resolution: resolution.toString(),
        });

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/flood-overhead?${params}`);

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
          // The API returns a square raster centered on the geocoded address
          // We need to calculate the proper coordinates based on the bbox size and center
          const center = bounds.getCenter();

          // Calculate the half-span in degrees based on the bbox size in meters
          const metersPerDegreeLat = 111000;
          const metersPerDegreeLng =
            111000 * Math.cos((center.lat * Math.PI) / 180);

          const halfSpanLat = bboxSize / 2 / metersPerDegreeLat;
          const halfSpanLng = bboxSize / 2 / metersPerDegreeLng;

          console.log("Raster coordinates calculation:", {
            center: { lat: center.lat, lng: center.lng },
            bboxSize,
            halfSpanLat,
            halfSpanLng,
            metersPerDegreeLat,
            metersPerDegreeLng,
          });

          // Create coordinates for a square raster centered on the address
          const coords: [
            [number, number],
            [number, number],
            [number, number],
            [number, number]
          ] = [
            [center.lng - halfSpanLng, center.lat + halfSpanLat], // top-left
            [center.lng + halfSpanLng, center.lat + halfSpanLat], // top-right
            [center.lng + halfSpanLng, center.lat - halfSpanLat], // bottom-right
            [center.lng - halfSpanLng, center.lat - halfSpanLat], // bottom-left
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

    // Ensure map container is empty before initializing
    if (map.current && typeof map.current.remove === "function") {
      // Check if map.current exists and has a remove method
      map.current.remove();
      map.current = null;
    }
    // Clear previous map container children if any from previous initializations
    // This helps prevent Mapbox GL JS errors on hot reload or re-renders
    if (mapContainer.current) {
      while (mapContainer.current.firstChild) {
        mapContainer.current.removeChild(mapContainer.current.firstChild);
      }
    }

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

      // Apply border radius to the map canvas
      if (mapContainer.current) {
        const canvas = mapContainer.current.querySelector(
          ".mapboxgl-canvas"
        ) as HTMLElement;
        if (canvas) {
          canvas.style.borderRadius = "1.5rem";
        }
      }

      // Remove the Mapbox logo and load flood raster
      map.current.on("load", () => {
        const logo = document.querySelector(
          ".mapboxgl-ctrl-logo"
        ) as HTMLElement;
        if (logo) {
          logo.style.display = "none";
        }

        // Force border radius on all map elements
        if (mapContainer.current) {
          const canvas = mapContainer.current.querySelector(
            ".mapboxgl-canvas"
          ) as HTMLElement;
          if (canvas) {
            canvas.style.borderRadius = "1.5rem";
            canvas.style.clipPath = "inset(0 round 1.5rem)";
          }

          // Apply to the entire map container
          mapContainer.current.style.borderRadius = "1.5rem";
          mapContainer.current.style.overflow = "hidden";
        }

        // Load initial flood and WRTC rasters
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
            fetchWrtcRaster(bounds);
          }
        }
      });

      // Add event listeners for map view changes
      map.current.on("moveend", () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
            fetchWrtcRaster(bounds);
          }
        }
      });

      map.current.on("zoomend", () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            fetchFloodRaster(bounds);
            fetchWrtcRaster(bounds);
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
  }, [address, fetchFloodRaster, fetchWrtcRaster]);

  const recenterMap = useCallback(() => {
    if (map.current && address) {
      // Re-initialize the map, which includes geocoding and centering
      initializeMap();
    }
  }, [initializeMap, address]);

  useEffect(() => {
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Clean up layer resources
      cleanupFloodLayer();
      cleanupWrtcLayer();
    };
  }, [initializeMap, cleanupFloodLayer, cleanupWrtcLayer]);

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

      // Force border radius on canvas elements
      const canvasElements = document.querySelectorAll(".mapboxgl-canvas");
      canvasElements.forEach((canvas) => {
        (canvas as HTMLElement).style.borderRadius = "1.5rem";
      });
    };

    const timer = setTimeout(hideMapboxUI, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full w-full font-space-grotesk bg-gray-800 dark:bg-gray-900">
      <div ref={mapContainer} className="h-full w-full" />

      {/* CSS to force Mapbox canvas to respect rounded corners */}
      <style jsx>{`
        .mapboxgl-canvas {
          border-radius: 1.5rem !important;
        }
        .mapboxgl-map {
          border-radius: 1.5rem !important;
          overflow: hidden !important;
        }
      `}</style>

      {/* Loading and Error States Overlay */}
      <AnimatePresence>
        {(isLoading || error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4 z-10"
            style={{
              ...panelStyle,
              backgroundColor: "rgba(17, 24, 39, 0.85)", // Darker overlay
              borderRadius: "1.5rem", // Match parent's rounded-3xl
            }}
          >
            {isLoading && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
                <p className="text-lg font-semibold text-neutral-100">
                  Initializing Satellite View...
                </p>
                <p className="text-sm text-neutral-300">
                  Fetching map data for {address}
                </p>
              </div>
            )}
            {error && (
              <div className="text-center max-w-md p-6 bg-red-700/30 rounded-lg border border-red-500">
                <h3 className="text-xl font-bold text-red-300 mb-2">
                  Map Error
                </h3>
                <p className="text-sm text-red-200 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    initializeMap();
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-semibold text-sm"
                  style={buttonStyle}
                  onMouseOver={(e) =>
                    Object.assign(e.currentTarget.style, buttonHoverStyle)
                  }
                  onMouseOut={(e) =>
                    Object.assign(e.currentTarget.style, buttonStyle)
                  }
                >
                  Retry
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay - only show if map is loaded and no error */}
      {!isLoading && !error && map.current && (
        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 items-end">
          {/* Toggle Flood Layer Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={toggleFloodLayer}
            disabled={isFloodLoading}
            className={`flex items-center justify-center p-3 rounded-lg shadow-lg transition-all duration-300 w-40 h-12 text-sm font-semibold
                        ${
                          isFloodLoading
                            ? "cursor-not-allowed"
                            : "hover:shadow-emerald-400/40"
                        }
                        ${
                          isFloodVisible && activeLayer === "flood"
                            ? "text-emerald-300"
                            : "text-neutral-300"
                        }`}
            style={buttonStyle}
            onMouseOver={(e) =>
              !isFloodLoading &&
              Object.assign(e.currentTarget.style, buttonHoverStyle)
            }
            onMouseOut={(e) =>
              Object.assign(e.currentTarget.style, buttonStyle)
            }
            title={
              isFloodVisible && activeLayer === "flood"
                ? "Hide Flood Overlay"
                : "Show Flood Overlay"
            }
          >
            {isFloodLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-400 mr-2"></div>
                Loading Flood...
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 mr-2 transition-colors duration-300 ${
                    isFloodVisible && activeLayer === "flood"
                      ? "text-emerald-400"
                      : "text-neutral-400"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm2 8V8h2v6H5zm4-6v6h2V8H9zm4 0v6h2V8h-2z"
                    clipRule="evenodd"
                  />
                </svg>
                {isFloodVisible && activeLayer === "flood"
                  ? "Flood Layer On"
                  : "Flood Layer"}
              </>
            )}
          </motion.button>

          {/* Toggle WRTC Layer Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={toggleWrtcLayer}
            disabled={isWrtcLoading}
            className={`flex items-center justify-center p-3 rounded-lg shadow-lg transition-all duration-300 w-40 h-12 text-sm font-semibold
                        ${
                          isWrtcLoading
                            ? "cursor-not-allowed"
                            : "hover:shadow-red-400/40"
                        }
                        ${
                          isWrtcVisible && activeLayer === "wrtc"
                            ? "text-red-300"
                            : "text-neutral-300"
                        }`}
            style={buttonStyle}
            onMouseOver={(e) =>
              !isWrtcLoading &&
              Object.assign(e.currentTarget.style, {
                ...buttonHoverStyle,
                backgroundColor: "rgba(239, 68, 68, 0.2)", // Red accent for wildfire
              })
            }
            onMouseOut={(e) =>
              Object.assign(e.currentTarget.style, buttonStyle)
            }
            title={
              isWrtcVisible && activeLayer === "wrtc"
                ? "Hide Wildfire Risk"
                : "Show Wildfire Risk"
            }
          >
            {isWrtcLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400 mr-2"></div>
                Loading Fire...
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 mr-2 transition-colors duration-300 ${
                    isWrtcVisible && activeLayer === "wrtc"
                      ? "text-red-400"
                      : "text-neutral-400"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                {isWrtcVisible && activeLayer === "wrtc"
                  ? "Fire Risk On"
                  : "Fire Risk"}
              </>
            )}
          </motion.button>

          {/* Re-center Map Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={recenterMap}
            className="flex items-center justify-center p-3 rounded-lg shadow-lg transition-all duration-300 w-40 h-12 text-sm font-semibold text-neutral-300 hover:shadow-emerald-400/40"
            style={buttonStyle}
            onMouseOver={(e) =>
              Object.assign(e.currentTarget.style, buttonHoverStyle)
            }
            onMouseOut={(e) =>
              Object.assign(e.currentTarget.style, buttonStyle)
            }
            title="Re-center Map"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-neutral-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 14.95A7 7 0 1114.95 5.05 7 7 0 015.05 14.95zM10 4a6 6 0 100 12A6 6 0 0010 4zm0 2a1 1 0 011 1v2.586l1.707-1.707a1 1 0 111.414 1.414L11.414 10l2.707 2.707a1 1 0 11-1.414 1.414L10 11.414l-2.707 2.707a1 1 0 11-1.414-1.414L8.586 10 5.879 7.293a1 1 0 011.414-1.414L10 8.586V7a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Re-center Map
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SatelliteVisualization;

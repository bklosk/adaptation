"use client";

import { useEffect, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { PointCloudLayer } from "@deck.gl/layers";
import { LASLoader } from "@loaders.gl/las";
import { load } from "@loaders.gl/core";
import proj4 from "proj4";

interface PointData {
  position: number[];
  color: number[];
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export default function Home() {
  const [pointCloudData, setPointCloudData] = useState<PointData[]>([]);
  const [status, setStatus] = useState<string>("Loading...");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [viewState, setViewState] = useState({
    longitude: -105.2705,
    latitude: 40.015,
    zoom: 15,
    pitch: 60,
    bearing: 0,
  });

  const pollJobStatus = async (id: string) => {
    let pollCount = 0;
    const maxPolls = 150; // Maximum 5 minutes of polling (150 * 2 seconds)

    const poll = async (): Promise<void> => {
      if (pollCount >= maxPolls) {
        setStatus("Polling timeout - job may still be processing");
        return;
      }

      pollCount++;

      try {
        const res = await fetch(`http://localhost:8000/job/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const job = await res.json();
        setStatus(job.status);

        if (job.status === "completed" && job.output_file) {
          setIsDownloading(true);
          const fileRes = await fetch(`http://localhost:8000/download/${id}`);

          const contentLength = fileRes.headers.get("Content-Length");
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let loaded = 0;

          const reader = fileRes.body?.getReader();
          const chunks: Uint8Array[] = [];

          if (!reader) {
            throw new Error("Failed to get reader from response body");
          }

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            chunks.push(value);
            loaded += value.length;
            setDownloadProgress(Math.round((loaded / total) * 100));
          }

          const blob = new Blob(chunks);
          const data = await load(blob, LASLoader);
          const positions = data.attributes.POSITION?.value;

          // Check for interleaved RGB data in COLOR_0 (most common format from @loaders.gl/las)
          const colorValues = data.attributes.COLOR_0?.value;

          // Try different possible color attribute names - LAS files use 'red', 'green', 'blue'
          const redValues =
            data.attributes.red?.value || data.attributes.Red?.value;
          const greenValues =
            data.attributes.green?.value || data.attributes.Green?.value;
          const blueValues =
            data.attributes.blue?.value || data.attributes.Blue?.value;

          if (!positions) {
            setStatus("Error: No position data found in LAS file");
            return;
          }

          const numPoints = positions.length / 3;

          // Determine color bit depth
          let is16BitColors = false;

          if (
            colorValues &&
            (colorValues.length === numPoints * 4 ||
              colorValues.length === numPoints * 3)
          ) {
            // Check color value ranges to determine bit depth
            let minColor = colorValues[0];
            let maxColor = colorValues[0];
            for (let i = 1; i < Math.min(colorValues.length, 1000); i++) {
              if (colorValues[i] < minColor) minColor = colorValues[i];
              if (colorValues[i] > maxColor) maxColor = colorValues[i];
            }

            is16BitColors = maxColor > 255;
          }

          const pointData: PointData[] = [];

          for (let i = 0; i < numPoints; i++) {
            const posIdx = i * 3;

            let pointColor: [number, number, number];

            if (colorValues && colorValues.length === numPoints * 4) {
              // Use interleaved RGBA data from COLOR_0 (4 values per point: R, G, B, A)
              const colorIdx = i * 4;
              const red = colorValues[colorIdx];
              const green = colorValues[colorIdx + 1];
              const blue = colorValues[colorIdx + 2];

              // Convert based on detected bit depth
              if (is16BitColors) {
                // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
                pointColor = [
                  Math.round((red / 65535) * 255),
                  Math.round((green / 65535) * 255),
                  Math.round((blue / 65535) * 255),
                ];
              } else {
                // Values are already 8-bit (0-255), use them directly
                pointColor = [red, green, blue];
              }
            } else if (colorValues && colorValues.length === numPoints * 3) {
              // Use interleaved RGB data from COLOR_0 (3 values per point: R, G, B)
              const colorIdx = i * 3;
              const red = colorValues[colorIdx];
              const green = colorValues[colorIdx + 1];
              const blue = colorValues[colorIdx + 2];

              // Convert based on detected bit depth
              if (is16BitColors) {
                // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
                pointColor = [
                  Math.round((red / 65535) * 255),
                  Math.round((green / 65535) * 255),
                  Math.round((blue / 65535) * 255),
                ];
              } else {
                // Values are already 8-bit (0-255), use them directly
                pointColor = [red, green, blue];
              }
            } else if (redValues && greenValues && blueValues) {
              const red = redValues[i];
              const green = greenValues[i];
              const blue = blueValues[i];

              // Check if these are 16-bit values (likely if max > 255)
              const maxSeparateColor = Math.max(red, green, blue);
              if (maxSeparateColor > 255) {
                // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
                pointColor = [
                  Math.round((red / 65535) * 255),
                  Math.round((green / 65535) * 255),
                  Math.round((blue / 65535) * 255),
                ];
              } else {
                // Values are already 8-bit (0-255), use them directly
                pointColor = [red, green, blue];
              }
            } else if (redValues && redValues.length === numPoints * 3) {
              // Fallback: treat redValues as interleaved RGB
              const colorIdx = i * 3;
              const red = redValues[colorIdx];
              const green = redValues[colorIdx + 1];
              const blue = redValues[colorIdx + 2];

              // Check if these are 16-bit values
              const maxInterleavedColor = Math.max(red, green, blue);
              if (maxInterleavedColor > 255) {
                pointColor = [
                  Math.round((red / 65535) * 255),
                  Math.round((green / 65535) * 255),
                  Math.round((blue / 65535) * 255),
                ];
              } else {
                pointColor = [red, green, blue];
              }
            } else {
              // No color data, use white
              pointColor = [255, 255, 255];
            }

            pointData.push({
              position: [
                positions[posIdx],
                positions[posIdx + 1],
                positions[posIdx + 2],
              ],
              color: pointColor,
            });
          }

          // Check coordinate ranges and transform if necessary
          if (pointData.length > 0) {
            const xCoords = pointData.map((p) => p.position[0]);
            const yCoords = pointData.map((p) => p.position[1]);
            const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
            const centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;

            // Check if these look like UTM coordinates (typically 6-7 digits)
            if (Math.abs(centerX) > 180 || Math.abs(centerY) > 90) {
              // Assume UTM Zone 13N for Boulder, Colorado
              const utmProjection =
                "+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs";
              const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";

              // Transform all points
              const transformedPointData: PointData[] = pointData.map(
                (point) => {
                  const [x, y, z] = point.position;
                  const [lon, lat] = proj4(utmProjection, wgs84Projection, [
                    x,
                    y,
                  ]);
                  return {
                    position: [lon, lat, z],
                    color: point.color,
                  };
                }
              );

              setPointCloudData(transformedPointData);

              // Update view to center on the data
              if (transformedPointData.length > 0) {
                const lons = transformedPointData.map((p) => p.position[0]);
                const lats = transformedPointData.map((p) => p.position[1]);
                const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
                const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                setViewState((prev) => ({
                  ...prev,
                  longitude: centerLon,
                  latitude: centerLat,
                  zoom: 18,
                }));
              }
            } else {
              setPointCloudData(pointData);
            }
          }
          setIsDownloading(false);
          setDownloadProgress(0);
        } else if (job.status === "failed") {
          setStatus("Failed: " + job.error_message);
        } else if (job.status !== "completed") {
          // Continue polling with exponential backoff for retries
          setTimeout(() => poll(), 2000);
        }
      } catch (error) {
        console.error("Polling error:", error);

        // Handle network errors more gracefully
        if (pollCount < 5) {
          // Retry immediately for first few attempts
          setTimeout(() => poll(), 3000);
        } else {
          // After several failures, show error but don't crash
          setStatus(
            `Connection error: ${
              error instanceof Error ? error.message : "Unknown error"
            }. Retrying...`
          );
          setTimeout(() => poll(), 5000);
        }
      }
    };

    // Start polling
    poll();
  };

  const startNewJob = useCallback(async () => {
    try {
      setStatus("Starting new job...");

      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: "1250 Wildwood Road, Boulder, CO",
          buffer_km: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start job: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.job_id) {
        pollJobStatus(result.job_id);
      } else {
        setStatus(`Failed to start job: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(
        `Error starting job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, []);

  useEffect(() => {
    // Start a new job every time the page loads
    startNewJob();
  }, [startNewJob]);

  // Add test data to verify visualization works
  const testData: PointData[] = [
    { position: [-105.2705, 40.015, 1000], color: [255, 0, 0] },
    { position: [-105.27, 40.016, 1100], color: [0, 255, 0] },
    { position: [-105.271, 40.014, 1200], color: [0, 0, 255] },
  ];

  const layers = [
    new PointCloudLayer({
      id: "point-cloud",
      data: pointCloudData.length > 0 ? pointCloudData : testData,
      getPosition: (d: PointData) => d.position as [number, number, number],
      getColor: (d: PointData) => d.color as [number, number, number],
      pointSize: 10,
      radiusMinPixels: 5,
      radiusMaxPixels: 100,
      visible: true,
    }),
  ];

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={(evt) => setViewState(evt.viewState as ViewState)}
        controller={true}
        layers={layers}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "white",
          padding: 10,
        }}
      >
        Status: {status} | Points: {pointCloudData.length}
      </div>
      {isDownloading && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            background: "white",
            padding: 10,
            width: 300,
          }}
        >
          <div>
            Download in progress... {downloadProgress}% ({pointCloudData.length}{" "}
            points loaded)
          </div>
          <progress
            value={downloadProgress}
            max={100}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

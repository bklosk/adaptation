"use client";

import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { PointCloudLayer } from "@deck.gl/layers";
import { LASLoader } from "@loaders.gl/las";
import { load } from "@loaders.gl/core";
import proj4 from "proj4";

interface PointData {
  position: number[];
  color: number[];
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

  useEffect(() => {
    const address = "1250 wildwood rd, boulder, CO";

    fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ address }),
    })
      .then(async (res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers.entries()]);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} - ${errorText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("Success response:", data);
        pollJobStatus(data.job_id);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setStatus(`Error starting job: ${error.message}`);
      });
  }, []);

  const pollJobStatus = async (id: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/job/${id}`);
        const job = await res.json();
        setStatus(job.status);

        if (job.status === "completed" && job.output_file) {
          console.log("Job completed, downloading file...");
          setIsDownloading(true);
          const fileRes = await fetch(`http://localhost:8000/download/${id}`);
          console.log("Download response status:", fileRes.status);

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
          console.log("Blob size:", blob.size, "bytes");

          const data = await load(blob, LASLoader);
          console.log("LAS data loaded:", data);
          console.log("Available attributes:", Object.keys(data.attributes));
          console.log("Full data structure:", data);

          const positions = data.attributes.POSITION?.value;
          const colors = data.attributes.COLOR_0?.value;
          console.log("Positions:", positions);
          console.log("Positions array length:", positions?.length);
          console.log("Colors array length:", colors?.length);

          if (!positions) {
            console.error("No POSITION attribute found in LAS data");
            setStatus("Error: No position data found in LAS file");
            return;
          }

          const numPoints = positions.length / 3; // Assuming x,y,z for each point
          console.log("Number of points:", numPoints);

          const pointData: PointData[] = [];

          for (let i = 0; i < numPoints; i++) {
            const posIdx = i * 3;
            pointData.push({
              position: [
                positions[posIdx],
                positions[posIdx + 1],
                positions[posIdx + 2],
              ],
              color: colors
                ? [colors[posIdx], colors[posIdx + 1], colors[posIdx + 2]]
                : [255, 255, 255],
            });
          }

          console.log(
            "Sample point data (first 3 points):",
            pointData.slice(0, 3)
          );
          console.log("Point cloud data array length:", pointData.length);

          // Check coordinate ranges to understand the data
          if (pointData.length > 0) {
            const xCoords = pointData.map((p) => p.position[0]);
            const yCoords = pointData.map((p) => p.position[1]);
            const zCoords = pointData.map((p) => p.position[2]);

            console.log(
              "X coordinate range:",
              Math.min(...xCoords),
              "to",
              Math.max(...xCoords)
            );
            console.log(
              "Y coordinate range:",
              Math.min(...yCoords),
              "to",
              Math.max(...yCoords)
            );
            console.log(
              "Z coordinate range:",
              Math.min(...zCoords),
              "to",
              Math.max(...zCoords)
            );

            // Calculate center point
            const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
            const centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;
            console.log("Data center point:", centerX, centerY);

            // Check if these look like UTM coordinates (typically 6-7 digits)
            const avgX = centerX;
            const avgY = centerY;
            console.log("Average coordinates:", avgX, avgY);

            if (Math.abs(avgX) > 180 || Math.abs(avgY) > 90) {
              console.warn(
                "COORDINATE SYSTEM ISSUE: These look like projected coordinates (UTM), not lat/lon!"
              );
              console.warn("DeckGL expects longitude/latitude coordinates.");
              console.warn("X (easting):", avgX, "Y (northing):", avgY);

              // Assume UTM Zone 13N for Boulder, Colorado
              const utmProjection =
                "+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs";
              const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";

              console.log("Converting from UTM Zone 13N to WGS84...");

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

              console.log(
                "Sample transformed coordinates:",
                transformedPointData.slice(0, 3).map((p) => p.position)
              );
              setPointCloudData(transformedPointData);

              // Update view to center on the data
              if (transformedPointData.length > 0) {
                const lons = transformedPointData.map((p) => p.position[0]);
                const lats = transformedPointData.map((p) => p.position[1]);
                const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
                const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                console.log("Setting view center to:", centerLon, centerLat);
                console.log(
                  "Lon range:",
                  Math.min(...lons),
                  "to",
                  Math.max(...lons)
                );
                console.log(
                  "Lat range:",
                  Math.min(...lats),
                  "to",
                  Math.max(...lats)
                );
                setViewState((prev) => ({
                  ...prev,
                  longitude: centerLon,
                  latitude: centerLat,
                  zoom: 18,
                }));
              }
            } else {
              console.log("Coordinates appear to be in lat/lon format already");
              setPointCloudData(pointData);
            }
          }
          setIsDownloading(false);
          setDownloadProgress(0);
        } else if (job.status === "failed") {
          setStatus("Failed: " + job.error_message);
        } else if (job.status !== "completed") {
          setTimeout(poll, 2000);
        }
      } catch {
        setStatus("Polling error");
      }
    };
    poll();
  };

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

  console.log("Current pointCloudData length:", pointCloudData.length);
  console.log("Layers:", layers);

  // Log some sample positions to debug coordinate system
  if (pointCloudData.length > 0) {
    console.log(
      "First few positions:",
      pointCloudData.slice(0, 5).map((d) => d.position)
    );
  }

  console.log("Current pointCloudData length:", pointCloudData.length);
  console.log("Layers:", layers);

  // Log some sample positions to debug coordinate system
  if (pointCloudData.length > 0) {
    console.log(
      "First few positions:",
      pointCloudData.slice(0, 5).map((d) => d.position)
    );
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={(evt) => setViewState(evt.viewState as any)}
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

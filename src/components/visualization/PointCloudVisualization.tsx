"use client";

import React, { useEffect, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { PointCloudLayer } from "@deck.gl/layers";
import { PointData, ViewState } from "./types";
import { PointCloudAPIService } from "./apiService";
import { PointCloudDataProcessor } from "./dataProcessor";
import StatusDisplay, { JobStatus, JobDetails } from "./StatusDisplay";
import PointSizeControl from "./PointSizeControl";
import CameraControls from "./CameraControls";
import KeyboardShortcuts from "./KeyboardShortcuts";

interface PointCloudVisualizationProps {
  address?: string;
  bufferKm?: number;
  initialViewState?: Partial<ViewState>;
}

const PointCloudVisualization: React.FC<PointCloudVisualizationProps> = ({
  address = "1250 Wildwood Road, Boulder, CO",
  bufferKm = 1.0,
  initialViewState = {},
}) => {
  const [pointCloudData, setPointCloudData] = useState<PointData[]>([]);
  const [status, setStatus] = useState<JobStatus>("pending");
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [pointSize, setPointSize] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialBounds, setInitialBounds] = useState<{
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
    minZ: number;
    maxZ: number;
  } | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -105.2705,
    latitude: 40.015,
    zoom: 15.5,
    pitch: 60,
    bearing: 0,
    ...initialViewState,
  });

  const pollJobStatus = async (id: string) => {
    let pollCount = 0;
    const maxPolls = 150; // Maximum 5 minutes of polling (150 * 2 seconds)

    const poll = async (): Promise<void> => {
      if (pollCount >= maxPolls) {
        setStatus("failed");
        setErrorMessage("Polling timeout - job may still be processing");
        return;
      }

      pollCount++;

      try {
        const job = await PointCloudAPIService.getJobStatus(id);

        // Map the API status to our JobStatus type
        const mappedStatus: JobStatus =
          job.status === "completed" ||
          job.status === "failed" ||
          job.status === "processing" ||
          job.status === "pending" ||
          job.status === "queued"
            ? (job.status as JobStatus)
            : "processing";

        setStatus(mappedStatus);
        setErrorMessage(null);

        // Create JobDetails from the API response
        const details: JobDetails = {
          job_id: job.job_id,
          address: job.address,
          created_at: job.created_at,
          completed_at: job.completed_at,
          error_message: job.error_message,
          metadata: job.metadata,
        };
        setJobDetails(details);

        if (job.status === "completed" && job.output_file) {
          setIsDownloading(true);

          const blob = await PointCloudAPIService.downloadFile(
            id,
            (progress) => {
              setDownloadProgress(progress);
            }
          );

          const pointData = await PointCloudDataProcessor.processLASFile(blob);
          const {
            data: transformedData,
            center,
            bounds,
          } = PointCloudDataProcessor.transformCoordinates(pointData);

          setPointCloudData(transformedData);
          setInitialBounds(bounds);

          // Update view to center on the data with appropriate zoom
          if (transformedData.length > 0) {
            // Calculate zoom level based on the extent of the data
            const zoomLevel =
              PointCloudDataProcessor.calculateOptimalZoom(bounds) + 0.5;

            setViewState((prev) => ({
              ...prev,
              longitude: center[0],
              latitude: center[1],
              zoom: zoomLevel,
              pitch: 45, // Better angle for viewing 3D point clouds
              bearing: 0,
            }));
          }

          setIsDownloading(false);
          setDownloadProgress(0);
        } else if (job.status === "failed") {
          setStatus("failed");
          setErrorMessage(job.error_message || "Job failed");
        } else if (job.status !== "completed") {
          // Continue polling - use shorter interval if actively processing
          const interval = job.status === "processing" ? 1500 : 2000;
          setTimeout(() => poll(), interval);
        }
      } catch (error) {
        console.error("Polling error:", error);

        // Handle network errors more gracefully
        if (pollCount < 5) {
          // Retry immediately for first few attempts
          setTimeout(() => poll(), 3000);
        } else {
          // After several failures, show error but don't crash
          setStatus("failed");
          setErrorMessage(
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
      setStatus("pending");
      setErrorMessage(null);

      const result = await PointCloudAPIService.startProcessingJob({
        address,
        buffer_km: bufferKm,
      });

      if (result.success && result.job_id) {
        pollJobStatus(result.job_id);
      } else {
        setStatus("failed");
        setErrorMessage(
          `Failed to start job: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      setStatus("failed");
      setErrorMessage(
        `Error starting job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [address, bufferKm]);

  useEffect(() => {
    // Start a new job every time the component mounts or parameters change
    startNewJob();
  }, [startNewJob]);

  // Use test data if no real data is available
  const displayData =
    pointCloudData.length > 0
      ? pointCloudData
      : PointCloudDataProcessor.getTestData();

  const layers = [
    new PointCloudLayer({
      id: "point-cloud",
      data: displayData,
      getPosition: (d: PointData) => d.position as [number, number, number],
      getColor: (d: PointData) => d.color as [number, number, number],
      pointSize: pointSize,
      radiusMinPixels: 1,
      radiusMaxPixels: 50,
      visible: true,
      pickable: true,
      coordinateSystem: 1, // COORDINATE_SYSTEM.LNGLAT
      modelMatrix: null,
      material: {
        // Slightly softer lighting to avoid overly bright highlights
        ambient: 0.3,
        diffuse: 0.4,
        shininess: 16,
        specularColor: [180, 180, 180],
      },
      parameters: {
        depthTest: true,
        depthWrite: true,
      },
    }),
  ];

  // Reset view to the initial state centered on the point cloud
  const resetView = useCallback(() => {
    if (pointCloudData.length > 0 && initialBounds) {
      const { center, bounds } =
        PointCloudDataProcessor.transformCoordinates(pointCloudData);
      const zoomLevel = PointCloudDataProcessor.calculateOptimalZoom(bounds) + 0.5;

      setViewState({
        longitude: center[0],
        latitude: center[1],
        zoom: zoomLevel,
        pitch: 45,
        bearing: 0,
      });
    }
  }, [pointCloudData, initialBounds]);

  // Handle partial view state updates
  const handleViewStateUpdate = useCallback((updates: Partial<ViewState>) => {
    setViewState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Apply reduced sensitivity to DeckGL interactions
  const handleDeckViewStateChange = useCallback(
    (evt: { viewState: ViewState }) => {
      const factor = 0.5; // Global sensitivity factor
      setViewState((prev) => {
        const vs = evt.viewState as ViewState;
        return {
          ...prev,
          longitude: prev.longitude + (vs.longitude - prev.longitude) * factor,
          latitude: prev.latitude + (vs.latitude - prev.latitude) * factor,
          zoom: prev.zoom + (vs.zoom - prev.zoom) * factor,
          pitch: prev.pitch + (vs.pitch - prev.pitch) * factor,
          bearing: prev.bearing + (vs.bearing - prev.bearing) * factor,
        };
      });
    },
    []
  );

  // Keyboard controls for camera movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
      }

      const moveSpeed = 0.0005; // Reduced movement sensitivity
      const zoomSpeed = 0.25; // Finer zoom steps
      const rotationSpeed = 2; // Slower rotation
      const pitchSpeed = 2; // Slower tilt

      setViewState((prev) => {
        const newViewState = { ...prev };

        switch (event.key) {
          // Arrow keys for panning
          case "ArrowUp":
            newViewState.latitude += moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "ArrowDown":
            newViewState.latitude -= moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "ArrowLeft":
            newViewState.longitude -= moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "ArrowRight":
            newViewState.longitude += moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;

          // WASD for alternative panning
          case "w":
          case "W":
            newViewState.latitude += moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "s":
          case "S":
            newViewState.latitude -= moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "a":
          case "A":
            newViewState.longitude -= moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;
          case "d":
          case "D":
            newViewState.longitude += moveSpeed * Math.pow(2, 20 - prev.zoom);
            break;

          // Zoom controls
          case "+":
          case "=":
            newViewState.zoom = Math.min(22, prev.zoom + zoomSpeed);
            break;
          case "-":
          case "_":
            newViewState.zoom = Math.max(8, prev.zoom - zoomSpeed);
            break;

          // Rotation controls (Q/E)
          case "q":
          case "Q":
            newViewState.bearing = (prev.bearing - rotationSpeed + 360) % 360;
            break;
          case "e":
          case "E":
            newViewState.bearing = (prev.bearing + rotationSpeed) % 360;
            break;

          // Pitch controls (R/F)
          case "r":
          case "R":
            newViewState.pitch = Math.min(85, prev.pitch + pitchSpeed);
            break;
          case "f":
          case "F":
            newViewState.pitch = Math.max(0, prev.pitch - pitchSpeed);
            break;

          // Reset view (Space)
          case " ":
            event.preventDefault();
            resetView();
            return prev; // Don't update state here as resetView handles it

          default:
            return prev; // No change for other keys
        }

        return newViewState;
      });
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetView]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
      tabIndex={0}
      className="focus:outline-none"
    >
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleDeckViewStateChange}
        controller={{
          touchRotate: true,
          touchZoom: true,
          doubleClickZoom: true,
          keyboard: true,
          dragPan: true,
          dragRotate: true,
          scrollZoom: true,
          inertia: 200, // Smooth deceleration
        }}
        layers={layers}
        getCursor={() => "grab"}
      />

      {/* UI Overlay with proper positioning to avoid conflicts */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left - Keyboard shortcuts (positioned to avoid address box overlap) */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <KeyboardShortcuts />
        </div>

        {/* Top right - Camera controls (positioned below centered address to avoid overlap) */}
        <div className="absolute top-20 right-4 pointer-events-auto hidden lg:block">
          <CameraControls
            viewState={viewState}
            onViewStateChange={handleViewStateUpdate}
            onResetView={resetView}
          />
        </div>

        {/* Bottom left - Status display */}
        <div className="absolute bottom-4 left-4 pointer-events-auto max-w-sm">
          <StatusDisplay
            status={status}
            pointCount={pointCloudData.length}
            downloadProgress={downloadProgress}
            isDownloading={isDownloading}
            jobDetails={
              jobDetails
                ? {
                    ...jobDetails,
                    error_message: errorMessage || jobDetails.error_message,
                  }
                : errorMessage
                ? { error_message: errorMessage }
                : undefined
            }
          />
        </div>

        {/* Bottom right - Point size control */}
        {!isDownloading && (
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <PointSizeControl
              pointSize={pointSize}
              onPointSizeChange={setPointSize}
            />
          </div>
        )}

        {/* Mobile camera controls - toggle button positioned below both address and desktop controls */}
        <div className="lg:hidden absolute top-32 right-4 pointer-events-auto">
          <button
            onClick={() => {
              const controls = document.getElementById(
                "mobile-camera-controls"
              );
              if (controls) {
                controls.classList.toggle("hidden");
              }
            }}
            className="backdrop-blur-sm p-2 shadow-lg hover:bg-gray-700 transition-all border-2 border-white font-space-grotesk"
            style={{ backgroundColor: "#1B2223" }}
            title="Camera Controls"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>

        {/* Mobile camera controls panel positioned below toggle */}
        <div
          id="mobile-camera-controls"
          className="lg:hidden hidden absolute top-44 right-4 pointer-events-auto"
        >
          <CameraControls
            viewState={viewState}
            onViewStateChange={handleViewStateUpdate}
            onResetView={resetView}
          />
        </div>
      </div>
    </div>
  );
};

export default PointCloudVisualization;

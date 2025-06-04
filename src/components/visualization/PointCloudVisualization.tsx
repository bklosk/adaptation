"use client";

import React, { useEffect, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { PointCloudLayer } from "@deck.gl/layers";
import { PointData, ViewState } from "./types";
import { PointCloudAPIService } from "./apiService";
import { PointCloudDataProcessor } from "./dataProcessor";
import StatusDisplay, { JobStatus, JobDetails } from "./StatusDisplay";
import PointSizeControl from "./PointSizeControl";

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
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -105.2705,
    latitude: 40.015,
    zoom: 15,
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
          const { data: transformedData, center } =
            PointCloudDataProcessor.transformCoordinates(pointData);

          setPointCloudData(transformedData);

          // Update view to center on the data
          if (transformedData.length > 0) {
            setViewState((prev) => ({
              ...prev,
              longitude: center[0],
              latitude: center[1],
              zoom: 18,
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
      radiusMinPixels: 5,
      radiusMaxPixels: 100,
      visible: true,
    }),
  ];

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <DeckGL
        viewState={viewState}
        onViewStateChange={(evt) => setViewState(evt.viewState as ViewState)}
        controller={true}
        layers={layers}
      />

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

      {!isDownloading && (
        <PointSizeControl
          pointSize={pointSize}
          onPointSizeChange={setPointSize}
        />
      )}
    </div>
  );
};

export default PointCloudVisualization;

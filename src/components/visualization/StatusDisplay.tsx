import { useMemo } from "react";

// Types
export type JobStatus =
  | "completed"
  | "failed"
  | "processing"
  | "pending"
  | "queued";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface JobMetadata {
  processing_step?: string;
  lidar_products_found?: number;
  coordinates?: Coordinates;
  output_file_size_mb?: number;
  buffer_km?: number;
  attempt?: number;
  bbox?: string;
}

export interface JobDetails {
  job_id?: string;
  address?: string;
  created_at?: string;
  completed_at?: string | null;
  error_message?: string | null;
  metadata?: JobMetadata;
}

export interface StatusDisplayProps {
  status: JobStatus;
  pointCount: number;
  downloadProgress?: number;
  isDownloading?: boolean;
  jobDetails?: JobDetails;
}

// Constants
const STATUS_COLORS: Record<JobStatus, string> = {
  completed: "text-green-600",
  failed: "text-red-600",
  processing: "text-blue-600",
  pending: "text-yellow-600",
  queued: "text-yellow-600",
} as const;

// Utility functions
const formatElapsedTime = (
  created?: string,
  completed?: string | null
): string => {
  if (!created) return "N/A";

  const start = new Date(created);
  const end = completed ? new Date(completed) : new Date();
  const elapsed = Math.round((end.getTime() - start.getTime()) / 1000);

  if (elapsed < 60) return `${elapsed}s`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
  return `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`;
};

const formatCoordinates = (coordinates: Coordinates): string => {
  return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(
    4
  )}`;
};

// Sub-components
interface StatusIndicatorProps {
  status: JobStatus;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => (
  <div className="flex items-center space-x-2">
    <span className={`font-black ${STATUS_COLORS[status]} font-space-grotesk`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    {status === "processing" && (
      <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent" />
    )}
  </div>
);

interface ProcessingDetailsProps {
  metadata: JobMetadata;
}

const ProcessingDetails = ({ metadata }: ProcessingDetailsProps) => (
  <div
    className="p-2 border-2 border-blue-400"
    style={{ backgroundColor: "#1B2223" }}
  >
    <div className="font-black text-blue-400 text-xs mb-1 font-space-grotesk">
      Processing Details:
    </div>
    <div className="space-y-1 text-xs text-gray-300 font-space-grotesk">
      {metadata.lidar_products_found && (
        <div className="flex justify-between">
          <span>LiDAR Products:</span>
          <span className="font-mono">
            {metadata.lidar_products_found} files
          </span>
        </div>
      )}
      {metadata.coordinates && (
        <div className="flex justify-between">
          <span>Location:</span>
          <span className="font-mono text-xs">
            {formatCoordinates(metadata.coordinates)}
          </span>
        </div>
      )}
      {metadata.output_file_size_mb && (
        <div className="flex justify-between">
          <span>File Size:</span>
          <span className="font-mono">{metadata.output_file_size_mb} MB</span>
        </div>
      )}
      {metadata.buffer_km && (
        <div className="flex justify-between">
          <span>Search Radius:</span>
          <span className="font-mono">{metadata.buffer_km} km</span>
        </div>
      )}
      {metadata.attempt && (
        <div className="flex justify-between">
          <span>Attempt:</span>
          <span className="font-mono">#{metadata.attempt}</span>
        </div>
      )}
    </div>
  </div>
);

interface ErrorDisplayProps {
  errorMessage: string;
}

const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => (
  <div
    className="mt-2 p-2 border-2 border-red-400"
    style={{ backgroundColor: "#1B2223" }}
  >
    <div className="font-black text-red-400 text-xs font-space-grotesk">
      Error:
    </div>
    <div className="text-red-300 text-xs mt-1 font-space-grotesk">
      {errorMessage}
    </div>
  </div>
);

interface BoundingBoxDisplayProps {
  bbox: string;
}

const BoundingBoxDisplay = ({ bbox }: BoundingBoxDisplayProps) => (
  <div
    className="p-2 border-2 border-green-400"
    style={{ backgroundColor: "#1B2223" }}
  >
    <div className="font-black text-green-400 text-xs mb-1 font-space-grotesk">
      Coverage Area:
    </div>
    <div className="text-xs text-green-300 font-mono break-all">{bbox}</div>
  </div>
);

interface DownloadProgressProps {
  progress: number;
  pointCount: number;
}

const DownloadProgress = ({ progress, pointCount }: DownloadProgressProps) => (
  <div
    className="absolute top-4 left-1/2 transform -translate-x-1/2 backdrop-blur-sm p-4 w-80 font-space-grotesk shadow-lg z-10 border-2 border-white"
    style={{ backgroundColor: "#1B2223" }}
  >
    <div className="text-sm font-black text-white mb-2">
      Downloading Point Cloud Data
    </div>
    <div className="text-xs text-gray-300 mb-3">
      {progress}% complete ({pointCount.toLocaleString()} points)
    </div>
    <div className="w-full bg-gray-700 h-2 border border-white">
      <div
        className="bg-blue-600 h-full transition-all duration-300 border-r border-blue-400"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Main component
export default function StatusDisplay({
  status,
  pointCount,
  downloadProgress = 0,
  isDownloading = false,
  jobDetails,
}: StatusDisplayProps) {
  const elapsedTime = useMemo(() => {
    if (!jobDetails?.created_at) return null;
    return formatElapsedTime(jobDetails.created_at, jobDetails.completed_at);
  }, [jobDetails?.created_at, jobDetails?.completed_at]);

  return (
    <>
      {/* Main status display - no absolute positioning */}
      <div
        className="backdrop-blur-sm p-4 font-space-grotesk text-sm shadow-lg border-2 border-white w-full max-w-sm"
        style={{ backgroundColor: "#1B2223" }}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-white">Status:</span>
            <StatusIndicator status={status} />
          </div>

          <div className="flex justify-between items-center">
            <span className="font-black text-white">Points:</span>
            <span className="font-black text-white">
              {pointCount.toLocaleString()}
            </span>
          </div>

          {jobDetails && (
            <>
              {jobDetails.job_id && (
                <div className="flex justify-between items-center">
                  <span className="font-black text-white">Job ID:</span>
                  <span
                    className="font-mono text-xs text-gray-300"
                    title={jobDetails.job_id}
                  >
                    {jobDetails.job_id.slice(-8)}
                  </span>
                </div>
              )}

              {elapsedTime && (
                <div className="flex justify-between items-center">
                  <span className="font-black text-white">Elapsed:</span>
                  <span className="font-black text-white">{elapsedTime}</span>
                </div>
              )}

              {jobDetails.metadata?.processing_step &&
                status === "processing" && (
                  <div className="flex justify-between items-center">
                    <span className="font-black text-white">Step:</span>
                    <span className="font-black text-blue-400 capitalize">
                      {jobDetails.metadata.processing_step.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

              {jobDetails.error_message && (
                <ErrorDisplay errorMessage={jobDetails.error_message} />
              )}

              {jobDetails.metadata &&
                Object.keys(jobDetails.metadata).length > 0 &&
                status !== "completed" && (
                  <div className="mt-2 space-y-2">
                    <ProcessingDetails metadata={jobDetails.metadata} />
                    {jobDetails.metadata.bbox && (
                      <BoundingBoxDisplay bbox={jobDetails.metadata.bbox} />
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Download progress */}
      {isDownloading && (
        <DownloadProgress progress={downloadProgress} pointCount={pointCount} />
      )}
    </>
  );
}

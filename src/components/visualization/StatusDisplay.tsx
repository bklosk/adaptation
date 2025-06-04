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
    <span className={`font-medium ${STATUS_COLORS[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    {status === "processing" && (
      <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
    )}
  </div>
);

interface ProcessingDetailsProps {
  metadata: JobMetadata;
}

const ProcessingDetails = ({ metadata }: ProcessingDetailsProps) => (
  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
    <div className="font-semibold text-blue-700 text-xs mb-1">
      Processing Details:
    </div>
    <div className="space-y-1 text-xs text-blue-600">
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
  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
    <div className="font-semibold text-red-700 text-xs">Error:</div>
    <div className="text-red-600 text-xs mt-1">{errorMessage}</div>
  </div>
);

interface BoundingBoxDisplayProps {
  bbox: string;
}

const BoundingBoxDisplay = ({ bbox }: BoundingBoxDisplayProps) => (
  <div className="p-2 bg-green-50 border border-green-200 rounded">
    <div className="font-semibold text-green-700 text-xs mb-1">
      Coverage Area:
    </div>
    <div className="text-xs text-green-600 font-mono break-all">{bbox}</div>
  </div>
);

interface DownloadProgressProps {
  progress: number;
  pointCount: number;
}

const DownloadProgress = ({ progress, pointCount }: DownloadProgressProps) => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 w-80 font-space-grotesk rounded-lg shadow-lg z-10">
    <div className="text-sm font-semibold text-gray-700 mb-2">
      Downloading Point Cloud Data
    </div>
    <div className="text-xs text-gray-600 mb-3">
      {progress}% complete ({pointCount.toLocaleString()} points)
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
      {/* Main status display */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 font-space-grotesk text-sm rounded-lg shadow-lg z-10 max-w-sm">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Status:</span>
            <StatusIndicator status={status} />
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Points:</span>
            <span className="font-medium text-gray-900">
              {pointCount.toLocaleString()}
            </span>
          </div>

          {jobDetails && (
            <>
              {jobDetails.job_id && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Job ID:</span>
                  <span
                    className="font-mono text-xs text-gray-600"
                    title={jobDetails.job_id}
                  >
                    {jobDetails.job_id.slice(-8)}
                  </span>
                </div>
              )}

              {elapsedTime && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Elapsed:</span>
                  <span className="font-medium text-gray-900">
                    {elapsedTime}
                  </span>
                </div>
              )}

              {jobDetails.metadata?.processing_step &&
                status === "processing" && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Step:</span>
                    <span className="font-medium text-blue-600 capitalize">
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

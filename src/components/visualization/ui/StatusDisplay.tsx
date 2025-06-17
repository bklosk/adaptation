import { useMemo } from "react";

// Types
export type JobStatusString =
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
  status?: JobStatusString; // Added status field
}

export interface StatusDisplayProps {
  status: JobStatusString;
  pointCount: number;
  downloadProgress?: number;
  isDownloading?: boolean;
  jobDetails?: JobDetails;
}

// Constants
const STATUS_COLORS: Record<JobStatusString, string> = {
  completed: "text-emerald-500 dark:text-emerald-400",
  failed: "text-red-500 dark:text-red-400",
  processing: "text-blue-500 dark:text-blue-400",
  pending: "text-yellow-500 dark:text-yellow-400",
  queued: "text-amber-500 dark:text-amber-400", // Changed from yellow for differentiation
} as const;

const STATUS_BG_COLORS: Record<JobStatusString, string> = {
  completed: "bg-emerald-500/10 dark:bg-emerald-400/10",
  failed: "bg-red-500/10 dark:bg-red-400/10",
  processing: "bg-blue-500/10 dark:bg-blue-400/10",
  pending: "bg-yellow-500/10 dark:bg-yellow-400/10",
  queued: "bg-amber-500/10 dark:bg-amber-400/10",
} as const;

const panelStyle = {
  backdropFilter: "blur(12px) saturate(150%)",
  WebkitBackdropFilter: "blur(12px) saturate(150%)",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
};

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
  status: JobStatusString;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => (
  <div
    className={`flex items-center space-x-2 p-2 rounded-md ${STATUS_BG_COLORS[status]}`}
  >
    <span
      className={`font-bold ${STATUS_COLORS[status]} font-space-grotesk text-sm`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    {status === "processing" && (
      <div
        className={`animate-spin h-4 w-4 border-2 ${STATUS_COLORS[
          status
        ].replace("text-", "border-")} border-t-transparent rounded-full`}
      />
    )}
  </div>
);

interface ProcessingDetailsProps {
  metadata: JobMetadata;
}

const ProcessingDetails = ({ metadata }: ProcessingDetailsProps) => (
  <div
    className="p-3 border border-emerald-300/60 dark:border-emerald-400/40 rounded-lg mt-2 bg-white/60 dark:bg-[#1B2223]/70"
    style={panelStyle}
  >
    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1 font-space-grotesk">
      Processing Details:
    </div>
    <ul className="text-xs space-y-1 text-neutral-700 dark:text-neutral-300">
      {metadata.processing_step && <li>Step: {metadata.processing_step}</li>}
      {metadata.lidar_products_found !== undefined && (
        <li>LiDAR Products: {metadata.lidar_products_found}</li>
      )}
      {metadata.coordinates && (
        <li>Coords: {formatCoordinates(metadata.coordinates)}</li>
      )}
      {metadata.output_file_size_mb !== undefined && (
        <li>Output Size: {metadata.output_file_size_mb.toFixed(2)} MB</li>
      )}
      {metadata.buffer_km !== undefined && (
        <li>Buffer: {metadata.buffer_km} km</li>
      )}
      {metadata.attempt !== undefined && <li>Attempt: {metadata.attempt}</li>}
      {metadata.bbox && <li>Bounding Box: {metadata.bbox}</li>}
    </ul>
  </div>
);

interface DownloadProgressProps {
  progress?: number;
}

const DownloadProgress = ({ progress }: DownloadProgressProps) => (
  <div className="mt-2">
    <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
      Downloading Point Cloud:{" "}
      {progress !== undefined ? `${progress.toFixed(0)}%` : "Starting..."}
    </div>
    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden border border-neutral-300 dark:border-neutral-600">
      <div
        className="bg-emerald-500 dark:bg-emerald-400 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress || 0}%` }}
      ></div>
    </div>
  </div>
);

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div
    className="p-3 border border-red-500/60 dark:border-red-400/40 rounded-lg mt-2 bg-red-500/10 dark:bg-red-400/10"
    style={panelStyle}
  >
    <div className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">
      Error:
    </div>
    <p className="text-xs text-red-700 dark:text-red-300">{message}</p>
  </div>
);

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  pointCount,
  downloadProgress,
  isDownloading,
  jobDetails,
}) => {
  const elapsedTime = useMemo(
    () => formatElapsedTime(jobDetails?.created_at, jobDetails?.completed_at),
    [jobDetails?.created_at, jobDetails?.completed_at]
  );

  const currentStatus = jobDetails?.status || status;

  return (
    <div
      className={`p-4 shadow-lg font-space-grotesk border rounded-2xl w-full max-w-md 
                  ${STATUS_BG_COLORS[currentStatus]} 
                  ${
                    currentStatus === "failed"
                      ? "border-red-500/60 dark:border-red-400/60"
                      : "border-emerald-300/60 dark:border-emerald-400/40"
                  } 
                  text-neutral-800 dark:text-neutral-200`}
      style={panelStyle}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            Point Cloud Status
          </h2>
          {jobDetails?.address && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
              {jobDetails.address}
            </p>
          )}
        </div>
        <StatusIndicator status={currentStatus} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            Points Loaded:
          </span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {pointCount > 0 ? pointCount.toLocaleString() : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            Elapsed Time:
          </span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {elapsedTime}
          </span>
        </div>
        {jobDetails?.job_id && (
          <div className="flex justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">
              Job ID:
            </span>
            <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {jobDetails.job_id}
            </span>
          </div>
        )}
      </div>

      {isDownloading && <DownloadProgress progress={downloadProgress} />}

      {currentStatus === "failed" && jobDetails?.error_message && (
        <ErrorDisplay message={jobDetails.error_message} />
      )}

      {currentStatus === "processing" && jobDetails?.metadata && (
        <ProcessingDetails metadata={jobDetails.metadata} />
      )}
    </div>
  );
};

export default StatusDisplay;

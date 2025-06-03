import React from "react";

interface StatusDisplayProps {
  status: string;
  pointCount: number;
  downloadProgress?: number;
  isDownloading?: boolean;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  pointCount,
  downloadProgress = 0,
  isDownloading = false,
}) => {
  return (
    <>
      <div className="absolute top-3 left-3 bg-white p-3 font-space-grotesk text-sm font-medium rounded shadow">
        Status: {status} | Points: {pointCount.toLocaleString()}
      </div>

      {isDownloading && (
        <div className="absolute top-16 left-3 bg-white p-3 w-72 font-space-grotesk rounded shadow">
          <div className="text-sm">
            Download in progress... {downloadProgress}% (
            {pointCount.toLocaleString()} points loaded)
          </div>
          <progress
            value={downloadProgress}
            max={100}
            className="w-full mt-2"
          />
        </div>
      )}
    </>
  );
};

export default StatusDisplay;

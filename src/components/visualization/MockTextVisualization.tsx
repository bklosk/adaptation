"use client";

import React, { useEffect, useState, useCallback } from "react";

interface MockTextVisualizationProps {
  address: string;
  bboxM?: number;
  resolution?: number;
  enableHighRes?: boolean;
}

const MockTextVisualization: React.FC<MockTextVisualizationProps> = ({
  address,
  bboxM = 64.0,
  resolution = 2048,
  enableHighRes = true,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [textData, setTextData] = useState<string | null>(null);
  const [jobsList, setJobsList] = useState<
    Array<{
      job_id?: string;
      status?: string;
      address?: string;
      created_at?: string;
    }>
  >([]);

  const fetchTextData = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setTextData(null);

    try {
      // Make multiple API calls to gather different types of data
      const [healthResponse, jobsResponse] = await Promise.all([
        fetch("http://localhost:8000/health"),
        fetch("http://localhost:8000/jobs"),
      ]);

      let healthData = {};
      let jobsData = [];

      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      if (jobsResponse.ok) {
        jobsData = await jobsResponse.json();
      }

      // Create a comprehensive text display
      const displayText = `
🏠 Location Analysis for: ${address}

📊 API Health Status:
${JSON.stringify(healthData, null, 2)}

🔧 Configuration:
• Bounding Box: ${bboxM}m × ${bboxM}m
• Resolution: ${resolution}×${resolution}px
• High Resolution Mode: ${enableHighRes ? "Enabled" : "Disabled"}

📋 Recent Processing Jobs:
${
  jobsData.length > 0
    ? jobsData
        .slice(0, 5)
        .map(
          (
            job: {
              job_id?: string;
              status?: string;
              address?: string;
              created_at?: string;
            },
            index: number
          ) =>
            `${index + 1}. Job ID: ${job.job_id || "Unknown"}
     Status: ${job.status || "Unknown"}
     Address: ${job.address || "Unknown"}
     Created: ${
       job.created_at ? new Date(job.created_at).toLocaleString() : "Unknown"
     }`
        )
        .join("\n\n")
    : "No recent jobs found"
}

🌐 API Endpoints Available:
• /health - Health check with dependency verification
• /process - Process point cloud from address
• /job/{job_id} - Get job status
• /jobs - List all jobs
• /download/{job_id} - Download processed files
• /orthophoto - Download orthophoto for address
• /flood-overhead - Generate flood risk visualization

📍 Current Request Details:
• Timestamp: ${new Date().toLocaleString()}
• Target Address: ${address}
• Processing Area: ${bboxM}m radius
• Output Resolution: ${resolution}px
• System Status: ${healthData ? "Connected" : "Disconnected"}

This is a mock text visualization component replacing the previous FloodVisualization.
The component demonstrates API connectivity and data display capabilities.
      `.trim();

      setTextData(displayText);
      setJobsList(jobsData);
    } catch (error) {
      console.error("Failed to fetch API data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load API data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, bboxM, resolution, enableHighRes]);

  useEffect(() => {
    fetchTextData();
  }, [fetchTextData]);

  const handleRetry = () => {
    fetchTextData();
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
          API Data Analysis
        </h2>
        <p className="text-sm text-gray-300 truncate font-space-grotesk">
          Mock text visualization with live API data for {address}
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
                Fetching API data...
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
                Failed to load API data
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

        {/* Text Display */}
        {textData && !isLoading && !error && (
          <div className="h-full w-full p-4 overflow-auto">
            <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {textData}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!isLoading && !error && textData && (
        <div
          className="p-3 border-t-2 border-white flex justify-between items-center"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="text-xs text-gray-300 font-space-grotesk">
            <div>Live API data visualization</div>
            <div className="mt-1">
              Jobs found: {jobsList.length} • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-white font-space-grotesk"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default MockTextVisualization;

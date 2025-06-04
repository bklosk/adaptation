"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PointCloudAPIService } from "./apiService";

interface FloodVisualizationProps {
  address: string;
  bboxM?: number;
}

const FloodVisualization: React.FC<FloodVisualizationProps> = ({
  address,
  bboxM = 64.0,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  const fetchFloodData = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setImageData(null);

    try {
      const blob = await PointCloudAPIService.fetchFloodOverhead(
        address,
        bboxM
      );
      console.log(`Flood API response: ${blob.size} bytes, type: ${blob.type}`);
      const dataUrl = URL.createObjectURL(blob);
      setImageData(dataUrl);
    } catch (error) {
      console.error("Failed to fetch flood data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load flood risk visualization"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, bboxM]);

  useEffect(() => {
    fetchFloodData();
  }, [fetchFloodData]);

  // Cleanup object URL when component unmounts or imageData changes
  useEffect(() => {
    return () => {
      if (imageData && imageData.startsWith("blob:")) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData]);

  const handleRetry = () => {
    fetchFloodData();
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
          Flood Risk Analysis
        </h2>
        <p className="text-sm text-gray-300 truncate font-space-grotesk">
          100-year flood depth for {address}
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
                Loading flood risk data...
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
                Failed to load flood data
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

        {/* Image Display */}
        {imageData && !isLoading && !error && (
          <div className="h-full w-full flex items-center justify-center p-4">
            <img
              src={imageData}
              alt="Flood risk visualization"
              className="max-w-full max-h-full object-contain border-2 border-gray-600"
              style={{
                imageRendering: "pixelated", // Preserve sharp edges for flood data
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                console.log(
                  `Flood image dimensions: ${img.naturalWidth}x${img.naturalHeight}`
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Controls and Info */}
      {!isLoading && !error && imageData && (
        <div
          className="p-3 border-t-2 border-white flex justify-between items-center"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="text-xs text-gray-300 font-space-grotesk">
            <div>100-year flood depth visualization</div>
            <div className="mt-1">
              Bounding box: {bboxM}m × {bboxM}m
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-white font-space-grotesk"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Legend */}
      {imageData && !isLoading && !error && (
        <div
          className="p-3 border-t border-gray-600 text-xs text-gray-300 font-space-grotesk"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="flex items-center justify-between">
            <span>Flood Depth:</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-200">Low</span>
              <div className="w-12 h-2 bg-gradient-to-r from-blue-200 via-blue-500 to-blue-800 border border-gray-600"></div>
              <span className="text-blue-800">High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodVisualization;

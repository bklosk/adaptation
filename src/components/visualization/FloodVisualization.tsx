"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { PointCloudAPIService } from "./apiService";

interface FloodVisualizationProps {
  address: string;
  bboxM?: number;
  resolution?: number;
  enableHighRes?: boolean; // Whether to allow high-res mode
}

const FloodVisualization: React.FC<FloodVisualizationProps> = ({
  address,
  bboxM = 64.0,
  resolution = 2048, // 2K resolution as standard
  enableHighRes = true,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [currentResolution, setCurrentResolution] =
    useState<number>(resolution);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchFloodData = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setImageData(null);
    setLoadingStartTime(Date.now());
    setEstimatedTimeLeft(null);

    try {
      // For initial load, start with a reasonable resolution
      const targetResolution = currentResolution;

      // Set estimated time based on resolution
      const estimatedMs =
        targetResolution <= 1024
          ? 3000
          : targetResolution <= 2048
          ? 8000
          : targetResolution <= 4096
          ? 25000
          : 60000;
      setEstimatedTimeLeft(estimatedMs);

      const blob = await PointCloudAPIService.fetchFloodOverhead(
        address,
        bboxM,
        targetResolution
      );
      console.log(
        `Flood API response: ${blob.size} bytes, type: ${blob.type}, resolution: ${targetResolution}x${targetResolution}`
      );
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
      setLoadingStartTime(null);
      setEstimatedTimeLeft(null);
    }
  }, [address, bboxM, currentResolution]);

  useEffect(() => {
    fetchFloodData();
  }, [fetchFloodData]);

  // Timer effect for estimated time countdown
  useEffect(() => {
    if (!isLoading || !loadingStartTime || !estimatedTimeLeft) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, estimatedTimeLeft - elapsed);

      if (remaining <= 0) {
        setEstimatedTimeLeft(null);
        clearInterval(interval);
      } else {
        setEstimatedTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, loadingStartTime, estimatedTimeLeft]);

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
          Ultra-high resolution 100-year flood depth for {address}
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
                Generating ultra-high resolution flood risk data...
              </p>
              {estimatedTimeLeft && (
                <div className="mt-2 text-sm text-gray-400 font-space-grotesk">
                  Estimated time: {Math.ceil(estimatedTimeLeft / 1000)}s
                </div>
              )}
              <div className="mt-3 text-xs text-gray-500 font-space-grotesk">
                Resolution: {currentResolution}×{currentResolution}px
              </div>
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
          <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
            <div className="relative">
              <Image
                src={imageData}
                alt="Ultra-high resolution flood risk visualization"
                width={currentResolution}
                height={currentResolution}
                className="border-2 border-gray-600"
                priority={true}
                quality={100}
                style={{
                  imageRendering: "auto",
                  width: `${Math.min(currentResolution * zoomLevel, 1200)}px`,
                  height: `${Math.min(currentResolution * zoomLevel, 1200)}px`,
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  console.log(
                    `High-res flood image loaded: ${img.naturalWidth}x${img.naturalHeight} pixels`
                  );
                }}
              />

              {/* Zoom Controls */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 bg-black bg-opacity-50 p-2 rounded">
                <button
                  onClick={() =>
                    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
                  }
                  className="w-8 h-8 bg-gray-700 text-white hover:bg-gray-600 rounded text-sm flex items-center justify-center"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25))
                  }
                  className="w-8 h-8 bg-gray-700 text-white hover:bg-gray-600 rounded text-sm flex items-center justify-center"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="w-8 h-8 bg-gray-700 text-white hover:bg-gray-600 rounded text-xs flex items-center justify-center"
                  title="Reset Zoom"
                >
                  1:1
                </button>
              </div>

              {/* Zoom Indicator */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
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
              Bounding box: {bboxM}m × {bboxM}m • Resolution:{" "}
              {currentResolution}×{currentResolution}px • Zoom:{" "}
              {Math.round(zoomLevel * 100)}%
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

      {/* Resolution Controls */}
      {!isLoading && !error && imageData && enableHighRes && (
        <div
          className="p-3 border-t border-gray-600 flex justify-between items-center"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="text-xs text-gray-300 font-space-grotesk">
            Resolution: {currentResolution}×{currentResolution}px
          </div>
          <div className="flex gap-2">
            {[1024, 2048, 4096].map((res) => (
              <button
                key={res}
                onClick={() => {
                  setCurrentResolution(res);
                }}
                disabled={currentResolution === res}
                className={`px-2 py-1 text-xs transition-colors border font-space-grotesk ${
                  currentResolution === res
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                }`}
              >
                {res}px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {imageData && !isLoading && !error && (
        <div
          className="p-3 border-t border-gray-600 text-xs text-gray-300 font-space-grotesk"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="flex items-center justify-between">
            <span>Ultra-High Resolution Flood Depth:</span>
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

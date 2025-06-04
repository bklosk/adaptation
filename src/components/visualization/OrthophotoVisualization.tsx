"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PointCloudAPIService } from "./apiService";
import { OrthophotoRequest } from "./types";

interface OrthophotoVisualizationProps {
  address: string;
  imageSize?: string;
}

const OrthophotoVisualization: React.FC<OrthophotoVisualizationProps> = ({
  address,
  imageSize = "800,600",
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrthophoto = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: OrthophotoRequest = {
        address,
        image_size: imageSize,
      };

      const blob = await PointCloudAPIService.fetchOrthophoto(request);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error("Failed to fetch orthophoto:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch orthophoto"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, imageSize]);

  useEffect(() => {
    fetchOrthophoto();

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fetchOrthophoto]);

  // Cleanup object URL when component unmounts or imageUrl changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleRetry = () => {
    fetchOrthophoto();
  };

  return (
    <div className="h-full w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm border-b">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Orthophoto View
        </h2>
        <p className="text-sm text-gray-600 truncate">{address}</p>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading orthophoto...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <div className="text-red-500 mb-4">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load orthophoto
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {imageUrl && !isLoading && !error && (
          <div className="h-full w-full overflow-auto">
            <img
              src={imageUrl}
              alt={`Orthophoto of ${address}`}
              className="w-full h-full object-contain"
              onError={() => {
                setError("Failed to display orthophoto image");
              }}
            />
          </div>
        )}

        {!imageUrl && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">No orthophoto available</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {imageUrl && !isLoading && (
        <div className="p-3 bg-white border-t flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Aerial imagery for location
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default OrthophotoVisualization;

"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import { PointCloudVisualization } from "../components/visualization";
import LocationForm from "../components/LocationForm";

export default function Home() {
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentBufferKm, setCurrentBufferKm] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleLocationSubmit = (address: string, bufferKm: number) => {
    setCurrentAddress(address);
    setCurrentBufferKm(bufferKm);
    setShowVisualization(true);
    setIsProcessing(true);
    // Reset processing state after a brief delay to show the loading state
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const handleNewSearch = () => {
    setShowVisualization(false);
    setIsProcessing(false);
    setShowEditForm(false);
  };

  const handleEditLocation = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = (address: string, bufferKm: number) => {
    setCurrentAddress(address);
    setCurrentBufferKm(bufferKm);
    setShowEditForm(false);
    setIsProcessing(true);
    // Reset processing state after a brief delay
    setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      {/* Main content with padding to account for fixed header */}
      <main className="pt-20">
        {!showVisualization ? (
          <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Point Cloud Visualization
                </h1>
                <p className="text-lg text-gray-600">
                  Enter an address to generate and visualize 3D point cloud data
                  from geographical coordinates.
                </p>
              </div>
              <LocationForm
                onSubmit={handleLocationSubmit}
                isLoading={isProcessing}
                initialAddress="1250 Wildwood Road, Boulder, CO"
                initialBufferKm={1.0}
              />
            </div>
          </div>
        ) : (
          <div className="relative h-[calc(100vh-5rem)] w-full overflow-hidden">
            {/* Back button */}
            <button
              onClick={handleNewSearch}
              className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg shadow-md hover:bg-white transition-colors flex items-center gap-2 text-sm sm:px-4"
            >
              ← New Search
            </button>

            {/* Current location info with edit button */}
            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg shadow-md max-w-xs sm:max-w-sm sm:px-4">
              <div className="text-sm">
                <div className="font-medium truncate">{currentAddress}</div>
                <div className="text-gray-500 mb-2">
                  Radius: {currentBufferKm} km
                </div>
                <button
                  onClick={handleEditLocation}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Edit Location
                </button>
              </div>
            </div>

            {/* Edit form overlay */}
            {showEditForm && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10 shadow-lg"
                  >
                    ×
                  </button>
                  <LocationForm
                    onSubmit={handleEditSubmit}
                    isLoading={isProcessing}
                    initialAddress={currentAddress}
                    initialBufferKm={currentBufferKm}
                  />
                </div>
              </div>
            )}

            <PointCloudVisualization
              address={currentAddress}
              bufferKm={currentBufferKm}
              initialViewState={{
                longitude: -105.2705,
                latitude: 40.015,
                zoom: 15,
                pitch: 60,
                bearing: 0,
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

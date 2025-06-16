"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import {
  PointCloudVisualization,
  FloodAnalysis,
  SatelliteVisualization, // Corrected import
} from "../components/visualization";
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

  const handleEditSubmit = (address: string, bufferKm: number) => {
    setCurrentAddress(address);
    setCurrentBufferKm(bufferKm);
    setShowEditForm(false);
    setIsProcessing(true);
    // Reset processing state after a brief delay
    setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B2223" }}>
      <Header />
      {/* Main content with padding to account for fixed header */}
      <main className="pt-20">
        {!showVisualization ? (
          <div
            className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4"
            style={{ backgroundColor: "#1B2223" }}
          >
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-4 font-space-grotesk">
                  Point Cloud Visualization
                </h1>
                <p className="text-lg text-gray-300 font-space-grotesk">
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
              className="absolute top-4 left-4 z-20 backdrop-blur-sm text-white px-4 py-2 shadow-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-space-grotesk border-2 border-white"
              style={{ backgroundColor: "#1B2223" }}
            >
              ← New Search
            </button>

            {/* Current location info with edit button - centered at top to avoid all UI conflicts */}
            {/* <div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 backdrop-blur-sm text-white px-4 py-2 shadow-md max-w-xs sm:max-w-sm border-2 border-white"
              style={{ backgroundColor: "#1B2223" }}
            >
              <div className="text-sm font-space-grotesk text-center">
                <div className="font-black truncate">{currentAddress}</div>
                <div className="text-gray-300 mb-2">
                  Radius: {currentBufferKm} km
                </div>
                <button
                  onClick={handleEditLocation}
                  className="text-blue-400 hover:text-blue-300 text-xs font-bold"
                >
                  Edit Location
                </button>
              </div>
            </div> */}

            {/* Edit form overlay */}
            {showEditForm && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="absolute -top-3 -right-3 text-white w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10 shadow-lg border-2 border-white font-space-grotesk font-black"
                    style={{ backgroundColor: "#1B2223" }}
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

            {/* Split layout with point cloud on left, satellite and flood risk on right */}
            <div className="flex h-full">
              {/* Point Cloud Visualization - Left Side */}
              <div className="w-1/2 h-full">
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

              {/* Right panel with satellite view and flood risk */}
              <div
                className="w-1/2 h-full flex flex-col border-l-2 border-white"
                style={{ backgroundColor: "#1B2223" }}
              >
                {/* Satellite Visualization - Top Right (Landscape - 3/5 height) */}
                <div className="h-3/5 border-b-2 border-white">
                  <SatelliteVisualization
                    address={currentAddress}
                    imageSize="800,600"
                  />
                </div>

                {/* Flood Risk Analysis - Bottom Right (2/5 height) */}
                <div className="h-2/5">
                  <FloodAnalysis address={currentAddress} bboxM={64.0} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

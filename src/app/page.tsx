"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import FaqSection from "../components/FaqSection";
import {
  PointCloudVisualization,
  FloodAnalysis,
  SatelliteVisualization,
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
    <div className="min-h-screen bg-stone-100 dark:bg-gray-900">
      <Header />
      {/* Main content with padding to account for fixed header */}
      {/* Header is h-20 (5rem) + top-4 (1rem margin) = 6rem total offset */}
      <main className="pt-16">
        {!showVisualization ? (
          <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-stone-100 dark:bg-gray-900">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 font-space-grotesk">
                  Point Cloud Visualization
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-space-grotesk">
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

              {/* Solarpunk House and FAQ Section */}
              <FaqSection />
            </div>
          </div>
        ) : (
          <div className="relative h-[calc(100vh-7rem)] w-full overflow-hidden">
            {/* Back button */}
            <button
              onClick={handleNewSearch}
              className="absolute top-4 left-4 z-20 backdrop-blur-sm text-white px-4 py-2 shadow-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-space-grotesk border-2 border-white bg-gray-800 dark:bg-gray-900"
            >
              ← New Search
            </button>

            {/* Edit form overlay */}
            {showEditForm && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="absolute -top-3 -right-3 text-white w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10 shadow-lg border-2 border-white font-space-grotesk font-black bg-gray-800 dark:bg-gray-900"
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
              <div className="w-1/2 h-full flex flex-col border-l-2 border-white bg-gray-800 dark:bg-gray-900">
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

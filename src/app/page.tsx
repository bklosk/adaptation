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
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleLocationSubmit = (address: string, bufferKm: number) => {
    setCurrentAddress(address);
    setCurrentBufferKm(bufferKm);
    setIsAnimatingOut(true);

    // Wait for animation to complete before showing visualization
    setTimeout(() => {
      setShowVisualization(true);
      setIsProcessing(true);
      setIsAnimatingOut(false);
      // Reset processing state after a brief delay to show the loading state
      setTimeout(() => setIsProcessing(false), 1000);
    }, 600); // Match animation duration
  };

  const handleNewSearch = () => {
    setShowVisualization(false);
    setIsProcessing(false);
    setShowEditForm(false);
    setIsAnimatingOut(false);
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
      {/* Header is h-14 (3.5rem) + top-4 (1rem) + extra spacing = ~6rem total offset */}
      <main className="pt-20">
        {!showVisualization ? (
          <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-stone-100 dark:bg-gray-900">
            <div className="max-w-2xl w-full">
              <LocationForm
                onSubmit={handleLocationSubmit}
                isLoading={isProcessing}
                initialAddress="1250 Wildwood Road, Boulder, CO"
                initialBufferKm={1.0}
                isAnimatingOut={isAnimatingOut}
              />

              {/* Solarpunk House and FAQ Section */}
              <FaqSection isAnimatingOut={isAnimatingOut} />
            </div>
          </div>
        ) : (
          <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden pt-4">
            {/* Back button */}
            <button
              onClick={handleNewSearch}
              className="absolute top-4 left-4 z-20 backdrop-blur-sm text-white px-4 py-2 shadow-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-space-grotesk border-2 border-white bg-gray-800 dark:bg-gray-900 rounded-xl"
            >
              ← New Search
            </button>

            {/* Edit form overlay */}
            {showEditForm && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="absolute -top-3 -right-3 text-white w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10 shadow-lg border-2 border-white font-space-grotesk font-black bg-gray-800 dark:bg-gray-900 rounded-xl"
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
            <div className="flex h-full p-4 gap-4 pt-2">
              {/* Point Cloud Visualization - Left Side */}
              <div
                className="w-1/2 h-1/2 relative"
                style={{
                  clipPath: "inset(0 round 1.5rem)",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                }}
              >
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
              <div className="w-1/2 h-full flex flex-col gap-2">
                {/* Satellite Visualization - Top Right (Landscape - 3/5 height) */}
                <div
                  className="h-3/5 relative"
                  style={{
                    clipPath: "inset(0 round 1.5rem)",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                  }}
                >
                  <SatelliteVisualization address={currentAddress} />
                </div>

                {/* Flood Risk Analysis - Bottom Right (2/5 height) */}
                <div
                  className="h-2/5 w-full relative"
                  style={{
                    clipPath: "inset(0 round 1.5rem)",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                  }}
                >
                  <FloodAnalysis address={currentAddress} bboxM={64.0} />
                </div>
              </div>
            </div>

            {/* Global styles for visualization containers */}
            <style jsx global>{`
              /* Ensure proper containment for clipped containers */
              .visualization-container {
                position: relative;
                overflow: hidden;
              }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
}

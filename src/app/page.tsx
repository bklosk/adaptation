"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import FaqSection from "../components/FaqSection";
import {
  FloodAnalysis,
  SatelliteVisualization,
} from "../components/visualization";
import LocationForm from "../components/LocationForm";

export default function Home() {
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleLocationSubmit = (address: string) => {
    setCurrentAddress(address);
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

  const handleEditSubmit = (address: string) => {
    setCurrentAddress(address);
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
                initialAddress="1340 E 55th st, Chicago, IL"
                initialBufferKm={1.0}
                isAnimatingOut={isAnimatingOut}
              />

              {/* Solarpunk House and FAQ Section */}
              <FaqSection isAnimatingOut={isAnimatingOut} />
            </div>
          </div>
        ) : (
          <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden pt-4">
            {/* New Search button - positioned to the left of header on desktop, below on mobile */}
            <button
              onClick={handleNewSearch}
              className={`
                fixed z-40 backdrop-blur-md bg-white/20 dark:bg-[#1B2223]/30 
                border border-white/10 dark:border-white/5 
                text-emerald-500 dark:text-emerald-400 
                px-4 py-3 rounded-3xl shadow-lg 
                hover:bg-white/30 dark:hover:bg-[#1B2223]/40 
                transition-all duration-300 flex items-center gap-3 
                text-sm font-space-grotesk font-bold 
                left-4 lg:left-[calc(7.5%-2rem)] xl:left-[calc(7.5%-3rem)] 
                top-20 lg:top-4
              `}
              style={{
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                // Adding the same noise pattern as the header for consistency
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              New Search
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
                    initialBufferKm={1.0}
                  />
                </div>
              </div>
            )}

            {/* Split layout with flood analysis on left, satellite on right */}
            <div className="flex flex-col lg:flex-row h-full p-4 gap-4 pt-2">
              {/* Flood Risk Analysis - Left Side (Desktop) / Top (Mobile) */}
              <div
                className="w-full lg:w-1/2 h-1/2 lg:h-full relative"
                style={{
                  clipPath: "inset(0 round 1.5rem)",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                }}
              >
                <FloodAnalysis address={currentAddress} bboxM={64.0} />
              </div>

              {/* Satellite Visualization - Right Side (Desktop) / Bottom (Mobile) */}
              <div
                className="w-full lg:w-1/2 h-1/2 lg:h-full relative"
                style={{
                  clipPath: "inset(0 round 1.5rem)",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                }}
              >
                <SatelliteVisualization address={currentAddress} />
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

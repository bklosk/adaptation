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
      <main className="pt-16">
        {!showVisualization ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
          <div
            style={{ position: "relative", height: "100vh", width: "100vw" }}
          >
            {/* Back button */}
            <button
              onClick={handleNewSearch}
              className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-white transition-colors flex items-center gap-2"
            >
              ← New Search
            </button>

            {/* Current location info with edit button */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg shadow-md max-w-sm">
              <div className="text-sm">
                <div className="font-medium">{currentAddress}</div>
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
              <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10"
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

        {/* Additional content to enable scrolling for testing the header animation */}
        {showVisualization && (
          <div className="bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Point Cloud Data Visualization
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Interactive 3D point cloud visualization</li>
                    <li>• Real-time data processing</li>
                    <li>• Customizable point size controls</li>
                    <li>• Geographic coordinate mapping</li>
                    <li>• Status monitoring and progress tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Technical Details
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Built with Deck.gl and React</li>
                    <li>• WebGL-powered rendering</li>
                    <li>• RESTful API integration</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Responsive design with Tailwind CSS</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  About This Demo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  This demonstration showcases advanced point cloud
                  visualization capabilities using modern web technologies. The
                  visualization displays geographical data points in a 3D
                  environment, allowing users to interact with and explore
                  complex datasets. The interface provides intuitive controls
                  for navigation and customization, making it easy to analyze
                  spatial data patterns and relationships.
                </p>
              </div>

              {/* Add more content to ensure scrolling is possible */}
              <div className="mt-8 space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-medium mb-3 text-gray-700">
                      Section {i}
                    </h4>
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

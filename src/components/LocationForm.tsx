"use client";

import React, { useState } from "react";

interface LocationFormProps {
  onSubmit: (address: string, bufferKm: number) => void;
  isLoading?: boolean;
  initialAddress?: string;
  initialBufferKm?: number;
}

// Simple SVG icons as components for better browser compatibility
const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "h-5 w-5 text-blue-600"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "h-4 w-4"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

interface LocationFormProps {
  onSubmit: (address: string, bufferKm: number) => void;
  isLoading?: boolean;
  initialAddress?: string;
  initialBufferKm?: number;
}

const LocationForm: React.FC<LocationFormProps> = ({
  onSubmit,
  isLoading = false,
  initialAddress = "",
  initialBufferKm = 1.0,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [bufferKm, setBufferKm] = useState(initialBufferKm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addressError, setAddressError] = useState("");

  const validateAddress = (addr: string): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) {
      setAddressError("Address is required");
      return false;
    }
    if (trimmed.length < 5) {
      setAddressError("Please enter a more specific address");
      return false;
    }
    setAddressError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress(address)) {
      onSubmit(address.trim(), bufferKm);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (addressError && value.trim().length >= 5) {
      setAddressError("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPinIcon className="h-5 w-5 text-blue-600" />
        Location Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter an address (e.g., 1250 Wildwood Road, Boulder, CO)"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
              addressError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            disabled={isLoading}
            required
          />
          {addressError && (
            <p className="mt-1 text-sm text-red-600">{addressError}</p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <CogIcon className="h-4 w-4" />
            Advanced Settings
            <span
              className={`transform transition-transform duration-200 ${
                showAdvanced ? "rotate-90" : ""
              }`}
            >
              ➤
            </span>
          </button>
        </div>

        {showAdvanced && (
          <div className="border-t pt-4">
            <label
              htmlFor="bufferKm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Radius (km)
            </label>
            <input
              type="number"
              id="bufferKm"
              value={bufferKm}
              onChange={(e) => setBufferKm(parseFloat(e.target.value) || 0)}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Area around the address to search for point cloud data
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !address.trim() || address.trim().length < 5}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            "Generate Point Cloud"
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Quick Examples:</strong>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "1250 Wildwood Road, Boulder, CO",
            "Central Park, New York, NY",
            "Golden Gate Bridge, San Francisco, CA",
            "Space Needle, Seattle, WA",
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setAddress(example);
                setAddressError("");
              }}
              disabled={isLoading}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {example.split(",")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationForm;

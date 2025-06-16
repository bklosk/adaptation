"use client";

import React, { useState } from "react";
import { ViewState } from "../data/types";

interface CameraControlsProps {
  viewState: ViewState;
  onViewStateChange: (viewState: Partial<ViewState>) => void;
  onResetView: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  viewState,
  onViewStateChange,
  onResetView,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const handleSliderChange = (property: keyof ViewState, value: number) => {
    onViewStateChange({ [property]: value });
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="backdrop-blur-sm p-2 shadow-lg hover:bg-gray-700 transition-all border-2 border-white font-space-grotesk"
        style={{ backgroundColor: "#1B2223" }}
        title="Camera Controls"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="backdrop-blur-sm p-4 shadow-lg border-2 border-white w-full max-w-xs"
      style={{ backgroundColor: "#1B2223" }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white font-space-grotesk">
            Camera Controls
          </h3>
          <div className="flex space-x-2 items-center">
            <button
              onClick={onResetView}
              className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors border border-blue-600 font-space-grotesk font-black"
            >
              Reset View
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-300 hover:text-white text-lg leading-none font-black"
              title="Hide Camera Controls"
            >
              ×
            </button>
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex justify-between font-space-grotesk">
            Zoom
            <span className="text-gray-300">{viewState.zoom.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="8"
            max="22"
            step="0.1"
            value={viewState.zoom}
            onChange={(e) =>
              handleSliderChange("zoom", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-700 appearance-none cursor-pointer slider border border-white"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex justify-between font-space-grotesk">
            Pitch (Tilt)
            <span className="text-gray-300">{viewState.pitch.toFixed(0)}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="85"
            step="1"
            value={viewState.pitch}
            onChange={(e) =>
              handleSliderChange("pitch", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-700 appearance-none cursor-pointer slider border border-white"
          />
        </div>

        {/* Bearing Control */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex justify-between font-space-grotesk">
            Rotation
            <span className="text-gray-300">
              {viewState.bearing.toFixed(0)}°
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={viewState.bearing}
            onChange={(e) =>
              handleSliderChange("bearing", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-700 appearance-none cursor-pointer slider border border-white"
          />
        </div>

        {/* Quick Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white font-space-grotesk">
            Quick Views
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewStateChange({ pitch: 0, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-white font-space-grotesk"
            >
              Top View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 45, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-white font-space-grotesk"
            >
              Angle View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 85, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-white font-space-grotesk"
            >
              Side View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 45, bearing: 45 })}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-white font-space-grotesk"
            >
              Corner View
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CameraControls;

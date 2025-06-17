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

  const panelStyle = {
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="p-2 shadow-lg hover:bg-neutral-700/70 transition-all border border-emerald-300/60 dark:border-emerald-400/40 rounded-lg text-white font-space-grotesk bg-white/60 dark:bg-[#1B2223]/70"
        style={panelStyle}
        title="Show Camera Controls"
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
      className="p-4 shadow-lg border border-emerald-300/60 dark:border-emerald-400/40 w-full max-w-xs rounded-2xl bg-white/60 dark:bg-[#1B2223]/70 text-neutral-800 dark:text-neutral-200"
      style={panelStyle}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-space-grotesk">
            Camera Controls
          </h3>
          <div className="flex space-x-2 items-center">
            <button
              onClick={onResetView}
              className="px-3 py-1 text-xs bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors rounded-md font-space-grotesk font-bold border border-emerald-600"
            >
              Reset View
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-lg leading-none font-bold"
              title="Hide Camera Controls"
            >
              ×
            </button>
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex justify-between font-space-grotesk">
            Zoom
            <span className="text-neutral-500 dark:text-neutral-400">
              {viewState.zoom.toFixed(1)}
            </span>
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
            className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider border border-neutral-400 dark:border-neutral-600 accent-emerald-500 dark:accent-emerald-400"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex justify-between font-space-grotesk">
            Pitch (Tilt)
            <span className="text-neutral-500 dark:text-neutral-400">
              {viewState.pitch.toFixed(0)}°
            </span>
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
            className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider border border-neutral-400 dark:border-neutral-600 accent-emerald-500 dark:accent-emerald-400"
          />
        </div>

        {/* Bearing Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex justify-between font-space-grotesk">
            Bearing (Rotate)
            <span className="text-neutral-500 dark:text-neutral-400">
              {viewState.bearing.toFixed(0)}°
            </span>
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={viewState.bearing}
            onChange={(e) =>
              handleSliderChange("bearing", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider border border-neutral-400 dark:border-neutral-600 accent-emerald-500 dark:accent-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};

export default CameraControls;

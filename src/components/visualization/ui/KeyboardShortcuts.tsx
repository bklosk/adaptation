"use client";

import React, { useState } from "react";

const KeyboardShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: "Arrow Keys", description: "Pan camera view" },
        { keys: "W A S D", description: "Alternative pan controls" },
      ],
    },
    {
      category: "Zoom",
      items: [
        { keys: "+ or =", description: "Zoom in" },
        { keys: "- or _", description: "Zoom out" },
      ],
    },
    {
      category: "Rotation",
      items: [
        { keys: "Q / E", description: "Rotate left/right" },
        { keys: "R / F", description: "Tilt up/down" },
      ],
    },
    {
      category: "Other",
      items: [{ keys: "Spacebar", description: "Reset to optimal view" }],
    },
  ];

  return (
    <div className="relative">
      {/* Help Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="backdrop-blur-sm p-2 shadow-lg hover:bg-gray-700 transition-all border-2 border-white font-space-grotesk"
        style={{ backgroundColor: "#1B2223" }}
        title="Keyboard Shortcuts"
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
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Shortcuts Panel */}
      {isVisible && (
        <div
          className="absolute top-12 left-0 backdrop-blur-sm p-4 shadow-lg z-30 min-w-72 border-2 border-white"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white font-space-grotesk">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-300 hover:text-white text-lg leading-none font-black"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="text-xs font-black text-gray-300 uppercase tracking-wide mb-2 font-space-grotesk">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-white font-space-grotesk">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-gray-700 border border-white text-xs font-mono text-white">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t-2 border-white">
            <p className="text-xs text-gray-300 font-space-grotesk">
              Focus on the visualization area to use keyboard controls
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcuts;

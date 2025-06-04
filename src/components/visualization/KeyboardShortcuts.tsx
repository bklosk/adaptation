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
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg z-20 hover:bg-opacity-100 transition-all"
        title="Keyboard Shortcuts"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
        <div className="absolute top-16 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-20 min-w-72">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Focus on the visualization area to use keyboard controls
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;

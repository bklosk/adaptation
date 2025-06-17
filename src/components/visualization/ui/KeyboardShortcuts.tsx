"use client";

import React, { useState } from "react";

const KeyboardShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const panelStyle = {
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
  };

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
    <div className="relative font-space-grotesk">
      {/* Help Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-2 shadow-lg hover:bg-neutral-700/70 transition-all border border-emerald-300/60 dark:border-emerald-400/40 rounded-lg text-white bg-white/60 dark:bg-[#1B2223]/70"
        style={panelStyle}
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
          className="absolute top-12 left-0 p-4 shadow-lg z-30 min-w-72 border border-emerald-300/60 dark:border-emerald-400/40 rounded-2xl bg-white/60 dark:bg-[#1B2223]/70 text-neutral-800 dark:text-neutral-200"
          style={panelStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-lg leading-none font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-600 rounded-md text-xs font-mono text-neutral-700 dark:text-neutral-300">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcuts;

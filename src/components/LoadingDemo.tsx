import React from "react";
import LoadingSpinner from "./ui/LoadingSpinner";

const LoadingDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8">
        Loading Spinner Demo
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Different sizes */}
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-4">Small</h3>
          <LoadingSpinner size="sm" color="blue" />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-semibold mb-4">Medium</h3>
          <LoadingSpinner size="md" color="emerald" />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-semibold mb-4">Large</h3>
          <LoadingSpinner size="lg" color="red" />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-semibold mb-4">Extra Large</h3>
          <LoadingSpinner size="xl" color="white" />
        </div>
      </div>

      {/* With text examples */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <LoadingSpinner
            size="lg"
            color="emerald"
            text="Analyzing flood patterns..."
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <LoadingSpinner
            size="md"
            color="blue"
            text="Generating visualization data..."
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;

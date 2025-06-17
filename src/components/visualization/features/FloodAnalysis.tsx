"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface FloodAnalysisProps {
  address: string;
  bboxM?: number;
}

interface Intervention {
  intervention_name: string;
  placement_description: string;
  capital_cost_low_usd: number;
  capital_cost_high_usd: number;
  annual_maintenance_usd: number;
  risk_reduction_pct: number;
  regulatory_notes: string;
}

interface AnalysisData {
  interventions: Intervention[];
  assumptions: string[];
}

interface FloodAnalysisResponse {
  success: boolean;
  message: string;
  analysis: string | null;
  model: string | null;
  tokens_used: number | null;
  timestamp: string;
  flood_image_path: string | null;
  satellite_image_path: string | null;
  error: string | null;
}

const FloodAnalysis: React.FC<FloodAnalysisProps> = ({
  address,
  bboxM = 64.0,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] =
    useState<FloodAnalysisResponse | null>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisData | null>(
    null
  );

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  // Helper function to get intervention icon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getInterventionIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("rain garden") || lowerName.includes("bioswale"))
      return "🌱";
    if (lowerName.includes("french drain") || lowerName.includes("drain"))
      return "🔧";
    if (lowerName.includes("berm") || lowerName.includes("levee")) return "🏔️";
    if (lowerName.includes("floodproof") || lowerName.includes("waterproof"))
      return "🛡️";
    if (lowerName.includes("elevate") || lowerName.includes("raise"))
      return "⬆️";
    if (lowerName.includes("barrier") || lowerName.includes("wall"))
      return "🧱";
    return "🔨";
  };

  // Helper function to get risk reduction color
  const getRiskReductionColor = (percentage: number): string => {
    if (percentage >= 50) return "bg-green-600";
    if (percentage >= 25) return "bg-yellow-600";
    if (percentage >= 10) return "bg-orange-600";
    return "bg-red-600";
  };

  const fetchFloodAnalysis = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setAnalysisData(null);
    setParsedAnalysis(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/analyze-flood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          bbox_m: bboxM,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: FloodAnalysisResponse = await response.json();
      setAnalysisData(data);

      // Parse the analysis JSON string
      if (data.analysis) {
        try {
          const parsed: AnalysisData = JSON.parse(data.analysis);
          setParsedAnalysis(parsed);
        } catch (parseError) {
          console.error("Failed to parse analysis JSON:", parseError);
          setParsedAnalysis(null);
        }
      } else {
        setParsedAnalysis(null);
      }

      if (!data.success) {
        throw new Error(data.error || data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Failed to fetch flood analysis:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load flood analysis"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, bboxM]);

  useEffect(() => {
    fetchFloodAnalysis();
  }, [fetchFloodAnalysis]);

  const handleRetry = () => {
    fetchFloodAnalysis();
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-800 dark:bg-gray-900 text-white p-4">
      {isLoading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-300 font-space-grotesk">
              Analyzing flood risk with AI...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-red-400 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-space-grotesk">
              Failed to analyze flood risk
            </h3>
            <p className="text-gray-300 mb-4 max-w-md font-space-grotesk">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors border-2 border-blue-600 font-space-grotesk font-black"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Analysis Display */}
      {analysisData && !isLoading && !error && (
        <>
          <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {parsedAnalysis && (
              <div className="space-y-6 p-1">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-400 mb-3 font-space-grotesk">
                    Flood Adaptation Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parsedAnalysis.interventions.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-700 p-4 rounded-lg shadow-lg border border-emerald-500/50 hover:shadow-emerald-500/30 transition-shadow duration-300"
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">
                            {getInterventionIcon(item.intervention_name)}
                          </span>
                          <h3 className="text-lg font-semibold text-emerald-300 font-space-grotesk">
                            {item.intervention_name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-300 mb-1">
                          {item.placement_description}
                        </p>
                        <div className="text-xs space-y-1 mt-2">
                          <p>
                            <span className="font-medium text-gray-400">
                              Cost:
                            </span>{" "}
                            {formatCurrency(item.capital_cost_low_usd)} -
                            {formatCurrency(item.capital_cost_high_usd)}
                          </p>
                          <p>
                            <span className="font-medium text-gray-400">
                              Maintenance:
                            </span>{" "}
                            {formatCurrency(item.annual_maintenance_usd)}/yr
                          </p>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-400">
                              Risk Reduction:
                            </span>
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full text-white ${getRiskReductionColor(
                                item.risk_reduction_pct
                              )}`}
                            >
                              {item.risk_reduction_pct}%
                            </span>
                          </div>
                        </div>
                        {item.regulatory_notes && (
                          <p className="text-xs text-yellow-400 mt-2 italic">
                            Note: {item.regulatory_notes}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-emerald-400 mb-2 font-space-grotesk">
                    Key Assumptions
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1 bg-gray-700 p-3 rounded-md border border-emerald-500/30">
                    {parsedAnalysis.assumptions.map((assumption, index) => (
                      <li key={index}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {analysisData.message && !parsedAnalysis && (
              <div className="text-center text-gray-400 p-4">
                {analysisData.message}
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Analysis based on model: {analysisData.model || "N/A"} | Tokens
            used: {analysisData.tokens_used || "N/A"} | Generated:
            {new Date(analysisData.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};

export default FloodAnalysis;

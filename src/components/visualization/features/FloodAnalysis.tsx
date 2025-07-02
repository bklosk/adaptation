"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../ui/LoadingSpinner";

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
    <div className="h-full w-full bg-stone-100 dark:bg-gray-900 font-space-grotesk">
      <div
        className="h-full rounded-2xl backdrop-blur-md bg-white/25 dark:bg-[#1B2223]/35 border-2 border-emerald-300/60 dark:border-emerald-400/40 overflow-hidden"
        style={{
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-emerald-300/30 dark:border-emerald-400/20">
          <motion.h1
            className="text-2xl font-black text-emerald-500 dark:text-emerald-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Flood Risk Analysis
          </motion.h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered adaptation strategies for {address}
          </p>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100%-120px)] flex flex-col">
          {isLoading && (
            <div className="flex-grow flex items-center justify-center p-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LoadingSpinner
                  size="xl"
                  color="emerald"
                  text="AI is evaluating flood patterns and generating adaptation strategies..."
                />
              </motion.div>
            </div>
          )}

          {error && (
            <div className="flex-grow flex items-center justify-center p-8">
              <motion.div
                className="text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
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
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Analysis Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
                >
                  Try Again
                </button>
              </motion.div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisData && !isLoading && !error && (
            <div className="flex-grow overflow-hidden flex flex-col">
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {parsedAnalysis && (
                  <>
                    {/* Interventions Grid */}
                    <div>
                      <motion.h2
                        className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      >
                        Adaptation Strategies
                      </motion.h2>
                      <div className="grid grid-cols-1 gap-4">
                        {parsedAnalysis.interventions.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.1 + 0.2,
                              duration: 0.5,
                            }}
                            className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-200/50 dark:border-emerald-400/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl mt-1 group-hover:scale-110 transition-transform duration-300">
                                {getInterventionIcon(item.intervention_name)}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">
                                  {item.intervention_name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                  {item.placement_description}
                                </p>

                                {/* Cost and Risk Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 dark:text-gray-500">
                                        Capital Cost:
                                      </span>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(
                                          item.capital_cost_low_usd
                                        )}{" "}
                                        -{" "}
                                        {formatCurrency(
                                          item.capital_cost_high_usd
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 dark:text-gray-500">
                                        Annual Maintenance:
                                      </span>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(
                                          item.annual_maintenance_usd
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center sm:justify-end">
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                        Risk Reduction
                                      </div>
                                      <div
                                        className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getRiskReductionColor(
                                          item.risk_reduction_pct
                                        )}`}
                                      >
                                        {item.risk_reduction_pct}%
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {item.regulatory_notes && (
                                  <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                      <span className="font-medium">
                                        Regulatory Note:
                                      </span>{" "}
                                      {item.regulatory_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Key Assumptions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Key Assumptions
                      </h3>
                      <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-200/50 dark:border-emerald-400/20">
                        <ul className="space-y-2">
                          {parsedAnalysis.assumptions.map(
                            (assumption, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span className="text-emerald-500 mt-1">•</span>
                                <span>{assumption}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  </>
                )}

                {analysisData.message && !parsedAnalysis && (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      {analysisData.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="border-t border-emerald-300/30 dark:border-emerald-400/20 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Model: {analysisData.model || "N/A"}</span>
                    <span>Tokens: {analysisData.tokens_used || "N/A"}</span>
                  </div>
                  <div className="text-center">
                    Generated:{" "}
                    {new Date(analysisData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloodAnalysis;

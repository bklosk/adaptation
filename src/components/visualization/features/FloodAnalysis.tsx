"use client";

import React, { useEffect, useState, useCallback } from "react";

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
    <div
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: "#1B2223" }}
    >
      {/* Header */}
      <div
        className="p-4 shadow-sm border-b-2 border-white"
        style={{ backgroundColor: "#1B2223" }}
      >
        <h2 className="text-lg font-black text-white mb-1 font-space-grotesk">
          AI Flood Risk Analysis
        </h2>
        <p className="text-sm text-gray-300 truncate font-space-grotesk">
          OpenAI-powered flood assessment with satellite and flood depth imagery
          for {address}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "#1B2223" }}
          >
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-300 font-space-grotesk">
                Analyzing flood risk with AI...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "#1B2223" }}
          >
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
          <div className="h-full w-full p-4 overflow-auto">
            <div className="space-y-4">
              {/* Header with metadata */}
              <div className="bg-gray-800 border-2 border-blue-600 rounded-lg p-4">
                <h3 className="text-blue-400 font-space-grotesk font-bold mb-2">
                  🌊 AI Flood Risk Analysis for {address}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <strong>Analysis Time:</strong>{" "}
                    {new Date(analysisData.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <strong>AI Model:</strong>{" "}
                    {analysisData.model || "OpenAI GPT-4"}
                  </div>
                  <div>
                    <strong>Bounding Box:</strong> {bboxM}m × {bboxM}m
                  </div>
                  <div>
                    <strong>Tokens Used:</strong>{" "}
                    {analysisData.tokens_used || "N/A"}
                  </div>
                </div>
                {analysisData.flood_image_path && (
                  <div className="mt-2 text-xs text-blue-300">
                    ✓ Flood depth visualization generated
                  </div>
                )}
                {analysisData.satellite_image_path && (
                  <div className="text-xs text-blue-300">
                    ✓ Satellite imagery analyzed
                  </div>
                )}
              </div>

              {/* Interventions List */}
              {parsedAnalysis?.interventions &&
                parsedAnalysis.interventions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-green-400 font-space-grotesk font-bold mb-4 flex items-center">
                      <span className="mr-2">🛡️</span>
                      Recommended Flood Mitigation Interventions
                    </h4>
                    {parsedAnalysis.interventions.map((intervention, index) => (
                      <div
                        key={index}
                        className="bg-gray-900 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="text-blue-300 font-space-grotesk font-bold text-lg">
                            {intervention.intervention_name}
                          </h5>
                          <div className="text-right">
                            {" "}
                            <div
                              className={`text-white px-2 py-1 rounded text-xs font-bold ${getRiskReductionColor(
                                intervention.risk_reduction_pct
                              )}`}
                            >
                              -{intervention.risk_reduction_pct}% Risk
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          {intervention.placement_description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="bg-gray-800 p-3 rounded">
                            <div className="text-xs text-gray-400 mb-1">
                              Capital Cost
                            </div>
                            <div className="text-white font-mono">
                              {formatCurrency(
                                intervention.capital_cost_low_usd
                              )}{" "}
                              -{" "}
                              {formatCurrency(
                                intervention.capital_cost_high_usd
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded">
                            <div className="text-xs text-gray-400 mb-1">
                              Annual Maintenance
                            </div>
                            <div className="text-white font-mono">
                              {formatCurrency(
                                intervention.annual_maintenance_usd
                              )}
                              /year
                            </div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded">
                            <div className="text-xs text-gray-400 mb-1">
                              Risk Reduction
                            </div>
                            <div className="text-green-400 font-mono font-bold">
                              {intervention.risk_reduction_pct}%
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded p-3">
                          <div className="text-xs text-yellow-400 mb-1 font-bold">
                            ⚠️ Regulatory Notes
                          </div>
                          <div className="text-yellow-200 text-xs">
                            {intervention.regulatory_notes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Assumptions */}
              {parsedAnalysis?.assumptions &&
                parsedAnalysis.assumptions.length > 0 && (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-orange-400 font-space-grotesk font-bold mb-3 flex items-center">
                      <span className="mr-2">ℹ️</span>
                      Analysis Assumptions
                    </h4>
                    <ul className="space-y-2">
                      {parsedAnalysis.assumptions.map((assumption, index) => (
                        <li
                          key={index}
                          className="text-gray-300 text-sm flex items-start"
                        >
                          <span className="text-orange-400 mr-2 mt-1">•</span>
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Fallback for raw analysis */}
              {!parsedAnalysis && analysisData?.analysis && (
                <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4">
                  <h4 className="text-green-400 font-space-grotesk font-bold mb-3">
                    📋 Raw Analysis Data
                  </h4>
                  <div className="text-gray-200 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {analysisData.analysis}
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-300">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        analysisData.success ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></span>
                    Status:{" "}
                    {analysisData.success
                      ? "Analysis Complete"
                      : "Analysis Failed"}
                  </div>
                  <div className="text-gray-400">{analysisData.message}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!isLoading && !error && analysisData && (
        <div
          className="p-3 border-t-2 border-white flex justify-between items-center"
          style={{ backgroundColor: "#1B2223" }}
        >
          <div className="text-xs text-gray-300 font-space-grotesk">
            <div>AI-powered flood risk analysis</div>
            <div className="mt-1">
              Analysis completed • Model: {analysisData.model || "GPT-4"} • Last
              updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-white font-space-grotesk"
          >
            Re-analyze
          </button>
        </div>
      )}
    </div>
  );
};

export default FloodAnalysis;

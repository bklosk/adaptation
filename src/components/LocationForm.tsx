"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./ui/LoadingSpinner";

interface LocationFormProps {
  onSubmit: (address: string, bufferKm: number) => void;
  isLoading?: boolean;
  initialAddress?: string;
  initialBufferKm?: number;
  isAnimatingOut?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  onSubmit,
  isLoading = false,
  initialAddress = "",
  initialBufferKm = 1.0,
  isAnimatingOut = false,
}) => {
  const [address, setAddress] = useState(initialAddress);
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
      onSubmit(address.trim(), initialBufferKm);
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
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        className="rounded-2xl backdrop-blur-md bg-white/25 dark:bg-[#1B2223]/35 border-2 border-emerald-300/60 dark:border-emerald-400/40 p-8 font-space-grotesk"
        style={{
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={isAnimatingOut ? { y: 20, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{
          duration: isAnimatingOut ? 0.6 : 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: isAnimatingOut ? 0 : 0.2,
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="address"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"
            >
              Address
            </label>
            <div className="relative">
              <input
                type="text"
                id="address"
                value={address}
                onChange={handleAddressChange}
                placeholder="Enter an address or location"
                className={`w-full pr-20 pl-3 py-2 rounded-xl border-2 focus:outline-none transition-all duration-300 font-space-grotesk text-base backdrop-blur-sm ${
                  addressError
                    ? "border-red-400 focus:border-red-500 bg-red-50/80 dark:bg-red-900/20"
                    : "border-white/30 focus:border-emerald-400 bg-white/60 dark:bg-white/10 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                }`}
                disabled={isLoading}
                required
              />
              <motion.button
                type="submit"
                disabled={
                  isLoading || !address.trim() || address.trim().length < 5
                }
                className="absolute right-0 top-0 bottom-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-r-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-sm"
              >
                {isLoading ? <LoadingSpinner size="sm" color="white" /> : "Go"}
              </motion.button>
            </div>
            {addressError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500 dark:text-red-400"
              >
                {addressError}
              </motion.p>
            )}
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-bold mb-3 text-center">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "1600 Pennslyvania Ave NW, Washington, DC",
              "Central Park, New York, NY",
              "Golden Gate Bridge, San Francisco, CA",
              "Space Needle, Seattle, WA",
            ].map((example) => (
              <motion.button
                key={example}
                type="button"
                onClick={() => {
                  setAddress(example);
                  setAddressError("");
                }}
                disabled={isLoading}
                className="text-xs bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.01 }}
              >
                {example.split(",")[0]}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationForm;

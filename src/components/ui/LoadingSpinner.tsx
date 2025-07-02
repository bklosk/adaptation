import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "emerald" | "red" | "white" | "gray";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "emerald",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-400",
    emerald: "border-emerald-400",
    red: "border-red-400",
    white: "border-white",
    gray: "border-gray-400",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        {/* Modern loading spinner with smooth animation */}
        <motion.div
          className={`
            ${sizeClasses[size]}
            border-2 border-transparent
            rounded-full
            relative
          `}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Outer ring */}
          <div
            className={`
              absolute inset-0
              ${colorClasses[color]}
              border-2 border-transparent
              rounded-full
            `}
            style={{
              borderTopColor: "currentColor",
              borderRightColor: "currentColor",
            }}
          />
          {/* Inner accent */}
          <motion.div
            className={`
              absolute inset-1
              ${colorClasses[color]}
              border border-transparent
              rounded-full
              opacity-60
            `}
            style={{
              borderBottomColor: "currentColor",
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Loading text */}
        {text && (
          <motion.p
            className="text-sm font-space-grotesk text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;

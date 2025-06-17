import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface FaqSectionProps {
  isAnimatingOut?: boolean;
}

const FaqSection: React.FC<FaqSectionProps> = ({ isAnimatingOut = false }) => {
  return (
    <motion.div
      className="mt-16 flex items-center gap-8"
      initial={{ y: 20, opacity: 0 }}
      animate={isAnimatingOut ? { y: 20, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{
        duration: isAnimatingOut ? 0.6 : 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: isAnimatingOut ? 0.1 : 0.4,
      }}
    >
      <div className="flex-shrink-0">
        <Image
          src="/solarpunk_house.png"
          alt="Solarpunk sustainable house"
          width={256}
          height={192}
          className="rounded-lg"
        />
      </div>
      <div className="flex-1">
        <div className="space-y-4 font-comic-neue">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              What is point cloud visualization?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Point cloud visualization creates 3D representations of
              geographical areas using elevation data, helping you understand
              terrain and landscape features in detail.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              How accurate is the flood risk analysis?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our flood analysis uses current geological and hydrological data
              to provide risk assessments for climate adaptation planning.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Can I use this for urban planning?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Absolutely! This tool is designed to support sustainable urban
              development and climate-resilient community planning.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FaqSection;

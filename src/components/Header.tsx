import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface HeaderProps {
  items?: string[];
}

const Header: React.FC<HeaderProps> = ({
  items = ["Home", "About", "Projects", "Contact"],
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <motion.header
      className="fixed top-0 left-0 w-full z-50 shadow-lg"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <div
        className="flex w-full items-center border border-white h-20"
        style={{ backgroundColor: "#3D3D3E" }}
      >
        {/* Logo Section */}
        <div className="flex-none px-8 py-4 border-r border-white min-w-[220px] flex justify-center">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-auto"
            />
            <span className="text-white font-black text-2xl font-space-grotesk">
              tdc
            </span>
          </div>
        </div>

        {/* Navigation Section - Combined center rectangles */}
        <div className="flex-1 flex">
          {items.slice(0, 2).map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex-1 px-4 py-4 text-white font-medium text-sm sm:text-base
                       hover:bg-gray-600
                       focus:outline-none focus:ring-2 focus:ring-white
                       transition-all duration-200 cursor-pointer
                       text-center font-space-grotesk"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Hamburger Menu Section */}
        <div className="flex-none px-4 py-4 border-l border-white">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white
                     transition-all duration-200 p-1 rounded"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/Dropdown Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 w-full shadow-lg z-60"
          style={{ backgroundColor: "#3D3D3E" }}
        >
          {items.slice(2).map((item, index) => (
            <a
              key={index}
              href="#"
              className="block px-4 py-3 text-white font-medium text-sm sm:text-base
                       border-b border-white last:border-b-0
                       hover:bg-gray-600
                       focus:outline-none focus:ring-2 focus:ring-white
                       transition-all duration-200 cursor-pointer
                       font-space-grotesk"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  items?: string[];
}

const Header: React.FC<HeaderProps> = ({
  items = ["Home", "About", "Projects", "Contact"],
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

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
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[85%] max-w-4xl min-w-[320px] z-50 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-[#1B2223]/30 overflow-hidden font-space-grotesk border border-white/10 dark:border-white/5"
      style={{
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
        // Adding a subtle noise pattern as a background image
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      }}
      initial={{ y: 15, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -110,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1,
      }}
    >
      <div className="flex w-full h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-black text-emerald-400">
            climate risk plan
          </h1>
        </div>

        {/* Navigation Links for medium screens and up */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
          {items.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 lg:px-3 py-1 lg:py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuHovered(!isMenuHovered)}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:focus:ring-white transition-colors duration-200"
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
                  isMenuHovered
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuHovered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 w-full z-60 min-h-48 bg-white/20 dark:bg-[#3D3D3E]/30 border border-white/10 dark:border-white/5 rounded-b-2xl"
          style={{
            backdropFilter: "blur(12px) saturate(150%)",
            WebkitBackdropFilter: "blur(12px) saturate(150%)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            // Adding a subtle noise pattern as a background image
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
          }}
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
        >
          {items.slice(2).map((item, index) => (
            <a
              key={index}
              href="#"
              className="block px-4 py-6 text-gray-800 dark:text-white font-medium text-lg
                       border-b border-gray-200 dark:border-white lg:border-b-2 last:border-b-0
                       hover:text-gray-600 dark:hover:text-gray-300
                       focus:outline-none focus:text-gray-600 dark:focus:text-gray-300
                       transition-colors duration-200 cursor-pointer
                       font-space-grotesk"
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

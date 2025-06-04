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
      className="fixed top-0 left-0 w-full z-50"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <div className="flex w-full h-20" style={{ backgroundColor: "#1B2223" }}>
        {/* Logo Rectangle */}
        <div className="md:w-48 flex-1 md:flex-none px-4 pl-8 flex justify-start items-center border-b border-r border-white lg:border-b-2 lg:border-r-2">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-auto"
            />
            <span className="text-white font-black text-3xl font-space-grotesk">
              risc
            </span>
          </div>
        </div>

        {/* Navigation Rectangle - Hidden on medium and smaller screens */}
        <div className="hidden md:flex flex-1 px-4 justify-center items-center border-b border-white lg:border-b-2 border-r lg:border-r-2">
          <nav className="flex space-x-8">
            {items.slice(0, 2).map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-white font-medium text-sm sm:text-base
                         hover:text-gray-300
                         focus:outline-none focus:text-gray-300
                         transition-colors duration-200 cursor-pointer
                         font-space-grotesk"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Menu Rectangle - Hidden on medium and smaller screens */}
        <div className="hidden md:flex w-16 px-2 justify-center items-center border-b border-white lg:border-b-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300
                     transition-colors duration-200"
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

        {/* Mobile Menu Button - Visible only on small screens */}
        <div className="md:hidden flex w-16 justify-center items-center px-2 border-b border-white lg:border-b-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300
                     transition-colors duration-200"
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

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 w-full z-60"
          style={{ backgroundColor: "#3D3D3E" }}
        >
          {items.slice(2).map((item, index) => (
            <a
              key={index}
              href="#"
              className="block px-4 py-3 text-white font-medium text-sm sm:text-base
                       border-b border-white lg:border-b-2 last:border-b-0
                       hover:text-gray-300
                       focus:outline-none focus:text-gray-300
                       transition-colors duration-200 cursor-pointer
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

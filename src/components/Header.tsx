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
      <div className="flex w-full">
        {items.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex-1 px-4 py-4 text-white font-medium text-sm sm:text-base
                     border border-white 
                     hover:bg-gray-600
                     focus:outline-none focus:ring-2 focus:ring-white
                     transition-all duration-200 cursor-pointer
                     text-center font-space-grotesk"
            style={{ backgroundColor: "#3D3D3E" }}
          >
            {item}
          </a>
        ))}
      </div>
    </motion.header>
  );
};

export default Header;

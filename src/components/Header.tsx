import React from "react";

interface HeaderProps {
  items?: string[];
}

const Header: React.FC<HeaderProps> = ({
  items = ["Home", "About", "Projects", "Contact"],
}) => {
  return (
    <header className="w-full">
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
                     text-center"
            style={{ backgroundColor: "#3D3D3E" }}
          >
            {item}
          </a>
        ))}
      </div>
    </header>
  );
};

export default Header;

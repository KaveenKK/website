
import React, { useState } from 'react';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-transparent">
            CoachConnect
          </h1>
        </div>

        <button 
          className={`hamburger z-50 p-2 ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <div className="w-6 mb-1"></div>
          <div className="w-6 mb-1"></div>
          <div className="w-6"></div>
        </button>
      </nav>

      {/* Overlay */}
      <div 
        className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      ></div>

      {/* Menu */}
      <div 
        className={`fixed top-0 right-0 z-40 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } pt-20 px-4`}
      >
        <div className="flex flex-col gap-6">
          <button className="button-primary">User Login</button>
          <button className="button-secondary">Coach Login</button>
        </div>
        
        <div className="mt-10 flex flex-col gap-2">
          <a href="#" className="menu-item">About Us</a>
          <a href="#" className="menu-item">Success Stories</a>
          <a href="#" className="menu-item">FAQ</a>
          <a href="#" className="menu-item">Contact</a>
        </div>
      </div>
    </>
  );
};

export default NavBar;

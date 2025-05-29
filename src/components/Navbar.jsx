import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {


  return (
    <nav className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 shadow-lg">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="https://cdn5.vectorstock.com/i/1000x1000/44/64/ship-green-icon-vector-7544464.jpg"
                alt="Logo"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-white">Green Shipping Compass</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-secondary-200 px-3 py-2 rounded-md text-lg font-medium transition duration-150 ease-in-out hover:bg-white/10">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-secondary-200 px-3 py-2 rounded-md text-lg font-medium transition duration-150 ease-in-out hover:bg-white/10">
              About
            </Link>
            <Link to="/privacy" className="text-white hover:text-secondary-200 px-3 py-2 rounded-md text-lg font-medium transition duration-150 ease-in-out hover:bg-white/10">
              Privacy
            </Link>
            <Link to="/terms" className="text-white hover:text-secondary-200 px-3 py-2 rounded-md text-lg font-medium transition duration-150 ease-in-out hover:bg-white/10">
              Terms
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-secondary-200 hover:bg-white/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <Transition
        show={isOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block text-white hover:text-secondary-200 px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link to="/about" className="block text-white hover:text-secondary-200 px-3 py-2 rounded-md text-base font-medium">
              About
            </Link>
            <Link to="/privacy" className="block text-white hover:text-secondary-200 px-3 py-2 rounded-md text-base font-medium">
              Privacy
            </Link>
            <Link to="/terms" className="block text-white hover:text-secondary-200 px-3 py-2 rounded-md text-base font-medium">
              Terms
            </Link>
          </div>
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;
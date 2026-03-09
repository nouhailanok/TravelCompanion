import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="bg-[#cce6f7] px-4 sm:px-6 py-3 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo/Brand - Hidden for now, can be added later */}
                {/* <Link to="/dashboard" className="text-xl font-bold text-gray-800">TravelApp</Link> */}

                {/* Hamburger Menu Button - Shows on small screens */} 
                <div className="md:hidden">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-800 focus:outline-none"
                    >
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                {/* Navigation Links - Hidden on small screens, visible on medium+ */} 
                <ul className={`hidden md:flex flex-grow justify-start items-center space-x-6 font-semibold uppercase tracking-wide text-sm text-gray-700`}>
                    <li>
                        <Link to="/dashboard" className="hover:text-cyan-600 hover:underline hover:underline-offset-8 transition-all">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/trips" className="hover:text-cyan-600 hover:underline hover:underline-offset-8 transition-all">My Trips</Link>
                    </li>
                    <li>
                        <Link to="/posts" className="hover:text-cyan-600 hover:underline hover:underline-offset-8 transition-all">Community</Link>
                    </li>
                </ul>

                {/* Action Icons - Always visible */} 
                <div className="flex items-center space-x-3">
                    <Link to="/posts/new" title="Create New Post" className="hover:opacity-80 transition-opacity">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-200 hover:bg-cyan-300 text-cyan-800 text-xl font-bold shadow-md transition-all">
                            +
                        </button>
                    </Link>
                    <Link to="/profile" title="Profile" className="hover:opacity-80 transition-opacity">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-md">
                            <span className="sr-only">Profile</span>
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Mobile Menu - Shows when isOpen is true */} 
            {isOpen && (
                <div className="md:hidden mt-3 pt-3 border-t border-gray-300">
                    <ul className="flex flex-col space-y-3 items-center font-semibold uppercase tracking-wide text-sm text-gray-700">
                        <li>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 px-4 hover:bg-cyan-50 rounded-md w-full text-center hover:text-cyan-600 transition-colors">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/trips" onClick={() => setIsOpen(false)} className="block py-2 px-4 hover:bg-cyan-50 rounded-md w-full text-center hover:text-cyan-600 transition-colors">My Trips</Link>
                        </li>
                        <li>
                            <Link to="/posts" onClick={() => setIsOpen(false)} className="block py-2 px-4 hover:bg-cyan-50 rounded-md w-full text-center hover:text-cyan-600 transition-colors">Community</Link>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
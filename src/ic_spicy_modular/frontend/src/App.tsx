import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./index.css";
import Join from "./components/Join";
import AiAlmanac from "./components/AiAlmanac";
import Blog from "./components/Blog";
import Wallet from "./components/Wallet";
import Portal from "./components/Portal";
import Shop from "./components/Shop";
import Game from "./components/Game";
import Membership from "./components/Membership";
import ChiliFacts from "./components/ChiliFacts";
import Profile from "./components/Profile";
import Whitepaper from "./components/Whitepaper";

const flameSVG = (
  <span className="flame" aria-hidden="true">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2C14 2 18 8 14 12C10 16 18 18 14 26C10 18 2 16 8 10C12 6 10 2 14 2Z" fill="#ffb300"/>
      <path d="M14 2C14 2 18 8 14 12C10 16 18 18 14 26" stroke="#ff4500" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </span>
);

const navLinks = [
  { to: "/join", label: "Join Co-op" },
  { to: "/ai", label: "Spicy AI Almanac" },
  { to: "/blog", label: "Community Blog" },
  { to: "/wallet", label: "My Wallet" },
  { to: "/portal", label: "Member Portal" },
  { to: "/shop", label: "Spicy Shop" },
  { to: "/game", label: "Garden Game" },
  { to: "/membership", label: "Upgrade Membership" },
  { to: "/chili-facts", label: "Chili Facts" },
  { to: "/profile", label: "My Profile" },
];

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-spicy-red-50">
        <nav className="bg-spicy-red-500 p-4 text-white shadow-lg">
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center items-center">
            {navLinks.map((link) => (
              <li key={link.to} className="relative">
                <Link to={link.to} className="flaming-link block text-lg font-semibold px-2 py-1">
                  {flameSVG}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-center mt-2 font-bold tracking-wide">Target: $1.12M with 1,440 peppers!</p>
          <div className="text-center mt-4">
            <Link to="/whitepaper" className="flaming-link text-spicy-red-500 hover:underline text-sm sm:text-base font-bold">
              {flameSVG}
              View Updated Whitepaper (June 28, 2025)
            </Link>
          </div>
        </nav>
        <div className="container mx-auto p-4 flex flex-col items-center">
          <div className="spicy-card w-full max-w-2xl">
            <Routes>
              <Route path="/join" element={<Join />} />
              <Route path="/ai" element={<AiAlmanac />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/game" element={<Game />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/chili-facts" element={<ChiliFacts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/whitepaper" element={<Whitepaper />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;

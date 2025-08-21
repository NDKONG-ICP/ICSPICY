import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserPage from "./pages/UserPage";
import AiPage from "./pages/AiPage";
import Wallet2Page from "./pages/WalletPage";
import PortalPage from "./pages/PortalPage";
import GamePage from "./pages/GamePage";
import BlogPage from "./pages/BlogPage";
import ShopPage from "./pages/ShopPage";
import MembershipPage from "./pages/MembershipPage";
import ChiliPage from "./pages/ChiliPage";
import ProfilePage from "./pages/ProfilePage";
import WhitepaperPage from "./pages/WhitepaperPage";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/user", label: "User" },
  { path: "/ai", label: "Spicy AI" },
  { path: "/wallet2", label: "Wallet2" },
  { path: "/portal", label: "Staking Portal" },
  { path: "/game", label: "Gardening Game" },
  { path: "/blog", label: "Blog" },
  { path: "/shop", label: "Shop" },
  { path: "/membership", label: "Membership" },
  { path: "/chili", label: "Chili Facts" },
  { path: "/profile", label: "Profile" },
  { path: "/whitepaper", label: "Whitepaper" },
];

function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-2xl text-spicy-red">
      <span>{label} Page</span>
      <span className="text-base text-spicy-green mt-2">(Coming soon!)</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="flex flex-wrap justify-center gap-2 p-4 bg-spicy-red text-white shadow-md sticky top-0 z-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="px-3 py-1 rounded hover:bg-spicy-green transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Placeholder label="Home" />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/wallet2" element={<Wallet2Page />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/chili" element={<ChiliPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/whitepaper" element={<WhitepaperPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AiPage from './pages/AiPage';
import WalletPage from './pages/WalletPage';
import PortalPage from './pages/PortalPage';
import GamePage from './pages/GamePage';
import BlogPage from './pages/BlogPage';
import ShopPage from './pages/ShopPage';
import WhitepaperPage from './pages/WhitepaperPage';
import CoopPage from './pages/CoopPage';
import { WalletProvider } from "./WalletContext";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/wallet2" element={<WalletPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/whitepaper" element={<WhitepaperPage />} />
            <Route path="/coop" element={<CoopPage />} />
          </Routes>
        </Layout>
      </Router>
    </WalletProvider>
  );
}

export default App;

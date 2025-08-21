import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import FloatingElements from './FloatingElements';
import { useWallet } from '../WalletContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { principal, plugConnected, connectPlug, disconnectPlug, iiLoggedIn, iiPrincipal, loginII, logoutII } = useWallet();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠', description: 'Co-op Overview' },
    { path: '/coop', label: 'Co-op', icon: '🤝', description: 'Membership Tiers' },
    { path: '/ai', label: 'Spicy AI', icon: '🤖', description: 'Farming Assistant' },
    { path: '/wallet2', label: 'Wallet', icon: '💰', description: 'Chain Fusion' },
    { path: '/portal', label: 'Staking & SNS', icon: '🏦', description: 'Governance' },
    { path: '/shop', label: 'NFT Market', icon: '🛍️', description: '2,500 NFTs' },
    { path: '/blog', label: 'Community', icon: '📝', description: 'Share & Tip' },
    { path: '/game', label: 'Gardening', icon: '🌱', description: 'NFT Rewards' },
    { path: '/whitepaper', label: 'Whitepaper', icon: '📄', description: 'Documentation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Interactive Background - only on non-dashboard pages */}
      {location.pathname !== '/' && <ParticleBackground />}
      {location.pathname !== '/' && <FloatingElements />}

      {/* Internet Identity Login/Logout at very top */}
      <div className="w-full flex justify-end items-center px-4 py-2 bg-black/80 z-50 sticky top-0 left-0" style={{position:'sticky',top:0}}>
        {!iiLoggedIn ? (
          <button
            onClick={loginII}
            className="text-blue-400 hover:text-blue-600 font-semibold underline text-sm transition cursor-pointer"
            style={{background:'none',border:'none',padding:0,margin:0}}
          >
            Sign in with Internet Identity
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-xs">{iiPrincipal.slice(0,8)}...{iiPrincipal.slice(-4)}</span>
            <button
              onClick={logoutII}
              className="text-red-400 hover:text-red-600 font-semibold underline text-sm transition cursor-pointer ml-2"
              style={{background:'none',border:'none',padding:0,margin:0}}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-all duration-300 group">
              <div className="relative">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300 animate-pulse">🌶️</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  IC SPICY RWA Co-op
                </h1>
                <p className="text-xs text-gray-400">Empowering 5,000 Farmers</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Live</span>
                </div>
                <div className="text-gray-400">
                  <span className="font-medium">2,500</span> Pepper Plants
                </div>
                <div className="text-gray-400">
                  <span className="font-medium">5,000</span> Members
                </div>
              </div>
              {/* Plug Wallet Connect Button */}
              {iiLoggedIn ? (
                <button
                  onClick={logoutII}
                  className="bg-gray-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-gray-900 transition"
                >
                  Logout (II)
                </button>
              ) : plugConnected ? (
                <button
                  onClick={disconnectPlug}
                  className="bg-gray-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-gray-900 transition"
                >
                  Logout (Plug)
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-40 bg-black/60 backdrop-blur-2xl border-b-4 border-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-2xl drop-shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-3 overflow-x-auto py-5 scrollbar-hide min-h-[72px]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-2xl text-base font-bold whitespace-nowrap transition-all duration-300 relative overflow-hidden group min-w-[100px] shadow-md ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 text-yellow-200 border-2 border-yellow-400/60 shadow-xl nav-active-glow'
                    : 'text-gray-200 hover:text-yellow-200 hover:bg-white/10 hover:border hover:border-yellow-400/30'
                }`}
              >
                <span className="text-2xl relative z-10">{item.icon}</span>
                <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
                <span className="relative z-10 text-xs opacity-70">{item.description}</span>
                {location.pathname === item.path && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full animate-nav-underline" />
                )}
              </Link>
            ))}
          </div>
        </div>
        <style>{`
          .nav-active-glow {
            box-shadow: 0 0 16px 2px #ffd70055, 0 2px 24px 0 #ff980055;
          }
          @keyframes nav-underline {
            0% { opacity: 0.7; transform: scaleX(0.8); }
            50% { opacity: 1; transform: scaleX(1.1); }
            100% { opacity: 0.7; transform: scaleX(0.8); }
          }
          .animate-nav-underline {
            animation: nav-underline 2s infinite;
          }
        `}</style>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative bg-black/20 backdrop-blur-xl border-t border-white/10 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">IC</span>
                </div>
                <span className="text-gray-400 text-sm">
                  Built on <span className="text-orange-400 font-medium">Internet Computer</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>🌶️</span>
                <span className="font-medium">RWA Co-op</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <span>v2.1</span>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-green-400 font-medium">Decentralized</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              © 2024 IC SPICY RWA Co-op. Empowering specialty agriculture through decentralized ownership, AI innovation, and SNS governance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 
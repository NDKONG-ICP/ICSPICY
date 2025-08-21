import React, { useState, useEffect } from 'react';
import ModuleCard from '../components/ModuleCard';
import { useWallet } from '../WalletContext';

const HERO_IMAGE = process.env.PUBLIC_URL + '/banner.jpg';
const BACKGROUND_IMAGE = process.env.PUBLIC_URL + '/landing background.jpg';
const WEATHER_IMAGE = process.env.PUBLIC_URL + '/weather.jpg';

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    pepperPlants: 0,
    membershipNfts: 0,
    annualPods: 0,
    revenue: 0
  });
  const [showWeather, setShowWeather] = useState(false);
  const { iiLoggedIn, iiPrincipal, loginII, logoutII, plugConnected, connectPlug, principal, preferredPrincipal } = useWallet();

  useEffect(() => {
    setIsVisible(true);
    
    // Animate stats
    const animateStats = () => {
      const targetStats = { pepperPlants: 2500, membershipNfts: 5000, annualPods: 192000, revenue: 1210000 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          pepperPlants: Math.floor(targetStats.pepperPlants * progress),
          membershipNfts: Math.floor(targetStats.membershipNfts * progress),
          annualPods: Math.floor(targetStats.annualPods * progress),
          revenue: Math.floor(targetStats.revenue * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
    };
    
    setTimeout(animateStats, 500);
  }, []);

  const modules = [
    {
      id: 'ai',
      title: 'Spicy AI',
      description: 'AI-powered farming assistance with SOPs and climate data',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500',
      path: '/ai',
      features: ['pH Monitoring', 'Climate Data', 'Disease Prevention']
    },
    {
      id: 'wallet2',
      title: 'Chain Fusion Wallet',
      description: 'Internet Identity (II) sign-in for SPICY/HEAT/ICP transactions',
      icon: '💰',
      color: 'from-green-500 to-emerald-500',
      path: '/wallet2',
      features: ['II Authentication', 'Multi-Token Support', 'Secure Transactions']
    },
    {
      id: 'portal',
      title: 'Staking & SNS Governance',
      description: 'Stake tokens and participate in decentralized governance',
      icon: '🏦',
      color: 'from-blue-500 to-cyan-500',
      path: '/portal',
      features: ['12.5% APY', 'Neuron Voting', 'Community Decisions']
    },
    {
      id: 'shop',
      title: 'NFT Marketplace',
      description: '2,500 variety-specific NFTs, redeemable for shaker spices',
      icon: '🛍️',
      color: 'from-orange-500 to-red-500',
      path: '/shop',
      features: ['Variety NFTs', 'Spice Redemption', 'Staking Rewards']
    },
    {
      id: 'blog',
      title: 'Community Blog',
      description: 'Share gardening posts and tip with SPICY/HEAT tokens',
      icon: '📝',
      color: 'from-indigo-500 to-blue-500',
      path: '/blog',
      features: ['Content Sharing', 'Token Tipping', 'Community Building']
    },
    {
      id: 'game',
      title: 'Gardening Game',
      description: 'Interactive blockchain-based gardening with NFT rewards',
      icon: '🌱',
      color: 'from-emerald-500 to-teal-500',
      path: '/game',
      features: ['Plant Growing', 'NFT Rewards', 'Achievement System']
    },
    {
      id: 'whitepaper',
      title: 'Whitepaper',
      description: 'Technical documentation and project roadmap',
      icon: '📄',
      color: 'from-slate-500 to-gray-500',
      path: '/whitepaper',
      features: ['Technical Specs', 'Roadmap', 'Tokenomics']
    }
  ];

  return (
    <div className={`relative space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {/* Subtle Background Image */}
      <img
        src="/landing background.jpg"
        alt="Dashboard Background"
        className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none select-none blur-sm opacity-60"
        style={{ filter: 'brightness(0.7) grayscale(0.1)' }}
      />

      {/* Main Dashboard Content */}
      <div className="relative z-10 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-orange-500/20">
          <img
            src={HERO_IMAGE}
            alt="IC SPICY Hero Banner"
            className="w-full h-40 sm:h-64 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              IC SPICY RWA Co-op
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-orange-200 mb-6 max-w-3xl">
              Empowering 5,000 farmers with decentralized ownership, AI innovation, and SNS governance
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-white">
                🌶️ 2,500 Pepper Plants
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-white">
                👥 5,000 Members
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-white">
                🤖 Spicy AI Assistant
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🌶️</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.pepperPlants.toLocaleString()}</div>
              <div className="text-orange-200 font-medium">Pepper Plants</div>
              <div className="text-sm text-orange-300 mt-2">Premium Varieties</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.membershipNfts.toLocaleString()}</div>
              <div className="text-green-200 font-medium">Membership NFTs</div>
              <div className="text-sm text-green-300 mt-2">With Hydroponic Kits</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-3xl font-bold text-white mb-2">{stats.annualPods.toLocaleString()}</div>
              <div className="text-blue-200 font-medium">Annual Pods</div>
              <div className="text-sm text-blue-300 mt-2">Premium Varieties</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold text-white mb-2">${(stats.revenue / 1000000).toFixed(2)}M</div>
              <div className="text-purple-200 font-medium">Year 1 Revenue</div>
              <div className="text-sm text-purple-300 mt-2">Target: $7M by Year 3</div>
            </div>
          </div>
        </div>

        {/* Co-op Overview */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">🌾 Agricultural Cooperative</h2>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto">
              The IC SPICY RWA Co-op revolutionizes specialty agriculture by tokenizing premium assets and empowering farmers with innovative tools. 
              Our cooperative manages real-world agricultural assets while providing members with AI assistance and community governance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🏭</div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-World Assets</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 2,500 Premium Pepper Plants</li>
                <li>• 1,500 Gourmet Salt Blends</li>
                <li>• 100 Plumeria Seedlings</li>
                <li>• 5,000 Hydroponic Kits</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-3">Spicy AI Innovation</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Farming SOPs & Guidelines</li>
                <li>• Location-based Climate Data</li>
                <li>• Disease Prevention Systems</li>
                <li>• Personalized Growing Advice</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-white mb-3">SNS Governance</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Decentralized Decision Making</li>
                <li>• Neuron Voting System</li>
                <li>• Community Proposals</li>
                <li>• Transparent Governance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">🚀 Platform Modules</h2>
            <p className="text-gray-300 text-lg">Explore the comprehensive ecosystem designed for agricultural innovation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const isAi = module.id === 'ai';
              return (
                <div 
                  key={module.id} 
                  className={`transition-all duration-500 hover:scale-105 relative overflow-hidden`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: isVisible ? 'translateY(0) opacity(1)' : 'translateY(50px) opacity(0)'
                  }}
                  onMouseEnter={isAi ? () => setShowWeather(true) : undefined}
                  onMouseLeave={isAi ? () => setShowWeather(false) : undefined}
                >
                  {/* Weather image as subtle card background for Spicy AI */}
                  {isAi && (
                    <>
                      <img
                        src={WEATHER_IMAGE}
                        alt="Weather Preview"
                        className={`absolute inset-0 w-full h-full object-cover rounded-2xl pointer-events-none transition-opacity duration-500 ${showWeather ? 'opacity-100' : 'opacity-0'}`}
                        style={{zIndex: 1}}
                      />
                      {/* Dark overlay for readability */}
                      <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ${showWeather ? 'opacity-100' : 'opacity-0'}`}
                        style={{background: 'rgba(0,0,0,0.1)', zIndex: 2}} />
                    </>
                  )}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full relative" style={{zIndex: 3}}>
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">{module.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{module.description}</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => window.location.href = module.path}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Explore {module.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Join the Revolution?</h3>
          <p className="text-orange-200 mb-6 max-w-2xl mx-auto">
            Become part of the future of agriculture. Connect your wallet and start exploring the IC SPICY RWA Co-op ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
              🔗 Connect Wallet
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20">
              📚 Read Whitepaper
            </button>
          </div>
        </div>

        {/* Internet Identity Login Section */}
        <div className="w-full flex flex-col items-center mb-8">
          {!iiLoggedIn ? (
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-8 py-3 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg text-lg mb-2"
              onClick={loginII}
            >
              Sign in with Internet Identity
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="text-green-400 font-mono text-sm">II Principal: {iiPrincipal}</div>
              <button
                className="bg-gray-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                onClick={logoutII}
              >
                Sign Out
              </button>
            </div>
          )}
          {/* Optionally show Plug connect if II not logged in */}
          {!iiLoggedIn && !plugConnected && (
            <button
              className="mt-4 bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg shadow hover:bg-yellow-500 transition"
              onClick={connectPlug}
            >
              Connect Plug Wallet
            </button>
          )}
          {plugConnected && !iiLoggedIn && (
            <div className="text-green-400 font-mono text-sm mt-2">Plug Principal: {principal}</div>
          )}
        </div>
      </div>

      {/* Under Construction Notice at Bottom */}
      <div className="glass-card-dark max-w-2xl mx-auto mt-12 flex items-center gap-4 p-6 border-2 border-yellow-400/30 rounded-2xl shadow-xl">
        <span className="text-4xl">🚧</span>
        <div>
          <h2 className="text-xl font-bold text-yellow-100 mb-1">Backend Features Under Construction</h2>
          <p className="text-yellow-200 text-sm">Some interactive and blockchain-powered features are coming soon. The luxury frontend is live—check back for full functionality!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useMemo, useCallback } from 'react';
import "@nfid/identitykit/react/styles.css";
import { ConnectWallet, useIdentityKit } from "@nfid/identitykit/react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { ADMIN_PRINCIPALS } from '../config';

// Memoized navigation items for performance
const getNavItems = (isAdmin) => [
  { id: 'dashboard', label: 'Home', icon: '🏠', external: false, url: '/', public: true },
  { id: 'ai', label: 'AI', icon: '🤖', external: false, url: '/ai', public: true },
  { id: 'wallet', label: 'Wallet', icon: '💎', external: false, url: '/wallet2', public: true },
  { id: 'shop', label: 'Shop', icon: '🛍️', external: false, url: '/shop', public: true },
  { id: 'membership', label: 'Membership', icon: '🎟️', external: false, url: '/membership', public: true },
  { id: 'portal', label: 'Portal', icon: '🌀', external: false, url: '/portal', public: true },
  { id: 'blog', label: 'Blog', icon: '📝', external: false, url: '/blog', public: true },
  { id: 'game', label: 'Game', icon: '🎮', external: false, url: '/game', public: true },
  { id: 'user', label: 'Profile', icon: '👤', external: false, url: '/user', public: false },
  ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚡', external: false, url: '/admin', public: false }] : [])
];

const GlobalNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginII, iiLoggedIn, principal: walletContextPrincipal, setExternalPrincipal, connectPlug, plugConnected } = useWallet();
  const { user, signer } = useIdentityKit();
  
  // Memoized effective principal for performance
  const effectivePrincipal = useMemo(() => {
    return user?.principal?.toText() || walletContextPrincipal;
  }, [user?.principal, walletContextPrincipal]);

  // Memoized admin check for performance
  const isAdmin = useMemo(() => {
    return effectivePrincipal && Object.values(ADMIN_PRINCIPALS).includes(effectivePrincipal);
  }, [effectivePrincipal]);

  // Memoized navigation items
  const navItems = useMemo(() => getNavItems(isAdmin), [isAdmin]);

  // Memoized connection status
  const isConnected = useMemo(() => {
    return !!(user?.principal || iiLoggedIn || plugConnected);
  }, [user?.principal, iiLoggedIn, plugConnected]);

  const [copied, setCopied] = React.useState(false);

  // Optimized click handler with useCallback
  const handleClick = useCallback((item) => {
    if (item.external) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.url);
    }
  }, [navigate]);

  // Optimized copy handler with useCallback
  const handleCopy = useCallback(async () => {
    if (!effectivePrincipal) return;
    try {
      await navigator.clipboard.writeText(effectivePrincipal);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }, [effectivePrincipal]);

  // Memoized wallet type for performance
  const walletType = useMemo(() => {
    if (!user?.principal) {
      if (iiLoggedIn) return 'Internet Identity';
      if (plugConnected) return 'Plug Wallet';
      return null;
    }
    
    // Check the signer type or use principal to determine wallet
    if (signer?.signerType === 'OISY' || signer?.name?.includes('OISY') || signer?.id === 'OISY') return 'OISY';
    if (signer?.signerType === 'NFIDW' || signer?.name?.includes('NFID') || signer?.id === 'NFIDW') return 'NFID';
    if (signer?.signerType === 'InternetIdentity' || signer?.name?.includes('Internet Identity') || signer?.id === 'InternetIdentity') return 'Internet Identity';
    if (signer?.signerType === 'Plug' || signer?.name?.includes('Plug') || signer?.id === 'Plug') return 'Plug';
    
    // Fallback: use principal to guess wallet type (for known admin principals)
    const principal = user.principal.toText();
    if (principal === 'yyirv-5pjkg-oupac-gzja4-ljzfn-6mvon-r5w2i-6e7wm-sde75-wuses-nqe') return 'OISY';
    if (principal === '2trnz-yo65l-waa2z-alhn3-ip5ob-eweh7-c464w-utzem-fmwrr-ih7ma-hqe') return 'NFID';
    if (principal === 'hd54c-crxgi-574kw-thrtf-yw4xx-xs3hl-t44h3-viz6c-qlb5u-3wnbt-nqe') return 'NFID';
    if (principal === 'lgd5r-y4x7q-lbrfa-mabgw-xurgu-4h3at-sw4sl-yyr3k-5kwgt-vlkao-jae') return 'Internet Identity';
    
    return 'Wallet';
  }, [user?.principal, signer, iiLoggedIn, plugConnected]);

  // Filter navigation items based on connection status
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => item.public || isConnected);
  }, [navItems, isConnected]);

  return (
    <nav className="fixed top-0 left-0 right-0 backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 10000 }}>
      <div className="h-16 flex items-center justify-between px-3">
        <motion.div className="flex items-center gap-2 cursor-pointer" onClick={() => handleClick(navItems[0])} whileHover={{ scale: 1.05 }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#ec4899)' }}>
            <span className="text-white font-bold">SP</span>
          </div>
          <span className="hidden sm:block font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#f59e0b,#ec4899)' }}>IC SPICY</span>
        </motion.div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {filteredNavItems.map((item) => (
            <motion.button 
              key={item.id} 
              onClick={() => handleClick(item)} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                location.pathname === item.url 
                  ? 'text-white bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              } ${isAdmin && item.id === 'admin' ? 'animate-pulse-glow' : ''}`}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ConnectWallet />
          
          {/* Traditional wallet options */}
          {!isConnected && (
            <>
              <button 
                onClick={loginII} 
                className="px-3 py-2 rounded-lg text-xs bg-blue-600/20 text-blue-200 hover:bg-blue-600/30 border border-blue-500/30 transition-all"
              >
                Internet Identity
              </button>
              <button 
                onClick={connectPlug} 
                className="px-3 py-2 rounded-lg text-xs bg-purple-600/20 text-purple-200 hover:bg-purple-600/30 border border-purple-500/30 transition-all"
              >
                Plug Wallet
              </button>
            </>
          )}
          
          {/* Connection status indicators */}
          {walletType && (
            <span className={`px-2 py-1 text-[10px] rounded transition-all ${
              isAdmin 
                ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-200 border border-amber-500/30' 
                : 'bg-emerald-600/20 text-emerald-200'
            }`}>
              {isAdmin ? '⚡ Admin' : `${walletType} Connected`}
            </span>
          )}
          
          {/* Principal display with copy functionality */}
          {effectivePrincipal && (
            <button 
              onClick={handleCopy} 
              className="px-3 py-2 rounded-lg text-xs bg-white/10 text-gray-100 hover:bg-white/20 font-mono transition-all"
              title="Click to copy principal"
            >
              <span className="hidden md:inline">
                {effectivePrincipal.length > 20 
                  ? `${effectivePrincipal.slice(0, 8)}...${effectivePrincipal.slice(-8)}` 
                  : effectivePrincipal
                }
              </span>
              <span className="md:hidden">
                {effectivePrincipal.slice(0, 6)}...
              </span>
              <span className="ml-2 text-[10px] text-emerald-300">
                {copied ? '✓' : '📋'}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNav;

import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { idlFactory as chili_idlFactory } from '../declarations/chili';
import { CANISTER_IDS } from '../config';

const ChiliPage = () => {
  const { principal, plugConnected, connectPlug } = useWallet();
  const [chiliNFTs, setChiliNFTs] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [actor, setActor] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [mintForm, setMintForm] = useState({
    name: '',
    variety: 'Jalapeño',
    heatLevel: 5,
    rarity: 'common',
    description: ''
  });

  const chiliVarieties = [
    { name: 'Jalapeño', emoji: '🫑', heatLevel: 5, rarity: 'common' },
    { name: 'Habanero', emoji: '🔥', heatLevel: 8, rarity: 'rare' },
    { name: 'Ghost Pepper', emoji: '👻', heatLevel: 10, rarity: 'epic' },
    { name: 'Carolina Reaper', emoji: '💀', heatLevel: 10, rarity: 'legendary' },
    { name: 'Bell Pepper', emoji: '🫑', heatLevel: 1, rarity: 'common' },
    { name: 'Serrano', emoji: '🌶️', heatLevel: 6, rarity: 'uncommon' },
  ];

  useEffect(() => {
    if (plugConnected && principal) {
      (async () => {
        try {
          const a = await window.ic.plug.createActor({ canisterId: CANISTER_IDS.chili, interfaceFactory: chili_idlFactory });
          setActor(a);
          
          // Fetch all chili NFTs
          const allNFTs = await a.getAllChiliNFTs();
          setChiliNFTs(allNFTs);
          
          // Fetch user's NFTs
          const userNFTs = await a.getUserChiliNFTs(principal);
          setMyNFTs(userNFTs);
        } catch (error) {
          console.error('Error fetching chili NFTs:', error);
        }
      })();
    }
  }, [plugConnected, principal]);

  const handleMintNFT = async (e) => {
    e.preventDefault();
    if (!actor || !principal) return;
    
    setMinting(true);
    try {
      const success = await actor.mintChiliNFT(
        principal,
        mintForm.name,
        mintForm.variety,
        mintForm.heatLevel,
        mintForm.rarity,
        mintForm.description
      );
      
      if (success) {
        // Refresh NFTs
        const allNFTs = await actor.getAllChiliNFTs();
        const userNFTs = await actor.getUserChiliNFTs(principal);
        setChiliNFTs(allNFTs);
        setMyNFTs(userNFTs);
        
        // Reset form
        setMintForm({
          name: '',
          variety: 'Jalapeño',
          heatLevel: 5,
          rarity: 'common',
          description: ''
        });
        
        alert('Chili NFT minted successfully!');
      } else {
        alert('Failed to mint NFT');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error minting NFT');
    }
    setMinting(false);
  };

  const handleTransferNFT = async (nftId, toPrincipal) => {
    if (!actor || !principal) return;
    
    setLoading(true);
    try {
      const success = await actor.transferChiliNFT(principal, toPrincipal, nftId);
      if (success) {
        // Refresh NFTs
        const allNFTs = await actor.getAllChiliNFTs();
        const userNFTs = await actor.getUserChiliNFTs(principal);
        setChiliNFTs(allNFTs);
        setMyNFTs(userNFTs);
        alert('NFT transferred successfully!');
      } else {
        alert('Failed to transfer NFT');
      }
    } catch (error) {
      console.error('Error transferring NFT:', error);
      alert('Error transferring NFT');
    }
    setLoading(false);
  };

  const handleBurnNFT = async (nftId) => {
    if (!actor || !principal) return;
    
    if (!confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const success = await actor.burnChiliNFT(principal, nftId);
      if (success) {
        // Refresh NFTs
        const allNFTs = await actor.getAllChiliNFTs();
        const userNFTs = await actor.getUserChiliNFTs(principal);
        setChiliNFTs(allNFTs);
        setMyNFTs(userNFTs);
        alert('NFT burned successfully!');
      } else {
        alert('Failed to burn NFT');
      }
    } catch (error) {
      console.error('Error burning NFT:', error);
      alert('Error burning NFT');
    }
    setLoading(false);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400';
      case 'epic': return 'text-pink-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getHeatLevelColor = (heatLevel) => {
    if (heatLevel >= 9) return 'text-red-500';
    if (heatLevel >= 7) return 'text-orange-500';
    if (heatLevel >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!plugConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your Plug wallet to access Chili NFTs!</h2>
        <button
          onClick={connectPlug}
          className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition"
        >
          Connect Plug Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center overflow-x-hidden space-y-8">
      {/* Luxury Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="w-full h-full bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 opacity-70" />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>

      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem'}}>
        <div className="text-6xl mb-4">🌶️</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-100 mb-4 tracking-tight">Chili NFT Marketplace</h1>
        <p className="text-xl text-gray-100">Mint, trade, and collect unique chili pepper NFTs on the Internet Computer</p>
      </div>

      {/* Mint NFT Form */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Mint Your Chili NFT</h2>
        <form onSubmit={handleMintNFT} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Chili Name"
              value={mintForm.name}
              onChange={e => setMintForm({...mintForm, name: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
              required
            />
            <select
              value={mintForm.variety}
              onChange={e => setMintForm({...mintForm, variety: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white"
            >
              {chiliVarieties.map(variety => (
                <option key={variety.name} value={variety.name}>
                  {variety.emoji} {variety.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-yellow-100 mb-2">Heat Level: {mintForm.heatLevel}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={mintForm.heatLevel}
                onChange={e => setMintForm({...mintForm, heatLevel: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>
            <select
              value={mintForm.rarity}
              onChange={e => setMintForm({...mintForm, rarity: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white"
            >
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={mintForm.description}
            onChange={e => setMintForm({...mintForm, description: e.target.value})}
            className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400 h-24"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-orange-600 transition"
            disabled={minting}
          >
            {minting ? 'Minting...' : '🌶️ Mint Chili NFT'}
          </button>
        </form>
      </div>

      {/* My NFTs */}
      <div className="glass-card-dark w-full max-w-6xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">My Chili NFTs ({myNFTs.length})</h2>
        {myNFTs.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <div className="text-4xl mb-2">🌱</div>
            <p>No chili NFTs yet. Mint your first one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNFTs.map((nft) => (
              <div key={nft.id} className="glass-card-dark border border-yellow-200/20 rounded-lg p-4 hover:border-yellow-200/40 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-2">{nft.emoji || '🌶️'}</div>
                  <h3 className="font-bold text-yellow-100 mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{nft.variety}</p>
                  <div className="flex justify-center gap-2 mb-3">
                    <span className={`text-sm font-bold ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity.toUpperCase()}
                    </span>
                    <span className={`text-sm font-bold ${getHeatLevelColor(nft.heatLevel)}`}>
                      🔥 {nft.heatLevel}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{nft.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    ID: {nft.id.toString().substring(0, 8)}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBurnNFT(nft.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition"
                      disabled={loading}
                    >
                      {loading ? 'Burning...' : '🔥 Burn'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All NFTs Marketplace */}
      <div className="glass-card-dark w-full max-w-6xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Chili NFT Marketplace ({chiliNFTs.length} total)</h2>
        {chiliNFTs.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <div className="text-4xl mb-2">🌶️</div>
            <p>No chili NFTs in the marketplace yet. Be the first to mint!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chiliNFTs.map((nft) => (
              <div key={nft.id} className="glass-card-dark border border-yellow-200/20 rounded-lg p-4 hover:border-yellow-200/40 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-2">{nft.emoji || '🌶️'}</div>
                  <h3 className="font-bold text-yellow-100 mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{nft.variety}</p>
                  <div className="flex justify-center gap-2 mb-3">
                    <span className={`text-sm font-bold ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity.toUpperCase()}
                    </span>
                    <span className={`text-sm font-bold ${getHeatLevelColor(nft.heatLevel)}`}>
                      🔥 {nft.heatLevel}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{nft.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    Owner: {nft.owner.substring(0, 8)}...
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    ID: {nft.id.toString().substring(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chili Info */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">🌶️ Chili NFT Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Unique Properties</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Customizable heat levels (1-10)</li>
              <li>Multiple rarity tiers</li>
              <li>Unique names and descriptions</li>
              <li>Verifiable ownership on IC</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Trading & Utility</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Transfer between users</li>
              <li>Burn for rewards</li>
              <li>Stake for passive income</li>
              <li>Use in games and DAOs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom glassmorphic dark card style */}
      <style>{`
        .glass-card-dark {
          background: rgba(20, 20, 30, 0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
};

export default ChiliPage; 
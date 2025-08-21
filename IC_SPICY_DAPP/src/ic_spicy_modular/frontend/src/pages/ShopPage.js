import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { idlFactory as shop_idlFactory } from '../declarations/shop';
import { idlFactory as wallet_idlFactory } from '../declarations/wallet';
import { CANISTER_IDS } from '../config';

const ShopPage = () => {
  const { principal, plugConnected, connectPlug } = useWallet();
  const [products, setProducts] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [shopActor, setShopActor] = useState(null);
  const [walletActor, setWalletActor] = useState(null);
  const [spicyBalance, setSpicyBalance] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const defaultProducts = [
    { id: 1, name: 'MOA Scotch Bonnet NFT', price: 45, icon: '🌶️', stock: 25, description: 'Variety-specific NFT, redeemable for shaker spices, stakeable for HEAT tokens.', rarity: 'rare' },
    { id: 2, name: 'Carolina Reaper NFT', price: 55, icon: '🔥', stock: 15, description: 'Premium variety NFT with exclusive staking rewards and spice redemption.', rarity: 'epic' },
    { id: 3, name: 'Gourmet Salt Blend NFT', price: 35, icon: '🧂', stock: 30, description: 'Smoked salt blend NFT, redeemable for premium seasoning products.', rarity: 'uncommon' },
    { id: 4, name: 'Plumeria Seedling NFT', price: 25, icon: '🌸', stock: 20, description: 'Ornamental seedling NFT with growth tracking and community features.', rarity: 'common' },
    { id: 5, name: 'Hydroponic Kit NFT', price: 198, icon: '🪴', stock: 5000, description: '20-plant hydroponic kit for co-op members with AI assistance.', rarity: 'legendary' },
    { id: 6, name: 'SPICY Token Bundle', price: 100, icon: '💰', stock: 500, description: 'SPICY token bundle for staking and governance participation.', rarity: 'rare' },
  ];

  useEffect(() => {
    if (plugConnected && principal) {
      (async () => {
        try {
          const shopA = await window.ic.plug.createActor({ canisterId: CANISTER_IDS.shop, interfaceFactory: shop_idlFactory });
          const walletA = await window.ic.plug.createActor({ canisterId: CANISTER_IDS.wallet, interfaceFactory: wallet_idlFactory });
          setShopActor(shopA);
          setWalletActor(walletA);
          
          // Fetch available products
          const availableProducts = await shopA.getAvailableProducts();
          setProducts(availableProducts.length > 0 ? availableProducts : defaultProducts);
          
          // Fetch user's purchases
          const purchases = await shopA.getUserPurchases(principal);
          setMyPurchases(purchases);
          
          // Fetch user's SPICY balance
          const balance = await walletA.getSpicyBalance(principal);
          setSpicyBalance(Number(balance));
        } catch (error) {
          console.error('Error fetching shop data:', error);
          // Fallback to default products if canister is not available
          setProducts(defaultProducts);
        }
      })();
    }
  }, [plugConnected, principal]);

  const handlePurchase = async (product) => {
    if (!shopActor || !principal) return;
    
    if (spicyBalance < product.price) {
      alert('Insufficient $SPICY balance for this purchase');
      return;
    }
    
    setPurchasing(true);
    try {
      const success = await shopActor.purchaseProduct(principal, product.id, product.price);
      
      if (success) {
        // Refresh data
        const availableProducts = await shopActor.getAvailableProducts();
        setProducts(availableProducts.length > 0 ? availableProducts : defaultProducts);
        
        const purchases = await shopActor.getUserPurchases(principal);
        setMyPurchases(purchases);
        
        const balance = await walletActor.getSpicyBalance(principal);
        setSpicyBalance(Number(balance));
        
        alert(`Successfully purchased ${product.name}!`);
      } else {
        alert('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing product:', error);
      alert('Error processing purchase');
    }
    setPurchasing(false);
  };

  const handleRedeemNFT = async (purchaseId) => {
    if (!shopActor || !principal) return;
    
    setLoading(true);
    try {
      const success = await shopActor.redeemNFT(principal, purchaseId);
      if (success) {
        const purchases = await shopActor.getUserPurchases(principal);
        setMyPurchases(purchases);
        alert('NFT redeemed successfully!');
      } else {
        alert('Redemption failed');
      }
    } catch (error) {
      console.error('Error redeeming NFT:', error);
      alert('Error redeeming NFT');
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

  if (!plugConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your Plug wallet to access the NFT marketplace!</h2>
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
      {/* Background Image and Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img src="/nft.jpg" alt="NFT Market Background" className="w-full h-full object-cover object-center blur-sm opacity-70" />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>
      
      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem'}}>
        <div className="text-6xl mb-4">🛍️</div>
        <h1 className="text-4xl font-extrabold text-yellow-100 mb-4">NFT Marketplace</h1>
        <p className="text-xl text-gray-100">
          2,500 variety-specific NFTs, redeemable for shaker spices, stakeable for HEAT tokens
        </p>
        <div className="mt-4 text-lg text-yellow-200 font-bold">
          Your Balance: {spicyBalance.toLocaleString()} $SPICY
        </div>
      </div>

      {/* Product Grid */}
      <div className="glass-card-dark w-full max-w-6xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Available NFTs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="glass-card-dark flex flex-col items-center p-6 transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-yellow-200/20 rounded-lg">
              <div className="text-5xl mb-3 drop-shadow-lg">{product.icon}</div>
              <h3 className="text-lg font-extrabold text-yellow-100 mb-2 text-center">{product.name}</h3>
              <div className="flex justify-center mb-2">
                <span className={`text-sm font-bold ${getRarityColor(product.rarity)}`}>
                  {product.rarity.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-100 text-sm mb-4 text-center">{product.description}</p>
              <div className="text-xl font-bold text-orange-200 mb-2">{product.price} $SPICY</div>
              <div className="text-xs text-gray-300 mb-4">{product.stock} in stock</div>
              <button 
                onClick={() => handlePurchase(product)}
                disabled={purchasing || spicyBalance < product.price}
                className={`w-full font-bold py-2 px-4 rounded-lg transition-all shadow-lg ${
                  spicyBalance >= product.price && !purchasing
                    ? 'bg-gradient-to-r from-yellow-500 to-pink-500 text-gray-900 hover:from-pink-500 hover:to-yellow-500 hover:text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {purchasing ? 'Processing...' : spicyBalance < product.price ? 'Insufficient Balance' : 'Buy NFT'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Purchases */}
      <div className="glass-card-dark w-full max-w-6xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">My Purchases ({myPurchases.length})</h2>
        {myPurchases.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <div className="text-4xl mb-2">🛒</div>
            <p>No purchases yet. Start shopping to see your NFTs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPurchases.map((purchase) => (
              <div key={purchase.id} className="glass-card-dark border border-yellow-200/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{purchase.icon || '🎁'}</div>
                  <h3 className="font-bold text-yellow-100 mb-1">{purchase.name}</h3>
                  <div className="flex justify-center mb-2">
                    <span className={`text-sm font-bold ${getRarityColor(purchase.rarity)}`}>
                      {purchase.rarity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{purchase.description}</p>
                  <div className="text-sm text-gray-300 mb-3">
                    Purchased: {new Date(Number(purchase.purchaseDate) / 1000000).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    ID: {purchase.id.toString().substring(0, 8)}...
                  </div>
                  <div className="flex gap-2">
                    {!purchase.redeemed && (
                      <button
                        onClick={() => handleRedeemNFT(purchase.id)}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition"
                        disabled={loading}
                      >
                        {loading ? 'Redeeming...' : '🎁 Redeem'}
                      </button>
                    )}
                    {purchase.redeemed && (
                      <span className="text-green-400 text-sm">✓ Redeemed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop Info */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">NFT Marketplace Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">NFT Collection</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>2,500 variety-specific NFTs</li>
              <li>Real pepper plants and assets</li>
              <li>Multiple rarity tiers</li>
              <li>Unique metadata and properties</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Utility & Benefits</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Redeemable for shaker spices</li>
              <li>Stakeable for HEAT tokens</li>
              <li>Community member benefits</li>
              <li>Limited edition exclusives</li>
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

export default ShopPage; 
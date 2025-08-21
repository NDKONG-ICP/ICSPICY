import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '../WalletContext';

const ChiliGrowingGame = () => {
  const { principal, plugConnected, iiLoggedIn, canisters } = useWallet();
  const canvasRef = useRef(null);
  
  // Game state
  const [gameState, setGameState] = useState({
    plants: [],
    spicyBalance: 0,
    heatBalance: 0,
    level: 1,
    experience: 0,
    unlockedSeeds: ['basic'],
    inventory: {
      basic_seeds: 5,
      water: 10,
      fertilizer: 3
    }
  });
  
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Plant types and their properties
  const plantTypes = {
    basic: {
      name: "Bell Pepper",
      icon: "🫑",
      seedCost: 10,
      growTime: 30000, // 30 seconds
      waterNeeded: 3,
      spicyReward: 15,
      heatReward: 5,
      color: "#4ade80"
    },
    jalapeno: {
      name: "Jalapeño",
      icon: "🌶️",
      seedCost: 25,
      growTime: 45000, // 45 seconds
      waterNeeded: 4,
      spicyReward: 35,
      heatReward: 15,
      color: "#22c55e",
      unlockLevel: 3
    },
    habanero: {
      name: "Habanero",
      icon: "🔥",
      seedCost: 50,
      growTime: 60000, // 1 minute
      waterNeeded: 5,
      spicyReward: 75,
      heatReward: 40,
      color: "#f97316",
      unlockLevel: 7
    },
    ghost: {
      name: "Ghost Pepper",
      icon: "👻",
      seedCost: 100,
      growTime: 90000, // 1.5 minutes
      waterNeeded: 6,
      spicyReward: 150,
      heatReward: 100,
      color: "#dc2626",
      unlockLevel: 15
    },
    reaper: {
      name: "Carolina Reaper",
      icon: "💀",
      seedCost: 200,
      growTime: 120000, // 2 minutes
      waterNeeded: 8,
      spicyReward: 300,
      heatReward: 250,
      color: "#7c2d12",
      unlockLevel: 25
    }
  };

  // Growth stages
  const growthStages = [
    { name: 'seed', icon: '🌰', progress: 0 },
    { name: 'sprout', icon: '🌱', progress: 0.2 },
    { name: 'seedling', icon: '🌿', progress: 0.4 },
    { name: 'growing', icon: '🪴', progress: 0.6 },
    { name: 'flowering', icon: '🌺', progress: 0.8 },
    { name: 'ready', icon: '🌶️', progress: 1.0 }
  ];

  // Initialize game canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    
    drawGame();
  }, [gameState]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGame();
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, []);

  // Initialize player and load game state for connected users
  useEffect(() => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (isWalletConnected) {
      initializePlayer();
    }
  }, [plugConnected, iiLoggedIn, principal, canisters.game]);

  // Auto-save game state for connected users (debounced)
  useEffect(() => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (isWalletConnected) {
      const saveTimeout = setTimeout(() => {
        saveGameState();
      }, 2000); // Save after 2 seconds of no changes

      return () => clearTimeout(saveTimeout);
    }
  }, [gameState, plugConnected, iiLoggedIn, principal, canisters.game]);

  const updateGame = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdate;
    
    setGameState(prevState => {
      const newState = { ...prevState };
      let stateChanged = false;

      // Update plant growth
      newState.plants = newState.plants.map(plant => {
        if (plant.stage < 5 && plant.lastWatered && !plant.needsWater) {
          const growthProgress = Math.min(1, (now - plant.plantedAt) / plantTypes[plant.type].growTime);
          const newStage = Math.floor(growthProgress * 5);
          
          if (newStage !== plant.stage) {
            stateChanged = true;
            addNotification(`🌱 Your ${plantTypes[plant.type].name} is growing!`);
          }
          
          return { ...plant, stage: newStage, growthProgress };
        }
        
        // Check if plant needs water
        if (plant.stage < 5 && now - plant.lastWatered > 20000) { // 20 seconds
          return { ...plant, needsWater: true };
        }
        
        return plant;
      });

      return stateChanged ? newState : prevState;
    });

    setLastUpdate(now);
  }, [lastUpdate]);

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid of plant slots
    const slotsPerRow = 6;
    const slotSize = 100;
    const spacing = 20;
    const startX = (canvas.width - (slotsPerRow * slotSize + (slotsPerRow - 1) * spacing)) / 2;
    const startY = 100;
    
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;
      const x = startX + col * (slotSize + spacing);
      const y = startY + row * (slotSize + spacing);
      
      // Draw slot background
      ctx.fillStyle = '#374151';
      ctx.fillRect(x, y, slotSize, slotSize);
      
      // Draw slot border
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, slotSize, slotSize);
      
      // Draw plant if exists
      const plant = gameState.plants.find(p => p.slot === i);
      if (plant) {
        drawPlant(ctx, x, y, slotSize, plant);
      } else {
        // Draw empty slot indicator
        ctx.fillStyle = '#9ca3af';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('➕', x + slotSize/2, y + slotSize/2 + 15);
      }
    }
  };

  const drawPlant = (ctx, x, y, size, plant) => {
    const plantType = plantTypes[plant.type];
    const stage = growthStages[plant.stage];
    
    // Draw soil
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 10, y + size - 20, size - 20, 15);
    
    // Draw plant
    ctx.font = `${30 + plant.stage * 8}px Arial`;
    ctx.textAlign = 'center';
    
    if (plant.needsWater) {
      ctx.fillStyle = '#ef4444'; // Red if needs water
    } else if (plant.stage === 5) {
      ctx.fillStyle = plantType.color; // Full color when ready
    } else {
      ctx.fillStyle = '#22c55e'; // Green while growing
    }
    
    ctx.fillText(stage.icon, x + size/2, y + size/2);
    
    // Draw growth progress bar
    if (plant.stage < 5) {
      const barWidth = size - 20;
      const barHeight = 8;
      const barX = x + 10;
      const barY = y + size - 40;
      
      // Background
      ctx.fillStyle = '#374151';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress
      ctx.fillStyle = plant.needsWater ? '#ef4444' : '#22c55e';
      ctx.fillRect(barX, barY, barWidth * (plant.growthProgress || 0), barHeight);
    }
    
    // Draw water droplet if needs water
    if (plant.needsWater) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('💧', x + size - 20, y + 20);
    }
    
    // Draw ready indicator
    if (plant.stage === 5) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('✨', x + size - 20, y + 20);
    }
  };

  const plantSeed = async (slotIndex, seedType) => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (!isWalletConnected) {
      addNotification("🔗 Connect your wallet to plant seeds!");
      return;
    }

    const plantType = plantTypes[seedType];
    if (gameState.spicyBalance < plantType.seedCost) {
      addNotification("❌ Not enough SPICY tokens!");
      return;
    }

    if (gameState.inventory[`${seedType}_seeds`] <= 0) {
      addNotification("❌ No seeds in inventory!");
      return;
    }

    const existingPlant = gameState.plants.find(p => p.slot === slotIndex);
    if (existingPlant) {
      addNotification("❌ Slot already occupied!");
      return;
    }

    try {
      // Plant seed on blockchain
      const result = await canisters.game.plantGameSeed(
        slotIndex,
        seedType,
        plantType.seedCost
      );

      if (result.includes("successfully")) {
        const newPlant = {
          id: Date.now(),
          slot: slotIndex,
          plantType: seedType,
          stage: 0,
          plantedAt: Date.now(),
          lastWatered: Date.now(),
          needsWater: false,
          growthProgress: 0
        };

        setGameState(prev => ({
          ...prev,
          plants: [...prev.plants, newPlant],
          spicyBalance: prev.spicyBalance - plantType.seedCost,
          inventory: {
            ...prev.inventory,
            [`${seedType}_seeds`]: prev.inventory[`${seedType}_seeds`] - 1
          }
        }));

        addNotification(`🌱 Planted ${plantType.name}!`);
      } else {
        addNotification(`❌ ${result}`);
      }
    } catch (error) {
      console.error('Failed to plant seed:', error);
      addNotification("❌ Failed to plant seed. Try again!");
    }
  };

  const waterPlant = async (plantId) => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (!isWalletConnected) {
      addNotification("🔗 Connect your wallet to water plants!");
      return;
    }

    if (gameState.inventory.water <= 0) {
      addNotification("❌ No water in inventory!");
      return;
    }

    try {
      // Water plant on blockchain
      const result = await canisters.game.waterGamePlant(plantId);

      if (result.includes("successfully")) {
        setGameState(prev => ({
          ...prev,
          plants: prev.plants.map(plant => 
            plant.id === plantId 
              ? { ...plant, lastWatered: Date.now(), needsWater: false }
              : plant
          ),
          inventory: {
            ...prev.inventory,
            water: prev.inventory.water - 1
          }
        }));

        addNotification("💧 Plant watered!");
      } else {
        addNotification(`❌ ${result}`);
      }
    } catch (error) {
      console.error('Failed to water plant:', error);
      addNotification("❌ Failed to water plant. Try again!");
    }
  };

  const harvestPlant = async (plantId) => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (!isWalletConnected) {
      addNotification("🔗 Connect your wallet to harvest!");
      return;
    }

    const plant = gameState.plants.find(p => p.id === plantId);
    if (!plant || plant.stage < 5) {
      addNotification("❌ Plant not ready for harvest!");
      return;
    }

    const plantType = plantTypes[plant.plantType || plant.type];
    const spicyReward = plantType.spicyReward;
    const heatReward = plantType.heatReward;

    try {
      // Harvest plant on blockchain
      const result = await canisters.game.harvestGamePlant(
        plantId,
        spicyReward,
        heatReward
      );

      if (result.includes("harvested")) {
        setGameState(prev => ({
          ...prev,
          plants: prev.plants.filter(p => p.id !== plantId),
          spicyBalance: prev.spicyBalance + spicyReward,
          heatBalance: prev.heatBalance + heatReward,
          experience: prev.experience + Math.floor(spicyReward / 5)
        }));

        addNotification(`🌶️ Harvested ${plantType.name}! +${spicyReward} SPICY, +${heatReward} HEAT`);
        
        // Check for level up
        checkLevelUp();
      } else {
        addNotification(`❌ ${result}`);
      }
    } catch (error) {
      console.error('Failed to harvest plant:', error);
      addNotification("❌ Failed to harvest plant. Try again!");
    }
  };

  const checkLevelUp = () => {
    const newLevel = Math.floor(gameState.experience / 100) + 1;
    if (newLevel > gameState.level) {
      setGameState(prev => ({ ...prev, level: newLevel }));
      addNotification(`🎉 Level up! Now level ${newLevel}!`);
      
      // Unlock new seed types
      Object.entries(plantTypes).forEach(([key, type]) => {
        if (type.unlockLevel === newLevel && !gameState.unlockedSeeds.includes(key)) {
          setGameState(prev => ({
            ...prev,
            unlockedSeeds: [...prev.unlockedSeeds, key]
          }));
          addNotification(`🔓 Unlocked ${type.name} seeds!`);
        }
      });
    }
  };

  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate which slot was clicked
    const slotsPerRow = 6;
    const slotSize = 100;
    const spacing = 20;
    const startX = (canvas.width - (slotsPerRow * slotSize + (slotsPerRow - 1) * spacing)) / 2;
    const startY = 100;
    
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;
      const slotX = startX + col * (slotSize + spacing);
      const slotY = startY + row * (slotSize + spacing);
      
      if (x >= slotX && x <= slotX + slotSize && y >= slotY && y <= slotY + slotSize) {
        handleSlotClick(i);
        break;
      }
    }
  };

  const handleSlotClick = (slotIndex) => {
    const plant = gameState.plants.find(p => p.slot === slotIndex);
    
    if (plant) {
      if (plant.needsWater) {
        waterPlant(plant.id);
      } else if (plant.stage === 5) {
        harvestPlant(plant.id);
      } else {
        setSelectedPlant(plant);
      }
    } else {
      // Empty slot - plant a seed
      if (gameState.unlockedSeeds.length > 0) {
        plantSeed(slotIndex, gameState.unlockedSeeds[0]);
      }
    }
  };

  const initializePlayer = async () => {
    try {
      if (canisters.game) {
        // Try to get existing player data
        const playerData = await canisters.game.getGamePlayerData();
        
        if (playerData && playerData.length > 0) {
          // Load existing player data
          const player = playerData[0];
          setGameState({
            plants: player.plants || [],
            spicyBalance: player.spicyBalance || 100,
            heatBalance: player.heatBalance || 0,
            level: player.level || 1,
            experience: player.experience || 0,
            unlockedSeeds: player.unlockedSeeds || ['basic'],
            inventory: Object.fromEntries(player.inventory || [
              ['basic_seeds', 5],
              ['water', 10],
              ['fertilizer', 3]
            ])
          });
          addNotification("🎮 Game data loaded!");
        } else {
          // Initialize new player
          const initialized = await canisters.game.initializeGamePlayer();
          if (initialized) {
            addNotification("🌟 Welcome to Spicy Garden! Your adventure begins!");
            // Load the newly created player data
            const newPlayerData = await canisters.game.getGamePlayerData();
            if (newPlayerData && newPlayerData.length > 0) {
              const player = newPlayerData[0];
              setGameState({
                plants: [],
                spicyBalance: player.spicyBalance || 100,
                heatBalance: player.heatBalance || 0,
                level: 1,
                experience: 0,
                unlockedSeeds: ['basic'],
                inventory: {
                  basic_seeds: 5,
                  water: 10,
                  fertilizer: 3
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize player:', error);
      addNotification("⚠️ Failed to load game data. Playing in demo mode.");
    }
  };

  const saveGameState = async () => {
    try {
      const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
      if (isWalletConnected) {
        // Convert inventory object to array format for canister
        const inventoryArray = Object.entries(gameState.inventory);
        
        const saved = await canisters.game.saveGamePlayerData(
          gameState.spicyBalance,
          gameState.heatBalance,
          gameState.level,
          gameState.experience,
          gameState.plants,
          inventoryArray
        );
        
        if (!saved) {
          console.warn('Failed to save game state to blockchain');
        }
      }
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  const buyItem = async (item, cost, currency = 'spicy') => {
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    if (!isWalletConnected) {
      addNotification("🔗 Connect your wallet to buy items!");
      return;
    }

    const balance = currency === 'spicy' ? gameState.spicyBalance : gameState.heatBalance;
    
    if (balance < cost) {
      addNotification(`❌ Not enough ${currency.toUpperCase()} tokens!`);
      return;
    }

    try {
      // Buy item on blockchain
      const result = await canisters.game.buyGameItem(item, cost, currency);

      if (result.includes("successfully")) {
        setGameState(prev => ({
          ...prev,
          [currency === 'spicy' ? 'spicyBalance' : 'heatBalance']: balance - cost,
          inventory: {
            ...prev.inventory,
            [item]: (prev.inventory[item] || 0) + 1
          }
        }));

        addNotification(`✅ Bought ${item}!`);
      } else {
        addNotification(`❌ ${result}`);
      }
    } catch (error) {
      console.error('Failed to buy item:', error);
      addNotification("❌ Failed to buy item. Try again!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Game Header */}
      <div className="glass-card-dark p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🌶️ Spicy Garden</h2>
            <p className="text-gray-300">Grow, harvest, and earn in the ultimate pepper farming game!</p>
          </div>
          
          {!(plugConnected || iiLoggedIn) ? (
            <button
              onClick={() => alert('Please connect your wallet from the main navigation to play with full features!')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-all"
            >
              🔗 Connect Wallet to Play
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{gameState.spicyBalance}</div>
                  <div className="text-sm text-gray-400">SPICY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{gameState.heatBalance}</div>
                  <div className="text-sm text-gray-400">HEAT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{gameState.level}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.experience % 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="glass-card-dark p-6 mb-6">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full border border-gray-600 rounded-lg cursor-pointer bg-slate-900"
          style={{ maxWidth: '800px', height: 'auto' }}
        />
        
        {(plugConnected || iiLoggedIn) && (
          <div className="mt-4 text-center text-sm text-gray-400">
            💡 Click empty slots to plant seeds, click plants to water/harvest
          </div>
        )}
      </div>

      {/* Game Controls */}
      {(plugConnected || iiLoggedIn) && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Inventory */}
          <div className="glass-card-dark p-6">
            <h3 className="text-xl font-bold text-white mb-4">📦 Inventory</h3>
            <div className="space-y-3">
              {Object.entries(gameState.inventory).map(([item, count]) => (
                <div key={item} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{item.replace('_', ' ')}</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="glass-card-dark p-6">
            <h3 className="text-xl font-bold text-white mb-4">🛒 Shop</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Water (💧)</span>
                <button
                  onClick={() => buyItem('water', 5)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                >
                  5 SPICY
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Fertilizer (💚)</span>
                <button
                  onClick={() => buyItem('fertilizer', 15)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                >
                  15 SPICY
                </button>
              </div>
              {gameState.unlockedSeeds.map(seedType => (
                <div key={seedType} className="flex justify-between items-center">
                  <span className="text-gray-300">{plantTypes[seedType].name} Seeds</span>
                  <button
                    onClick={() => buyItem(`${seedType}_seeds`, plantTypes[seedType].seedCost)}
                    className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-all"
                  >
                    {plantTypes[seedType].seedCost} SPICY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="glass-card-dark p-3 border border-amber-500/30 bg-amber-500/10 text-white rounded-lg animate-slide-in-right"
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Game Rules */}
      <div className="glass-card-dark p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎮 How to Play</h3>
        <div className="grid md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">Basic Gameplay:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Click empty slots to plant seeds</li>
              <li>• Water plants when they need it (💧)</li>
              <li>• Harvest ready plants (✨)</li>
              <li>• Earn SPICY and HEAT tokens</li>
              <li>• Level up to unlock new peppers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Strategy Tips:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Higher level peppers = bigger rewards</li>
              <li>• Keep plants watered for optimal growth</li>
              <li>• Reinvest earnings in better seeds</li>
              <li>• Manage your inventory wisely</li>
              <li>• Plan your garden layout efficiently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiliGrowingGame;

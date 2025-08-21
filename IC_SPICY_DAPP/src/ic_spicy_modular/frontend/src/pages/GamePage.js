import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { idlFactory as game_idlFactory } from '../declarations/game';
import { validateForm, rateLimiter, auditLog, handleError, validateInput } from '../utils/security';
import { CANISTER_IDS, ADMIN_PRINCIPALS } from '../config';
import ChiliGrowingGame from '../components/ChiliGrowingGame';

const GamePage = () => {
  const { principal, plugConnected, iiLoggedIn, canisters } = useWallet();
  const [gameState, setGameState] = useState({
    level: 1,
    experience: 0,
    coins: 0,
    plants: []
  });
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [spicyBalance, setSpicyBalance] = useState(0);
  const [heatBalance, setHeatBalance] = useState(0);
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [demoMode, setDemoMode] = useState(true);

  // Demo data for non-connected users
  const demoLeaderboard = [
    { name: "SpicyMaster", level: 42, coins: 15420, plants: 28 },
    { name: "PepperKing", level: 38, coins: 12350, plants: 24 },
    { name: "ChiliQueen", level: 35, coins: 11200, plants: 22 },
    { name: "HotSauce", level: 32, coins: 9800, plants: 19 },
    { name: "FireGarden", level: 29, coins: 8500, plants: 17 }
  ];

  const demoAchievements = [
    { title: "First Sprout", description: "Plant your first seed", icon: "🌱", unlocked: true },
    { title: "Green Thumb", description: "Harvest 10 plants", icon: "👍", unlocked: true },
    { title: "Spicy Master", description: "Reach level 25", icon: "🌶️", unlocked: false },
    { title: "Community Builder", description: "Help 5 other growers", icon: "🤝", unlocked: false }
  ];

  // Load data on component mount - accessible to everyone
  useEffect(() => {
    // Check if any wallet is connected (Plug, II, or other)
    const isWalletConnected = (plugConnected || iiLoggedIn) && principal && canisters.game;
    
    if (isWalletConnected) {
      setDemoMode(false);
      (async () => {
        try {
          // Use the canister from WalletContext instead of creating a new actor
          const gameActor = canisters.game;
          setActor(gameActor);
          
          // Fetch player data
          const playerData = await gameActor.getPlayerData(principal);
          if (playerData.length > 0) {
            const player = playerData[0];
            setGameState({
              level: Number(player.level),
              experience: Number(player.experience),
              coins: Number(player.coins),
              plants: player.plants || []
            });
          }
          
          // Fetch balances
          const spicy = await gameActor.getSpicyBalance(principal);
          const heat = await gameActor.getHeatBalance(principal);
          setSpicyBalance(Number(spicy));
          setHeatBalance(Number(heat));
          
          // Fetch leaderboard
          const leaderboardData = await gameActor.getLeaderboard();
          setLeaderboard(leaderboardData);
          
          // Fetch achievements
          const achievementsData = await gameActor.getPlayerAchievements(principal);
          setAchievements(achievementsData);
        } catch (error) {
          console.error('Error fetching game data:', error);
          // Fallback to demo mode if canister calls fail
          setDemoMode(true);
          setLeaderboard(demoLeaderboard);
          setAchievements(demoAchievements);
        }
      })();
    } else {
      // Show demo data for non-connected users
      setLeaderboard(demoLeaderboard);
      setAchievements(demoAchievements);
      setDemoMode(true);
    }
  }, [plugConnected, iiLoggedIn, principal, canisters.game]);

  const fetchPlayer = async () => {
    if (!actor || !principal) return;
    try {
      const playerData = await actor.getPlayerData(principal);
      if (playerData.length > 0) {
        const player = playerData[0];
        setGameState({
          level: Number(player.level),
          experience: Number(player.experience),
          coins: Number(player.coins),
          plants: player.plants || []
        });
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  const handleSpendSpicy = async (amount) => {
    if (!actor || !principal) return;
    setLoading(true);
    try {
      const success = await actor.spendSpicy(principal, amount);
      if (success) {
        const newBalance = await actor.getSpicyBalance(principal);
        setSpicyBalance(Number(newBalance));
        alert(`Spent ${amount} $SPICY!`);
      } else {
        alert('Not enough $SPICY!');
      }
    } catch (error) {
      console.error('Error spending SPICY:', error);
      alert('Error spending SPICY tokens');
    }
    setLoading(false);
  };

  const handleAwardHeat = async (amount) => {
    if (!actor || !principal) return;
    setLoading(true);
    try {
      await actor.awardHeat(principal, amount);
      const newBalance = await actor.getHeatBalance(principal);
      setHeatBalance(Number(newBalance));
      alert(`Awarded ${amount} $HEAT!`);
    } catch (error) {
      console.error('Error awarding HEAT:', error);
      alert('Error awarding HEAT tokens');
    }
    setLoading(false);
  };

  const handlePlant = async (plantType) => {
    if (!actor || !principal) return;
    if (gameState.coins < plantType.cost) {
      alert('Not enough coins!');
      return;
    }
    
    setLoading(true);
    try {
      const success = await actor.plantSeed(principal, plantType.name, plantType.cost);
      if (success) {
        // Refresh player data
        await fetchPlayer();
        alert(`Planted ${plantType.name}!`);
      } else {
        alert('Failed to plant seed');
      }
    } catch (error) {
      console.error('Error planting seed:', error);
      alert('Error planting seed');
    }
    setLoading(false);
  };

  const handleWater = async (plantId) => {
    if (!actor || !principal) return;
    if (!validateInput.number(plantId, 1)) {
      alert('Invalid plant ID');
      return;
    }
    if (!rateLimiter.canPerformAction('water_plant', principal, 10, 60000)) {
      alert('Please wait before watering again');
      return;
    }
    setLoading(true);
    try {
      const success = await actor.waterPlant(principal, plantId);
      if (success) {
        // Refresh player data
        await fetchPlayer();
        alert('Plant watered successfully!');
      } else {
        alert('Failed to water plant');
      }
    } catch (error) {
      console.error('Error watering plant:', error);
      alert('Error watering plant');
    }
    setLoading(false);
  };

  const handleHarvest = async (plantId) => {
    if (!actor || !principal) return;
    if (!validateInput.number(plantId, 1)) {
      alert('Invalid plant ID');
      return;
    }
    if (!rateLimiter.canPerformAction('harvest_plant', principal, 10, 60000)) {
      alert('Please wait before harvesting again');
      return;
    }
    setLoading(true);
    try {
      const reward = await actor.harvestPlant(principal, plantId);
      if (reward > 0) {
        // Refresh player data
        await fetchPlayer();
        alert(`Harvested plant! Earned ${reward} coins!`);
      } else {
        alert('Plant not ready for harvest');
      }
    } catch (error) {
      console.error('Error harvesting plant:', error);
      alert('Error harvesting plant');
    }
    setLoading(false);
  };

  const handlePlayLevel = async () => {
    if (!actor || !principal) return;
    if (spicyBalance < 10) {
      alert('Not enough $SPICY to play!');
      return;
    }
    
    setLoading(true);
    try {
      const result = await actor.playLevel(principal, 10);
      if (result.success) {
        // Refresh balances and player data
        const newSpicyBalance = await actor.getSpicyBalance(principal);
        const newHeatBalance = await actor.getHeatBalance(principal);
        setSpicyBalance(Number(newSpicyBalance));
        setHeatBalance(Number(newHeatBalance));
        
        await fetchPlayer();
        
        alert(`Level completed! Earned ${result.heatEarned} $HEAT and ${result.coinsEarned} coins!`);
      } else {
        alert('Failed to complete level');
      }
    } catch (error) {
      console.error('Error playing level:', error);
      alert('Error playing level');
    }
    setLoading(false);
  };

  const plantTypes = [
    { name: 'Chili Pepper', type: '🌶️', cost: 50, growthTime: 24 },
    { name: 'Jalapeño', type: '🫑', cost: 100, growthTime: 48 },
    { name: 'Habanero', type: '🔥', cost: 200, growthTime: 72 },
    { name: 'Ghost Pepper', type: '👻', cost: 500, growthTime: 96 },
  ];

  const handleRegister = async (username) => {
    if (!actor || !principal) return;
    if (!validateInput.text(username, 50)) {
      alert('Username must be 1-50 characters');
      return;
    }
    if (!rateLimiter.canPerformAction('register', principal, 1, 60000)) {
      alert('Please wait before registering again');
      return;
    }
    setLoading(true);
    try {
      const result = await actor.register_player(username);
      alert(result);
      auditLog.log('register', principal, { username });
      await fetchPlayer();
    } catch (error) {
      alert(handleError(error, 'registering player'));
    }
    setLoading(false);
  };

  const handlePlantSeed = async (plantName) => {
    if (!actor || !principal) return;
    if (!validateInput.text(plantName, 30)) {
      alert('Plant name must be 1-30 characters');
      return;
    }
    if (!rateLimiter.canPerformAction('plant_seed', principal, 5, 60000)) {
      alert('Please wait before planting again');
      return;
    }
    setLoading(true);
    try {
      const result = await actor.plant_seed(plantName);
      alert(result);
      auditLog.log('plant_seed', principal, { plantName });
      await fetchPlayer();
    } catch (error) {
      alert(handleError(error, 'planting seed'));
    }
    setLoading(false);
  };

  const handleWaterPlant = async (plantId) => {
    if (!actor || !principal) return;
    if (!validateInput.number(plantId, 1)) {
      alert('Invalid plant ID');
      return;
    }
    if (!rateLimiter.canPerformAction('water_plant', principal, 10, 60000)) {
      alert('Please wait before watering again');
      return;
    }
    setLoading(true);
    try {
      const result = await actor.water_plant(plantId);
      alert(result);
      auditLog.log('water_plant', principal, { plantId });
      await fetchPlayer();
    } catch (error) {
      alert(handleError(error, 'watering plant'));
    }
    setLoading(false);
  };

  const handleHarvestPlant = async (plantId) => {
    if (!actor || !principal) return;
    if (!validateInput.number(plantId, 1)) {
      alert('Invalid plant ID');
      return;
    }
    if (!rateLimiter.canPerformAction('harvest_plant', principal, 10, 60000)) {
      alert('Please wait before harvesting again');
      return;
    }
    setLoading(true);
    try {
      const result = await actor.harvest_plant(plantId);
      alert(result);
      auditLog.log('harvest_plant', principal, { plantId });
      await fetchPlayer();
    } catch (error) {
      alert(handleError(error, 'harvesting plant'));
    }
    setLoading(false);
  };

  // Game is now accessible to everyone - wallet connection provides enhanced features

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 overflow-x-hidden">
      {/* Luxury Background Image and Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img src="/game.jpg" alt="Game Background" className="w-full h-full object-cover object-center blur-sm opacity-30" />
        <div className="absolute inset-0 bg-black bg-opacity-70" />
      </div>
      
      {/* Main Game Component */}
      <div className="relative z-10">
        <ChiliGrowingGame />
      </div>
    </div>
  );
};

export default GamePage;

import Array "mo:base/Array";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Order "mo:base/Order";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Constants "../Constants";

actor {
  // Admin principal - should be set to the actual admin principal
  // Use Constants.ADMIN_PRINCIPAL and Constants.CHILI_CANISTER_ID instead of hardcoded values.
  
  // Plant type
  type Plant = {
    id : Nat;
    name : Text;
    growth : Nat;
    lastWatered : Int;
    harvested : Bool;
    plantedAt : Int;
  };

  // Player type
  type Player = {
    principal : Principal;
    name : Text;
    coins : Nat;
    plants : [Plant];
    level : Nat;
    experience : Nat;
    lastAction : Int;
  };

  // Stable storage for players
  stable var players : [Player] = [];
  stable var nextPlantId : Nat = 1;

  // Enhanced Player type for P2E game
  type GamePlayer = {
    principal : Principal;
    name : Text;
    spicyBalance : Nat;
    heatBalance : Nat;
    level : Nat;
    experience : Nat;
    plants : [GamePlant];
    inventory : [(Text, Nat)]; // items and quantities
    unlockedSeeds : [Text];
    lastSaved : Int;
  };

  // Enhanced Plant type for P2E game
  type GamePlant = {
    id : Nat;
    slot : Nat;
    plantType : Text;
    stage : Nat; // 0-5 growth stages
    plantedAt : Int;
    lastWatered : Int;
    needsWater : Bool;
  };

  // Stable storage for new P2E game
  stable var gamePlayers : [GamePlayer] = [];
  stable var gamePlayersMap : [(Principal, GamePlayer)] = [];

  // Rate limiting for game actions
  private var lastActionTime : HashMap.HashMap<Principal, Int> = HashMap.HashMap<Principal, Int>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  private let ACTION_COOLDOWN_SECONDS : Int = 5; // 5 seconds between actions

  // Anti-cheat: track suspicious activity
  private var suspiciousActivity : HashMap.HashMap<Principal, Nat> = HashMap.HashMap<Principal, Nat>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  private let MAX_SUSPICIOUS_ACTIONS : Nat = 10;

  // Helper function to check if caller is admin
  private func isAdmin(caller : Principal) : Bool {
    Principal.equal(caller, Principal.fromText(Constants.ADMIN_PRINCIPAL_TEXT))
  };

  // Helper function to validate text input
  private func validateText(text : Text, maxLength : Nat) : Bool {
    text.size() > 0 and text.size() <= maxLength
  };

  // Helper function to check rate limiting
  private func checkRateLimit(caller : Principal) : Bool {
    switch (lastActionTime.get(caller)) {
      case null true;
      case (?lastTime) {
        let now = Int.abs(Time.now());
        Int.greater(now, lastTime + ACTION_COOLDOWN_SECONDS)
      };
    }
  };

  // Helper function to update rate limiting
  private func updateRateLimit(caller : Principal) {
    let now = Int.abs(Time.now());
    lastActionTime.put(caller, now);
  };

  // Helper function to track suspicious activity
  private func trackSuspiciousActivity(caller : Principal) {
    switch (suspiciousActivity.get(caller)) {
      case null suspiciousActivity.put(caller, 1);
      case (?count) {
        if (count >= MAX_SUSPICIOUS_ACTIONS) {
          // Could implement temporary ban here
          return;
        };
        suspiciousActivity.put(caller, count + 1);
      };
    };
  };

  // Register a player
  public shared ({ caller }) func register_player(name : Text) : async Text {
    // Input validation
    if (not validateText(name, 50)) {
      return "Invalid name. Must be 1-50 characters.";
    };
    
    // Check if already registered
    if (Array.find<Player>(players, func (p) { p.principal == caller }) != null) {
      return "Player already registered.";
    };
    
    let now = Int.abs(Time.now());
    let newPlayer = {
      principal = caller;
      name = name;
      coins = 100;
      plants = [];
      level = 1;
      experience = 0;
      lastAction = now;
    };
    players := Array.append<Player>(players, [newPlayer]);
    updateRateLimit(caller);
    "Player registered successfully!";
  };

  // Plant a new plant
  public shared ({ caller }) func plant_seed(name : Text) : async Text {
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };
    
    // Input validation
    if (not validateText(name, 30)) {
      return "Invalid plant name. Must be 1-30 characters.";
    };
    
    var idx : ?Nat = null;
    for (i in players.keys()) {
      if (players[i].principal == caller) { 
        idx := ?i; 
      }
    };
    
    if (idx == null) {
      return "Player not registered.";
    };
    
    let i = switch idx { case (?val) val; case null 0 };
    let player = players[i];
    
    // Check if player has too many plants (anti-cheat)
    if (player.plants.size() >= 20) {
      trackSuspiciousActivity(caller);
      return "Maximum plants limit reached.";
    };
    
    let now = Int.abs(Time.now());
    let plant = {
      id = nextPlantId;
      name = name;
      growth = 0;
      lastWatered = now;
      harvested = false;
      plantedAt = now;
    };
    
    let newPlants = Array.append<Plant>(player.plants, [plant]);
    let updatedPlayer : Player = {
      principal = player.principal;
      name = player.name;
      coins = player.coins;
      plants = newPlants;
      level = player.level;
      experience = player.experience;
      lastAction = now;
    };
    
    players := Array.tabulate<Player>(players.size(), func(j) { if (j == i) updatedPlayer else players[j] });
    nextPlantId += 1;
    updateRateLimit(caller);
    "Plant planted successfully!";
  };

  // Water a plant
  public shared ({ caller }) func water_plant(plantId : Nat) : async Text {
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };
    
    // Input validation
    if (plantId == 0) {
      return "Invalid plant ID.";
    };
    
    var idx : ?Nat = null;
    for (i in players.keys()) {
      if (players[i].principal == caller) { 
        idx := ?i; 
      }
    };
    
    if (idx == null) {
      return "Player not registered.";
    };
    
    let i = switch idx { case (?val) val; case null 0 };
    var plantIdx : ?Nat = null;
    
    for (j in players[i].plants.keys()) {
      if (players[i].plants[j].id == plantId) { 
        plantIdx := ?j; 
      }
    };
    
    if (plantIdx == null) {
      return "Plant not found.";
    };
    
    let pi = switch plantIdx { case (?val) val; case null 0 };
    let oldPlant = players[i].plants[pi];
    
    if (oldPlant.harvested) {
      return "Plant already harvested.";
    };
    
    // Check if plant was watered too recently (anti-cheat)
    let now = Int.abs(Time.now());
    let timeSinceWatered = now - oldPlant.lastWatered;
    if (timeSinceWatered < 60) { // 1 minute cooldown
      trackSuspiciousActivity(caller);
      return "Plant was watered too recently.";
    };
    
    let newGrowth = if (oldPlant.growth + 25 > 100) 100 else oldPlant.growth + 25;
    let newPlant : Plant = {
      id = oldPlant.id;
      name = oldPlant.name;
      growth = newGrowth;
      lastWatered = now;
      harvested = oldPlant.harvested;
      plantedAt = oldPlant.plantedAt;
    };
    
    let newPlants = Array.tabulate<Plant>(players[i].plants.size(), func(k) { if (k == pi) newPlant else players[i].plants[k] });
    let updatedPlayer : Player = {
      principal = players[i].principal;
      name = players[i].name;
      coins = players[i].coins;
      plants = newPlants;
      level = players[i].level;
      experience = players[i].experience;
      lastAction = now;
    };
    
    players := Array.tabulate<Player>(players.size(), func(j) { if (j == i) updatedPlayer else players[j] });
    updateRateLimit(caller);
    "Plant watered successfully!";
  };

  // Harvest a plant
  public shared ({ caller }) func harvest_plant(plantId : Nat) : async Text {
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };
    
    // Input validation
    if (plantId == 0) {
      return "Invalid plant ID.";
    };
    
    var idx : ?Nat = null;
    for (i in players.keys()) {
      if (players[i].principal == caller) { 
        idx := ?i; 
      }
    };
    
    if (idx == null) {
      return "Player not registered.";
    };
    
    let i = switch idx { case (?val) val; case null 0 };
    var plantIdx : ?Nat = null;
    
    for (j in players[i].plants.keys()) {
      if (players[i].plants[j].id == plantId) { 
        plantIdx := ?j; 
      }
    };
    
    if (plantIdx == null) {
      return "Plant not found.";
    };
    
    let pi = switch plantIdx { case (?val) val; case null 0 };
    let oldPlant = players[i].plants[pi];
    
    if (oldPlant.harvested) {
      return "Plant already harvested.";
    };
    
    if (oldPlant.growth < 100) {
      return "Plant not fully grown.";
    };
    
    // Check if plant was planted too recently (anti-cheat)
    let now = Int.abs(Time.now());
    let timeSincePlanted = now - oldPlant.plantedAt;
    if (timeSincePlanted < 300) { // 5 minutes minimum growth time
      trackSuspiciousActivity(caller);
      return "Plant needs more time to grow.";
    };
    
    let newPlant : Plant = {
      id = oldPlant.id;
      name = oldPlant.name;
      growth = oldPlant.growth;
      lastWatered = oldPlant.lastWatered;
      harvested = true;
      plantedAt = oldPlant.plantedAt;
    };
    
    let reward = 50;
    let newPlants = Array.tabulate<Plant>(players[i].plants.size(), func(k) { if (k == pi) newPlant else players[i].plants[k] });
    let updatedPlayer : Player = {
      principal = players[i].principal;
      name = players[i].name;
      coins = players[i].coins + reward;
      plants = newPlants;
      level = players[i].level;
      experience = players[i].experience + 10;
      lastAction = now;
    };
    
    players := Array.tabulate<Player>(players.size(), func(j) { if (j == i) updatedPlayer else players[j] });
    updateRateLimit(caller);
    "Plant harvested! Earned " # Nat.toText(reward) # " coins.";
  };

  // Get player state
  public query ({ caller }) func get_player() : async ?Player {
    Array.find<Player>(players, func (p) { p.principal == caller })
  };

  // Get leaderboard (top 10 by coins)
  public query func leaderboard() : async [Player] {
    let sorted = Array.sort<Player>(players, func (a, b) { 
      if (a.coins > b.coins) { #greater } 
      else if (a.coins < b.coins) { #less } 
      else { #equal } 
    });
    let size = if (sorted.size() <= 10) { sorted.size() } else { 10 };
    Array.tabulate<Player>(size, func(i) { sorted[i] })
  };

  // Admin function to reset suspicious activity
  public shared({ caller }) func reset_suspicious_activity(player_principal : Principal) : async Text {
    if (not isAdmin(caller)) {
      return "Only admin can reset suspicious activity.";
    };
    suspiciousActivity.delete(player_principal);
    "Suspicious activity reset for player.";
  };

  // Admin function to ban player
  public shared({ caller }) func ban_player(player_principal : Principal) : async Text {
    if (not isAdmin(caller)) {
      return "Only admin can ban players.";
    };
    
    // Remove player from players array
    players := Array.filter<Player>(players, func(p) { p.principal != player_principal });
    suspiciousActivity.delete(player_principal);
    lastActionTime.delete(player_principal);
    "Player banned successfully.";
  };

  // Get game statistics (admin only)
  public shared({ caller }) func get_game_stats() : async { total_players : Nat; total_plants : Nat; total_coins : Nat } {
    if (not isAdmin(caller)) {
      return { total_players = 0; total_plants = 0; total_coins = 0 };
    };
    
    var totalPlants : Nat = 0;
    var totalCoins : Nat = 0;
    
    for (player in players.vals()) {
      totalPlants += player.plants.size();
      totalCoins += player.coins;
    };
    
    { total_players = players.size(); total_plants = totalPlants; total_coins = totalCoins }
  };

  // Example inter-canister call (unchanged)
  public shared func get_game_status() : async Text {
    let chili_canister : actor { get_chili_fact : () -> async Text } = actor(Constants.CHILI_CANISTER_ID);
    let chili_fact = await chili_canister.get_chili_fact();
    "Game status with chili fact: " # chili_fact
  };

  // ========== NEW P2E CHILI GROWING GAME METHODS ==========

  // Helper to find game player
  private func findGamePlayer(principal : Principal) : ?Nat {
    var idx : ?Nat = null;
    for (i in gamePlayers.keys()) {
      if (gamePlayers[i].principal == principal) {
        idx := ?i;
      }
    };
    idx
  };

  // Initialize new player for P2E game
  public shared ({ caller }) func initializeGamePlayer() : async Bool {
    switch (findGamePlayer(caller)) {
      case (?_) false; // Already initialized
      case null {
        let newPlayer : GamePlayer = {
          principal = caller;
          name = "Anonymous";
          spicyBalance = 100; // Starting balance
          heatBalance = 0;
          level = 1;
          experience = 0;
          plants = [];
          inventory = [("basic_seeds", 5), ("water", 10), ("fertilizer", 3)];
          unlockedSeeds = ["basic"];
          lastSaved = Int.abs(Time.now());
        };
        gamePlayers := Array.append<GamePlayer>(gamePlayers, [newPlayer]);
        true
      }
    }
  };

  // Get player data for P2E game
  public query ({ caller }) func getGamePlayerData() : async ?GamePlayer {
    Array.find<GamePlayer>(gamePlayers, func (p) { p.principal == caller })
  };

  // Save player data for P2E game
  public shared ({ caller }) func saveGamePlayerData(
    spicyBalance : Nat,
    heatBalance : Nat,
    level : Nat,
    experience : Nat,
    plantsData : [GamePlant],
    inventory : [(Text, Nat)]
  ) : async Bool {
    switch (findGamePlayer(caller)) {
      case null false; // Player not found
      case (?i) {
        let updatedPlayer : GamePlayer = {
          principal = caller;
          name = gamePlayers[i].name;
          spicyBalance = spicyBalance;
          heatBalance = heatBalance;
          level = level;
          experience = experience;
          plants = plantsData;
          inventory = inventory;
          unlockedSeeds = gamePlayers[i].unlockedSeeds;
          lastSaved = Int.abs(Time.now());
        };
        gamePlayers := Array.tabulate<GamePlayer>(gamePlayers.size(), func(j) { 
          if (j == i) updatedPlayer else gamePlayers[j] 
        });
        true
      }
    }
  };

  // Plant a seed in P2E game
  public shared ({ caller }) func plantGameSeed(
    slotIndex : Nat,
    seedType : Text,
    seedCost : Nat
  ) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };

    switch (findGamePlayer(caller)) {
      case null "Player not initialized. Call initializeGamePlayer first.";
      case (?i) {
        let player = gamePlayers[i];
        
        // Check if player has enough SPICY tokens
        if (player.spicyBalance < seedCost) {
          return "Insufficient SPICY tokens.";
        };

        // Check if slot is empty
        let existingPlant = Array.find<GamePlant>(player.plants, func(p) { p.slot == slotIndex });
        switch (existingPlant) {
          case (?_) "Slot already occupied.";
          case null {
            let now = Int.abs(Time.now());
            let newPlant : GamePlant = {
              id = now; // Use timestamp as unique ID
              slot = slotIndex;
              plantType = seedType;
              stage = 0;
              plantedAt = now;
              lastWatered = now;
              needsWater = false;
            };

            let updatedPlayer : GamePlayer = {
              principal = player.principal;
              name = player.name;
              spicyBalance = player.spicyBalance - seedCost;
              heatBalance = player.heatBalance;
              level = player.level;
              experience = player.experience;
              plants = Array.append<GamePlant>(player.plants, [newPlant]);
              inventory = player.inventory;
              unlockedSeeds = player.unlockedSeeds;
              lastSaved = now;
            };

            gamePlayers := Array.tabulate<GamePlayer>(gamePlayers.size(), func(j) { 
              if (j == i) updatedPlayer else gamePlayers[j] 
            });

            updateRateLimit(caller);
            "Seed planted successfully!"
          }
        }
      }
    }
  };

  // Water a plant in P2E game
  public shared ({ caller }) func waterGamePlant(plantId : Nat) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };

    switch (findGamePlayer(caller)) {
      case null "Player not initialized.";
      case (?i) {
        let player = gamePlayers[i];
        
        // Find the plant
        var plantIndex : ?Nat = null;
        for (j in player.plants.keys()) {
          if (player.plants[j].id == plantId) {
            plantIndex := ?j;
          }
        };

        switch (plantIndex) {
          case null "Plant not found.";
          case (?pIdx) {
            let plant = player.plants[pIdx];
            let now = Int.abs(Time.now());

            let updatedPlant : GamePlant = {
              id = plant.id;
              slot = plant.slot;
              plantType = plant.plantType;
              stage = plant.stage;
              plantedAt = plant.plantedAt;
              lastWatered = now;
              needsWater = false;
            };

            let updatedPlants = Array.tabulate<GamePlant>(player.plants.size(), func(k) { 
              if (k == pIdx) updatedPlant else player.plants[k] 
            });

            let updatedPlayer : GamePlayer = {
              principal = player.principal;
              name = player.name;
              spicyBalance = player.spicyBalance;
              heatBalance = player.heatBalance;
              level = player.level;
              experience = player.experience;
              plants = updatedPlants;
              inventory = player.inventory;
              unlockedSeeds = player.unlockedSeeds;
              lastSaved = now;
            };

            gamePlayers := Array.tabulate<GamePlayer>(gamePlayers.size(), func(j) { 
              if (j == i) updatedPlayer else gamePlayers[j] 
            });

            updateRateLimit(caller);
            "Plant watered successfully!"
          }
        }
      }
    }
  };

  // Harvest a plant in P2E game
  public shared ({ caller }) func harvestGamePlant(
    plantId : Nat,
    spicyReward : Nat,
    heatReward : Nat
  ) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };

    switch (findGamePlayer(caller)) {
      case null "Player not initialized.";
      case (?i) {
        let player = gamePlayers[i];
        
        // Find and remove the plant
        let filteredPlants = Array.filter<GamePlant>(player.plants, func(p) { p.id != plantId });
        
        if (filteredPlants.size() == player.plants.size()) {
          return "Plant not found.";
        };

        let experienceGain = spicyReward / 5;
        let newExperience = player.experience + experienceGain;
        let newLevel = (newExperience / 100) + 1;

        let updatedPlayer : GamePlayer = {
          principal = player.principal;
          name = player.name;
          spicyBalance = player.spicyBalance + spicyReward;
          heatBalance = player.heatBalance + heatReward;
          level = newLevel;
          experience = newExperience;
          plants = filteredPlants;
          inventory = player.inventory;
          unlockedSeeds = player.unlockedSeeds;
          lastSaved = Int.abs(Time.now());
        };

        gamePlayers := Array.tabulate<GamePlayer>(gamePlayers.size(), func(j) { 
          if (j == i) updatedPlayer else gamePlayers[j] 
        });

        updateRateLimit(caller);
        "Plant harvested! Earned " # Nat.toText(spicyReward) # " SPICY and " # Nat.toText(heatReward) # " HEAT!"
      }
    }
  };

  // Get game leaderboard for P2E
  public query func getGameLeaderboard() : async [GamePlayer] {
    let sorted = Array.sort<GamePlayer>(gamePlayers, func (a, b) { 
      if (a.level > b.level) { #greater } 
      else if (a.level < b.level) { #less } 
      else if (a.spicyBalance > b.spicyBalance) { #greater }
      else if (a.spicyBalance < b.spicyBalance) { #less }
      else { #equal } 
    });
    let size = if (sorted.size() <= 10) { sorted.size() } else { 10 };
    Array.tabulate<GamePlayer>(size, func(i) { sorted[i] })
  };

  // Buy item from game shop
  public shared ({ caller }) func buyGameItem(
    item : Text,
    cost : Nat,
    currency : Text
  ) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another action.";
    };

    switch (findGamePlayer(caller)) {
      case null "Player not initialized.";
      case (?i) {
        let player = gamePlayers[i];
        
        // Check balance
        let hasEnough = switch (currency) {
          case ("spicy") player.spicyBalance >= cost;
          case ("heat") player.heatBalance >= cost;
          case (_) false;
        };

        if (not hasEnough) {
          return "Insufficient " # currency # " tokens.";
        };

        // Update inventory
        var newInventory = player.inventory;
        var itemFound = false;
        newInventory := Array.map<(Text, Nat), (Text, Nat)>(player.inventory, func((name, count)) {
          if (name == item) {
            itemFound := true;
            (name, count + 1)
          } else {
            (name, count)
          }
        });

        if (not itemFound) {
          newInventory := Array.append<(Text, Nat)>(newInventory, [(item, 1)]);
        };

        let updatedPlayer : GamePlayer = {
          principal = player.principal;
          name = player.name;
          spicyBalance = if (currency == "spicy") player.spicyBalance - cost else player.spicyBalance;
          heatBalance = if (currency == "heat") player.heatBalance - cost else player.heatBalance;
          level = player.level;
          experience = player.experience;
          plants = player.plants;
          inventory = newInventory;
          unlockedSeeds = player.unlockedSeeds;
          lastSaved = Int.abs(Time.now());
        };

        gamePlayers := Array.tabulate<GamePlayer>(gamePlayers.size(), func(j) { 
          if (j == i) updatedPlayer else gamePlayers[j] 
        });

        updateRateLimit(caller);
        "Item purchased successfully!"
      }
    }
  };
} 
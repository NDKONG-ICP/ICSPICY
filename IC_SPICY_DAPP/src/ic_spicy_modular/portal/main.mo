import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";
import Constants "../Constants";

actor {
  // Use Constants.ADMIN_PRINCIPAL and canister IDs instead of hardcoded values.
  private let ADMIN_PRINCIPAL : Principal = Constants.ADMIN_PRINCIPAL;
  
  // Stake position type
  public type StakePosition = {
    principal : Principal;
    amount : Nat64;
    staked_at : Nat64;
    lock_months : Nat;
    apy : Float;
    rewards : Nat;
    last_claimed : Nat64;
    unstaked : Bool;
  };

  // Governance proposal type
  public type Proposal = {
    id : Nat;
    title : Text;
    description : Text;
    creator : Principal;
    created_at : Nat64;
    votes_for : Nat;
    votes_against : Nat;
    executed : Bool;
    executed_at : ?Nat64;
    min_votes_required : Nat;
  };

  // Vote tracking to prevent double voting
  public type Vote = {
    voter : Principal;
    proposal_id : Nat;
    vote_for : Bool;
    timestamp : Nat64;
  };

  // Stable storage
  stable var stakesArr : [StakePosition] = [];
  stable var proposalsArr : [Proposal] = [];
  stable var votesArr : [Vote] = [];
  stable var nextProposalId : Nat = 1;

  // Non-stable HashMaps for fast lookup
  var stakes : HashMap.HashMap<Principal, StakePosition> = HashMap.HashMap<Principal, StakePosition>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  var proposals : HashMap.HashMap<Nat, Proposal> = HashMap.HashMap<Nat, Proposal>(10, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  var votes : HashMap.HashMap<Principal, HashMap.HashMap<Nat, Vote>> = HashMap.HashMap<Principal, HashMap.HashMap<Nat, Vote>>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });

  // Rate limiting for staking operations
  private var lastStakeTime : HashMap.HashMap<Principal, Nat64> = HashMap.HashMap<Principal, Nat64>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  private let STAKE_COOLDOWN_SECONDS : Nat64 = 300; // 5 minutes

  // System functions for persistence
  system func preupgrade() {
    stakesArr := Iter.toArray(stakes.vals());
    proposalsArr := Iter.toArray(proposals.vals());
    // Flatten votes structure for storage
    var allVotes : [Vote] = [];
    for ((principal, userVotes) in votes.entries()) {
      for (vote in userVotes.vals()) {
        allVotes := Array.append(allVotes, [vote]);
      };
    };
    votesArr := allVotes;
  };

  system func postupgrade() {
    stakes := HashMap.HashMap<Principal, StakePosition>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for (s in stakesArr.vals()) {
      stakes.put(s.principal, s);
    };
    proposals := HashMap.HashMap<Nat, Proposal>(10, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
    for (p in proposalsArr.vals()) {
      proposals.put(p.id, p);
    };
    votes := HashMap.HashMap<Principal, HashMap.HashMap<Nat, Vote>>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for (v in votesArr.vals()) {
      switch (votes.get(v.voter)) {
        case null {
          let userVotes = HashMap.HashMap<Nat, Vote>(10, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
          userVotes.put(v.proposal_id, v);
          votes.put(v.voter, userVotes);
        };
        case (?userVotes) {
          userVotes.put(v.proposal_id, v);
          votes.put(v.voter, userVotes);
        };
      };
    };
  };

  // Helper function to check if caller is admin
  private func isAdmin(caller : Principal) : Bool {
    Principal.equal(caller, ADMIN_PRINCIPAL)
  };

  // Helper function to validate text input
  private func validateText(text : Text, maxLength : Nat) : Bool {
    text.size() > 0 and text.size() <= maxLength
  };

  // Helper function to check rate limiting
  private func checkRateLimit(caller : Principal) : Bool {
    switch (lastStakeTime.get(caller)) {
      case null true;
      case (?lastTime) {
        let now = Nat64.fromIntWrap(Time.now());
        Nat64.greater(now, lastTime + STAKE_COOLDOWN_SECONDS)
      };
    }
  };

  // Calculate APY based on lock period
  func calc_apy(months : Nat) : Float {
    if (months < 3) { 0.0 }
    else if (months >= 24) { 30.0 }
    else { 12.5 + (Float.fromInt(months - 3) / Float.fromInt(21)) * (30.0 - 12.5) }
  };

  // Stake $SPICY tokens
  public shared({ caller }) func stake(amount : Nat, lock_months : Nat) : async Text {
    // Input validation
    if (amount < 100) return "Minimum stake is 100 $SPICY.";
    if (amount > 1_000_000_000) return "Maximum stake is 1,000,000,000 $SPICY."; // Prevent overflow attacks
    if (lock_months < 3) return "Minimum lock period is 3 months.";
    if (lock_months > 60) return "Maximum lock period is 60 months."; // Prevent excessive lock periods
    if (stakes.get(caller) != null) return "Already staked. Unstake first.";
    
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another stake operation.";
    };
    
    let now = Nat64.fromIntWrap(Time.now());
    let apy = calc_apy(lock_months);
    let pos : StakePosition = {
      principal = caller;
      amount = Nat64.fromNat(amount);
      staked_at = now;
      lock_months = lock_months;
      apy = apy;
      rewards = 0;
      last_claimed = now;
      unstaked = false;
    };
    stakes.put(caller, pos);
    stakesArr := Iter.toArray(stakes.vals());
    
    // Update rate limiting
    lastStakeTime.put(caller, now);
    
    "Staked " # Nat.toText(amount) # " $SPICY for " # Nat.toText(lock_months) # " months at " # Float.toText(apy) # "% APY.";
  };

  // Unstake tokens (after lock period)
  public shared({ caller }) func unstake() : async Text {
    switch (stakes.get(caller)) {
      case null return "No active stake.";
      case (?pos) {
        if (pos.unstaked) return "Already unstaked.";
        let now = Nat64.fromIntWrap(Time.now());
        let lock_end = pos.staked_at + Nat64.fromNat(pos.lock_months * 30 * 24 * 60 * 60 * 1_000_000_000);
        if (now < lock_end) return "Cannot unstake before lock period ends.";
        
        let updated : StakePosition = {
          principal = pos.principal;
          amount = 0;
          staked_at = pos.staked_at;
          lock_months = pos.lock_months;
          apy = pos.apy;
          rewards = pos.rewards;
          last_claimed = pos.last_claimed;
          unstaked = true;
        };
        stakes.put(caller, updated);
        stakesArr := Iter.toArray(stakes.vals());
        return "Unstaked successfully.";
      }
    }
  };

  // Claim rewards
  public shared({ caller }) func claim_rewards() : async Text {
    switch (stakes.get(caller)) {
      case null return "No active stake.";
      case (?pos) {
        if (pos.unstaked) return "No active stake.";
        let now = Nat64.fromIntWrap(Time.now());
        let elapsed_sec_nat = Nat64.toNat(now - pos.last_claimed) / 1_000_000_000;
        let quarters = elapsed_sec_nat / (90 * 24 * 60 * 60);
        let rewardInt = Int.abs(Float.toInt(Float.fromInt(Nat64.toNat(pos.amount)) * (pos.apy / 100.0) * (Float.fromInt(quarters) / 4.0)));
        let rewardNat = Int.abs(rewardInt);
        
        // Prevent excessive rewards
        if (rewardNat > 1_000_000_000) {
          return "Reward calculation error. Please contact support.";
        };
        
        let updated : StakePosition = {
          principal = pos.principal;
          amount = pos.amount;
          staked_at = pos.staked_at;
          lock_months = pos.lock_months;
          apy = pos.apy;
          rewards = pos.rewards + rewardNat;
          last_claimed = now;
          unstaked = false;
        };
        stakes.put(caller, updated);
        stakesArr := Iter.toArray(stakes.vals());
        return "Claimed " # Nat.toText(rewardNat) # " $HEAT rewards.";
      }
    }
  };

  // Create governance proposal
  public shared({ caller }) func create_proposal(title : Text, description : Text) : async Nat {
    // Input validation
    if (not validateText(title, 100)) return 0; // Return 0 for invalid input
    if (not validateText(description, 1000)) return 0;
    
    // Check if user has minimum stake to create proposals
    switch (stakes.get(caller)) {
      case null return 0;
      case (?stake) {
        if (stake.unstaked) return 0;
        if (Nat64.toNat(stake.amount) < 1000) return 0;
      };
    };
    
    let now = Nat64.fromIntWrap(Time.now());
    let proposal : Proposal = {
      id = nextProposalId;
      title = title;
      description = description;
      creator = caller;
      created_at = now;
      votes_for = 0;
      votes_against = 0;
      executed = false;
      executed_at = null;
      min_votes_required = 10; // Minimum votes required for execution
    };
    proposals.put(nextProposalId, proposal);
    proposalsArr := Iter.toArray(proposals.vals());
    nextProposalId += 1;
    proposal.id
  };

  // Vote on proposal
  public shared({ caller }) func vote(proposal_id : Nat, vote_for : Bool) : async Text {
    // Check if proposal exists
    switch (proposals.get(proposal_id)) {
      case null return "Proposal not found.";
      case (?proposal) {
        if (proposal.executed) return "Proposal already executed.";
        
        // Check if user has already voted
        switch (votes.get(caller)) {
          case null { /* First vote for this user */ };
          case (?userVotes) {
            switch (userVotes.get(proposal_id)) {
              case null { /* First vote on this proposal */ };
              case (?existingVote) return "Already voted on this proposal.";
            };
          };
        };
        
        // Check if user has minimum stake to vote
        switch (stakes.get(caller)) {
          case null return "Must have active stake to vote.";
          case (?stake) {
            if (stake.unstaked) return "Must have active stake to vote.";
            if (Nat64.toNat(stake.amount) < 100) return "Must stake at least 100 $SPICY to vote.";
          };
        };
        
        let now = Nat64.fromIntWrap(Time.now());
        let vote : Vote = {
          voter = caller;
          proposal_id = proposal_id;
          vote_for = vote_for;
          timestamp = now;
        };
        
        // Record the vote
        switch (votes.get(caller)) {
          case null {
            let userVotes = HashMap.HashMap<Nat, Vote>(10, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
            userVotes.put(proposal_id, vote);
            votes.put(caller, userVotes);
          };
          case (?userVotes) {
            userVotes.put(proposal_id, vote);
            votes.put(caller, userVotes);
          };
        };
        
        // Update proposal vote counts
        let updated : Proposal = {
          id = proposal.id;
          title = proposal.title;
          description = proposal.description;
          creator = proposal.creator;
          created_at = proposal.created_at;
          votes_for = if (vote_for) { proposal.votes_for + 1 } else { proposal.votes_for };
          votes_against = if (vote_for) { proposal.votes_against } else { proposal.votes_against + 1 };
          executed = proposal.executed;
          executed_at = proposal.executed_at;
          min_votes_required = proposal.min_votes_required;
        };
        proposals.put(proposal_id, updated);
        proposalsArr := Iter.toArray(proposals.vals());
        return "Vote recorded successfully.";
      }
    }
  };

  // Execute proposal (admin function)
  public shared({ caller }) func execute_proposal(proposal_id : Nat) : async Text {
    // Only admin can execute proposals
    if (not isAdmin(caller)) {
      return "Only admin can execute proposals.";
    };
    
    switch (proposals.get(proposal_id)) {
      case null return "Proposal not found.";
      case (?proposal) {
        if (proposal.executed) return "Proposal already executed.";
        
        // Check if minimum votes are reached
        let totalVotes = proposal.votes_for + proposal.votes_against;
        if (totalVotes < proposal.min_votes_required) {
          return "Minimum votes not reached for execution.";
        };
        
        let now = Nat64.fromIntWrap(Time.now());
        let updated : Proposal = {
          id = proposal.id;
          title = proposal.title;
          description = proposal.description;
          creator = proposal.creator;
          created_at = proposal.created_at;
          votes_for = proposal.votes_for;
          votes_against = proposal.votes_against;
          executed = true;
          executed_at = ?now;
          min_votes_required = proposal.min_votes_required;
        };
        proposals.put(proposal_id, updated);
        proposalsArr := Iter.toArray(proposals.vals());
        return "Proposal executed successfully.";
      }
    }
  };

  // Query functions
  public query({ caller }) func get_stake() : async ?StakePosition {
    stakes.get(caller)
  };

  public query func list_stakers() : async [StakePosition] {
    Iter.toArray(stakes.vals())
  };

  public query func get_proposal(id : Nat) : async ?Proposal {
    proposals.get(id)
  };

  public query func list_proposals() : async [Proposal] {
    Iter.toArray(proposals.vals())
  };

  // Get total staked amount
  public query func total_staked() : async Nat {
    var total : Nat = 0;
    for (stake in stakes.vals()) {
      if (not stake.unstaked) {
        total += Nat64.toNat(stake.amount);
      };
    };
    total
  };

  // Get user's vote on a proposal
  public query({ caller }) func get_user_vote(proposal_id : Nat) : async ?Vote {
    switch (votes.get(caller)) {
      case null null;
      case (?userVotes) userVotes.get(proposal_id);
    }
  };

  // Admin function to set admin principal
  public shared({ caller }) func set_admin(new_admin : Principal) : async Text {
    if (not isAdmin(caller)) {
      return "Only current admin can change admin.";
    };
    // Note: This would require a mutable variable for ADMIN_PRINCIPAL
    // For now, we'll keep it as a constant for security
    "Admin principal is set as a constant for security.";
  };
} 
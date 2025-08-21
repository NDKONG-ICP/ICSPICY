import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Int64 "mo:base/Int64";
import Int "mo:base/Int";

actor {
  type StakePosition = {
    principal : Principal;
    amount : Nat64;
    staked_at : Nat64;
    lock_months : Nat;
    apy : Float;
    rewards : Nat;
    last_claimed : Nat64;
    unstaked : Bool;
  };

  stable var stakesArr : [StakePosition] = [];
  var stakes : HashMap.HashMap<Principal, StakePosition> = HashMap.HashMap<Principal, StakePosition>(10, Principal.equal, Principal.hash);

  system func preupgrade() : () {
    stakesArr := Iter.toArray(stakes.vals());
  };

  system func postupgrade() : () {
    stakes := HashMap.HashMap<Principal, StakePosition>(10, Principal.equal, Principal.hash);
    for (s in stakesArr.vals()) {
      stakes.put(s.principal, s);
    }
  };

  func calc_apy(months : Nat) : Float {
    if (months < 3) { 0.0 }
    else if (months >= 24) { 30.0 }
    else { 12.5 + (Float.fromInt(months - 3) / Float.fromInt(21)) * (30.0 - 12.5) }
  };

  public shared({ caller }) func stake(amount : Nat, lock_months : Nat) : async Text {
    if (amount < 100) return "Minimum stake is 100 $SPICY.";
    if (lock_months < 3) return "Minimum lock period is 3 months.";
    if (stakes.get(caller) != null) return "Already staked. Unstake first.";
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
    "Staked " # Nat.toText(amount) # " $SPICY for " # Nat.toText(lock_months) # " months at " # Float.toText(apy) # "% APY.";
  };

  public shared({ caller }) func unstake() : async Text {
    switch (stakes.get(caller)) {
      case null return "No active stake.";
      case (?pos) {
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

  public shared({ caller }) func claim_rewards() : async Text {
    switch (stakes.get(caller)) {
      case null return "No active stake.";
      case (?pos) {
        if (pos.unstaked) return "No active stake.";
        let now = Nat64.fromIntWrap(Time.now());
        let elapsed_sec_nat = Nat64.toNat(now - pos.last_claimed) / 1_000_000_000;
        let quarters = elapsed_sec_nat / (90 * 24 * 60 * 60);
        // let rewardInt = Int.abs(Float.toInt(Float.fromInt(Int64.toInt(Int64.fromNat64(pos.amount))) * (pos.apy / 100.0) * (Float.fromInt(Int64.toInt(Int64.fromNat(quarters))) / 4.0)));
        let rewardNat : Nat64 = 0;
        let updated : StakePosition = {
          principal = pos.principal;
          amount = pos.amount;
          staked_at = pos.staked_at;
          lock_months = pos.lock_months;
          apy = pos.apy;
          rewards = pos.rewards + Nat64.toNat(rewardNat);
          last_claimed = now;
          unstaked = false;
        };
        stakes.put(caller, updated);
        stakesArr := Iter.toArray(stakes.vals());
        return "Claimed " # Nat.toText(Nat64.toNat(rewardNat)) # " $HEAT rewards.";
      }
    }
  };

  public query({ caller }) func get_stake() : async ?StakePosition {
    stakes.get(caller)
  };

  public query func list_stakers() : async [StakePosition] {
    Iter.toArray(stakes.vals())
  };
} 
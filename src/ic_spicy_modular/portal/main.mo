// Staking Portal Dapp main.mo
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Text "mo:base/Text";

actor {
  module Result {
    public type Result<Ok, Err> = { #ok : Ok; #err : Err };
  };

  stable var stakes : [(Principal, Nat, Nat, Nat)] = [];
  type Garden = { stars : Nat; level : Nat; items : [Text] };

  public shared ({ caller }) func stake_spicy(amount : Nat) : async Result.Result<(), Text> {
    let garden : Garden = { stars = 5; level = 1; items = [] };
    let heatReward = garden.stars * amount;
    stakes := Array.append(stakes, [(caller, amount, heatReward, 0)]);
    #ok(())
  };
} 
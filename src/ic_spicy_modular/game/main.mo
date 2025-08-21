// Gardening Game Dapp main.mo
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Text "mo:base/Text";

actor {
  module Result {
    public type Result<Ok, Err> = { #ok : Ok; #err : Err };
  };

  stable var gardens : [(Principal, { stars : Nat; level : Nat; items : [Text] })] = [];
  type Garden = { stars : Nat; level : Nat; items : [Text] };
  type Puzzle = { target : Nat; moves : Nat };

  public shared ({ caller }) func start_game() : async Puzzle {
    { target = 10; moves = 15 }
  };

  public shared ({ caller }) func submit_move(matches : Nat) : async Result.Result<(), Text> {
    let garden = Option.get(Array.find(gardens, func g { g.0 == caller }), (caller, { stars = 0; level = 0; items = [] })).1;
    let newStars = garden.stars + matches;
    gardens := Array.map(gardens, func g { if (g.0 == caller) (g.0, { stars = newStars; level = garden.level; items = garden.items }) else g });
    #ok(())
  };

  // TODO: Implement gardening game logic
} 
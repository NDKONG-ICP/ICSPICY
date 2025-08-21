// Chili Facts Dapp main.mo
import Text "mo:base/Text";
import Option "mo:base/Option";
import Array "mo:base/Array";

actor {
  stable var pepperVarieties : [{ name : Text; shu : Nat }] = [
    { name = "MOA Scotch Bonnet"; shu = 350000 },
    { name = "Carolina Reaper"; shu = 2200000 },
    { name = "Aji Charapita"; shu = 50000 },
    { name = "Foodarama Scotch Bonnet"; shu = 350000 },
    { name = "Aji Guyana"; shu = 300000 },
    { name = "Apocalypse Scorpion"; shu = 2000000 },
    { name = "Death Spiral"; shu = 1800000 }
  ];

  public shared ({ caller }) func get_pepper_varieties() : async [{ name : Text; shu : Nat }] {
    pepperVarieties
  };

  // TODO: Implement chili facts logic
} 
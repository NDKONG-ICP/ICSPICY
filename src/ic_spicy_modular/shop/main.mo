// Shop Dapp main.mo
import Text "mo:base/Text";
import Option "mo:base/Option";
import Array "mo:base/Array";

actor {
  module Result {
    public type Result<Ok, Err> = { #ok : Ok; #err : Err };
  };

  stable var products : [{ name : Text; price : Nat; stock : Nat }] = [
    { name = "Hot Sauce"; price = 50; stock = 1000 },
    { name = "Seasoning Shaker"; price = 30; stock = 1000 }
  ];

  public shared ({ caller }) func buy_product(product_name : Text, use_apple_pay : Bool) : async Result.Result<(), Text> {
    let product = Option.get(Array.find(products, func p { p.name == product_name }), { name = ""; price = 0; stock = 0 });
    if (product.stock == 0) return #err("Out of stock");
    #ok(())
  };

  // TODO: Implement shop logic
} 
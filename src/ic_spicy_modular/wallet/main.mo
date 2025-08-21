// Wallet Dapp main.mo
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Text "mo:base/Text";

actor {
  module Result {
    public type Result<Ok, Err> = { #ok : Ok; #err : Err };
  };

  stable var balances : [(Principal, Text, Nat)] = [];
  stable var verifiedWallets : [Principal] = [];

  public shared ({ caller }) func login_with_ii_and_decide() : async Result.Result<Principal, Text> {
    let verifyResult : Result.Result<(), Text> = verify_with_decide_id(caller);
    switch (verifyResult) {
      case (#ok(_)) {
        verifiedWallets := Array.append(verifiedWallets, [caller]);
        return (#ok(caller) : Result.Result<Principal, Text>);
      };
      case (#err(msg)) {
        return (#err(msg) : Result.Result<Principal, Text>);
      }
    }
  };

  public shared ({ caller }) func deposit_token(token : Text, amount : Nat) : async Result.Result<(), Text> {
    balances := Array.append(balances, [(caller, token, amount)]);
    return (#ok(()) : Result.Result<(), Text>);
  };

  public shared ({ caller }) func tip_token(recipient : Principal, amount : Nat, token : Text) : async Result.Result<(), Text> {
    let sender_balance : Nat = Option.get<(Principal, Text, Nat)>(Array.find(balances, func b { b.0 == caller and b.1 == token }), (caller, token, 0)).2;
    if (sender_balance >= amount) {
      let balances_no_sender : [(Principal, Text, Nat)] = Array.filter(balances, func b { b.0 != caller or b.1 != token });
      let balances_with_sender_updated : [(Principal, Text, Nat)] = Array.append(balances_no_sender, [(caller, token, sender_balance - amount)]);
      let recBalance : Nat = Option.get<(Principal, Text, Nat)>(Array.find(balances_with_sender_updated, func b { b.0 == recipient and b.1 == token }), (recipient, token, 0)).2;
      let balances_no_recipient : [(Principal, Text, Nat)] = Array.filter(balances_with_sender_updated, func b { b.0 != recipient or b.1 != token });
      let balances_with_recipient_updated : [(Principal, Text, Nat)] = Array.append(balances_no_recipient, [(recipient, token, recBalance + amount)]);
      balances := balances_with_recipient_updated;
      return (#ok(()) : Result.Result<(), Text>);
    } else return (#err("Insufficient balance") : Result.Result<(), Text>);
  };

  func verify_with_decide_id(principal : Principal) : Result.Result<(), Text> {
    // Mock verification for local dev
    #ok(()) : Result.Result<(), Text>
  };

  // TODO: Implement wallet logic
} 
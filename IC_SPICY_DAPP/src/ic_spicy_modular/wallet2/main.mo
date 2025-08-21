import Constants "../Constants";

actor {
  // Wallet canister logic will be implemented here.

  public shared func get_wallet2_balance() : async Text {
    let wallet_canister : actor { get_wallet_balance : () -> async Text } = actor(Constants.WALLET_CANISTER_ID);
    let wallet_balance = await wallet_canister.get_wallet_balance();
    "Wallet2 balance with wallet: " # wallet_balance
  }
} 
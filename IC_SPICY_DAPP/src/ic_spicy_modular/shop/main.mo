actor {
  // Shop canister logic will be implemented here.

  public shared func get_shop_items() : async Text {
    let user_canister : actor { get_user_data : () -> async ?{ name : Text; location : Text; referral_code : ?Text; engagement : Nat } } = actor("os37x-baaaa-aaaap-qp5qq-cai");
    let user_info = await user_canister.get_user_data();
    switch (user_info) {
      case null "No user info.";
      case (?info) "Shop items for user: " # info.name;
    }
  }
} 
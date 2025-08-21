import Constants "../Constants";

actor {
  // Profile canister logic will be implemented here.

  public shared func get_profile() : async Text {
    let user_canister : actor { get_user_data : () -> async ?{ name : Text; location : Text; referral_code : ?Text; engagement : Nat } } = actor(Constants.USER_CANISTER_ID);
    let user_info = await user_canister.get_user_data();
    switch (user_info) {
      case null "No user info.";
      case (?info) "Profile for user: " # info.name;
    }
  }
} 
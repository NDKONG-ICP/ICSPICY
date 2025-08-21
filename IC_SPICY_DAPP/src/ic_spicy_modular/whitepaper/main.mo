actor {
  // Whitepaper canister logic will be implemented here.

  public shared func get_whitepaper_info() : async Text {
    let blog_canister : actor { get_blog_info : () -> async Text } = actor("l4gsl-gyaaa-aaaap-qp5ma-cai");
    let blog_info = await blog_canister.get_blog_info();
    "Whitepaper info with blog: " # blog_info
  }
} 
// Constants.mo
// Mainnet configuration for IC SPICY Modular Dapp
// Replace the placeholder values with your real mainnet canister IDs and admin principals before launch.

import Principal "mo:base/Principal";

module {
  public let ADMIN_PRINCIPAL : Principal = Principal.fromText("<MAINNET_ADMIN_PRINCIPAL>");
  public let CHILI_CANISTER_ID : Text = "<MAINNET_CHILI_CANISTER_ID>";
  public let GAME_CANISTER_ID : Text = "<MAINNET_GAME_CANISTER_ID>";
  public let MEMBERSHIP_CANISTER_ID : Text = "<MAINNET_MEMBERSHIP_CANISTER_ID>";
  public let PORTAL_CANISTER_ID : Text = "<MAINNET_PORTAL_CANISTER_ID>";
  public let PROFILE_CANISTER_ID : Text = "<MAINNET_PROFILE_CANISTER_ID>";
  public let SHOP_CANISTER_ID : Text = "<MAINNET_SHOP_CANISTER_ID>";
  public let USER_CANISTER_ID : Text = "<MAINNET_USER_CANISTER_ID>";
  public let WALLET_CANISTER_ID : Text = "<MAINNET_WALLET_CANISTER_ID>";
  public let WALLET2_CANISTER_ID : Text = "<MAINNET_WALLET2_CANISTER_ID>";
  public let WHITEPAPER_CANISTER_ID : Text = "<MAINNET_WHITEPAPER_CANISTER_ID>";
  // Add more as needed
} 
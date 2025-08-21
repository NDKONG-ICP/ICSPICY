import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Constants "../Constants";

actor {
  // Enhanced user profile type
  public type UserProfile = {
    name : Text;
    email : Text;
    location : Text;
    referral_code : ?Text;
    engagement : Nat;
    created_at : Nat64;
    last_login : Nat64;
    modules_accessed : [Text];
    total_actions : Nat;
    preferences : UserPreferences;
  };

  public type UserPreferences = {
    notifications : Bool;
    theme : Text; // "light" or "dark"
    language : Text; // "en", "es", etc.
    privacy_level : Text; // "public", "private", "friends"
  };

  public type UserStats = {
    days_active : Nat;
    modules_count : Nat;
    total_modules : Nat;
    join_date : Text;
    last_active : Text;
  };

  // Admin principal for management
  private let ADMIN_PRINCIPAL : Principal = Principal.fromText(Constants.ADMIN_PRINCIPAL_TEXT);

  // Stable storage for user data
  stable var userDataEntries : [(Principal, UserProfile)] = [];
  
  // Rate limiting storage
  stable var lastActionEntries : [(Principal, Nat64)] = [];
  
  // Activity tracking
  stable var activityLogEntries : [(Principal, Text, Nat64)] = []; // (user, action, timestamp)

  // Runtime hashmaps for fast access
  var users : HashMap.HashMap<Principal, UserProfile> = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  var lastActionTimes : HashMap.HashMap<Principal, Nat64> = HashMap.HashMap<Principal, Nat64>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  var activityLog : HashMap.HashMap<Principal, [Text]> = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });

  // Constants
  private let ACTION_COOLDOWN_SECONDS : Nat64 = 1; // 1 second between actions
  private let MAX_NAME_LENGTH : Nat = 50;
  private let MAX_EMAIL_LENGTH : Nat = 100;

  // System functions for stable storage
  system func preupgrade() {
    userDataEntries := Iter.toArray(users.entries());
    lastActionEntries := Iter.toArray(lastActionTimes.entries());
  };

  system func postupgrade() {
    users := HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for ((principal, profile) in userDataEntries.vals()) {
      users.put(principal, profile);
    };
    
    lastActionTimes := HashMap.HashMap<Principal, Nat64>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for ((principal, time) in lastActionEntries.vals()) {
      lastActionTimes.put(principal, time);
    };
  };

  // Helper functions
  private func isAdmin(caller : Principal) : Bool {
    Principal.equal(caller, ADMIN_PRINCIPAL)
  };

  private func checkRateLimit(caller : Principal) : Bool {
    switch (lastActionTimes.get(caller)) {
      case null true;
      case (?lastTime) {
        let now = Nat64.fromIntWrap(Time.now());
        Nat64.greater(now, lastTime + ACTION_COOLDOWN_SECONDS * 1_000_000_000)
      };
    }
  };

  private func updateLastAction(caller : Principal) {
    let now = Nat64.fromIntWrap(Time.now());
    lastActionTimes.put(caller, now);
  };

  private func validateText(text : Text, maxLength : Nat) : Bool {
    text.size() > 0 and text.size() <= maxLength
  };

  private func logActivity(user : Principal, action : Text) {
    let timestamp = Nat64.fromIntWrap(Time.now());
    activityLogEntries := Array.append(activityLogEntries, [(user, action, timestamp)]);
  };

  // Initialize or update user profile
  public shared ({ caller }) func initialize(name : Text, email : Text, referral_code : ?Text) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another request.";
    };
    
    if (not validateText(name, MAX_NAME_LENGTH)) {
      return "Invalid name length. Must be 1-" # Nat.toText(MAX_NAME_LENGTH) # " characters.";
    };
    
    if (not validateText(email, MAX_EMAIL_LENGTH)) {
      return "Invalid email length. Must be 1-" # Nat.toText(MAX_EMAIL_LENGTH) # " characters.";
    };

    let now = Nat64.fromIntWrap(Time.now());
    
    // Check if user already exists
    switch (users.get(caller)) {
      case (?existingUser) {
        // Update existing user
        let updatedUser : UserProfile = {
          name = name;
          email = email;
          location = existingUser.location;
          referral_code = referral_code;
          engagement = existingUser.engagement;
          created_at = existingUser.created_at;
          last_login = now;
          modules_accessed = existingUser.modules_accessed;
          total_actions = existingUser.total_actions + 1;
          preferences = existingUser.preferences;
        };
        users.put(caller, updatedUser);
        updateLastAction(caller);
        logActivity(caller, "profile_updated");
        "Profile updated successfully."
      };
      case null {
        // Create new user
        let defaultPreferences : UserPreferences = {
          notifications = true;
          theme = "dark";
          language = "en";
          privacy_level = "public";
        };
        
        let newUser : UserProfile = {
          name = name;
          email = email;
          location = "Unknown"; // Could be enhanced with geolocation
          referral_code = referral_code;
          engagement = 0;
          created_at = now;
          last_login = now;
          modules_accessed = [];
          total_actions = 1;
          preferences = defaultPreferences;
        };
        users.put(caller, newUser);
        updateLastAction(caller);
        logActivity(caller, "profile_created");
        "Profile created successfully."
      };
    }
  };

  // Get user profile data
  public shared query ({ caller }) func get_user_data() : async ?UserProfile {
    users.get(caller)
  };

  // Update user preferences
  public shared ({ caller }) func update_preferences(preferences : UserPreferences) : async Text {
    if (not checkRateLimit(caller)) {
      return "Please wait before making another request.";
    };

    switch (users.get(caller)) {
      case null "User not found. Please initialize your profile first.";
      case (?user) {
        let updatedUser : UserProfile = {
          name = user.name;
          email = user.email;
          location = user.location;
          referral_code = user.referral_code;
          engagement = user.engagement;
          created_at = user.created_at;
          last_login = Nat64.fromIntWrap(Time.now());
          modules_accessed = user.modules_accessed;
          total_actions = user.total_actions + 1;
          preferences = preferences;
        };
        users.put(caller, updatedUser);
        updateLastAction(caller);
        logActivity(caller, "preferences_updated");
        "Preferences updated successfully."
      };
    }
  };

  // Track module access
  public shared ({ caller }) func track_module_access(module_name : Text) : async Text {
    switch (users.get(caller)) {
      case null "User not found. Please initialize your profile first.";
      case (?user) {
        // Add module to accessed list if not already there
        let hasAccessed = Array.find<Text>(user.modules_accessed, func(m : Text) : Bool { m == module_name });
        let updatedModules = switch (hasAccessed) {
          case null Array.append<Text>(user.modules_accessed, [module_name]);
          case (?_) user.modules_accessed;
        };
        
        let updatedUser : UserProfile = {
          name = user.name;
          email = user.email;
          location = user.location;
          referral_code = user.referral_code;
          engagement = user.engagement + 1;
          created_at = user.created_at;
          last_login = Nat64.fromIntWrap(Time.now());
          modules_accessed = updatedModules;
          total_actions = user.total_actions + 1;
          preferences = user.preferences;
        };
        users.put(caller, updatedUser);
        logActivity(caller, "module_access:" # module_name);
        "Module access tracked."
      };
    }
  };

  // Get user statistics
  public shared query ({ caller }) func get_user_stats() : async ?UserStats {
    switch (users.get(caller)) {
      case null null;
      case (?user) {
        let now = Nat64.fromIntWrap(Time.now());
        let daysSinceJoin = (now - user.created_at) / (24 * 60 * 60 * 1_000_000_000);
        let joinDate = formatTimestamp(user.created_at);
        let lastActive = formatTimestamp(user.last_login);
        
        ?{
          days_active = Nat64.toNat(daysSinceJoin);
          modules_count = user.modules_accessed.size();
          total_modules = 11; // Total number of modules in the system
          join_date = joinDate;
          last_active = lastActive;
        }
      };
    }
  };

  // Helper function to format timestamp (basic implementation)
  private func formatTimestamp(timestamp : Nat64) : Text {
    // This is a simplified version - in production you might want more sophisticated date formatting
    let days = timestamp / (24 * 60 * 60 * 1_000_000_000);
    "Day " # Nat64.toText(days)
  };

  // Admin functions
  public shared ({ caller }) func admin_get_all_users() : async [UserProfile] {
    if (not isAdmin(caller)) {
      return [];
    };
    Iter.toArray(users.vals())
  };

  public shared ({ caller }) func admin_get_user_count() : async Nat {
    if (not isAdmin(caller)) {
      return 0;
    };
    users.size()
  };

  public shared ({ caller }) func admin_get_activity_log(limit : Nat) : async [(Principal, Text, Nat64)] {
    if (not isAdmin(caller)) {
      return [];
    };
    let logSize = activityLogEntries.size();
    if (limit >= logSize) {
      activityLogEntries
    } else {
      Array.tabulate<(Principal, Text, Nat64)>(limit, func(i) = activityLogEntries[logSize - 1 - i])
    }
  };

  // Public query functions
  public query func get_total_users() : async Nat {
    users.size()
  };
} 
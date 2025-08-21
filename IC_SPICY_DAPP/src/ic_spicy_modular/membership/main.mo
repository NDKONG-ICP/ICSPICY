import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Constants "../Constants";

actor {
  // Use Constants.ADMIN_PRINCIPAL and canister IDs instead of hardcoded values.
  // Admin principal - should be set to the actual admin principal
  private let ADMIN_PRINCIPAL : Principal = Constants.ADMIN_PRINCIPAL;
  
  // Membership tiers
  public type MembershipTier = {
    #Basic;
    #Premium;
    #Elite;
  };

  // Member record
  public type Member = {
    principal : Principal;
    tier : MembershipTier;
    joined : Nat64;
    last_upgrade : Nat64;
  };

  // Stable array for persistence
  stable var membersArr : [Member] = [];
  // Non-stable HashMap for fast lookup (rebuilt on init)
  var members : HashMap.HashMap<Principal, Member> = HashMap.HashMap<Principal, Member>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });

  // Rate limiting for membership operations
  private var lastOperationTime : HashMap.HashMap<Principal, Nat64> = HashMap.HashMap<Principal, Nat64>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  private let OPERATION_COOLDOWN_SECONDS : Nat64 = 60; // 1 minute

  // On canister init, rebuild HashMap from array
  system func preupgrade() {
    membersArr := Iter.toArray(members.vals());
  };
  system func postupgrade() {
    members := HashMap.HashMap<Principal, Member>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for (m in membersArr.vals()) {
      members.put(m.principal, m);
    }
  };

  // Helper function to check if caller is admin
  private func isAdmin(caller : Principal) : Bool {
    Principal.equal(caller, ADMIN_PRINCIPAL)
  };

  // Helper function to check rate limiting
  private func checkRateLimit(caller : Principal) : Bool {
    switch (lastOperationTime.get(caller)) {
      case null true;
      case (?lastTime) {
        let now = Nat64.fromIntWrap(Time.now());
        Nat64.greater(now, lastTime + OPERATION_COOLDOWN_SECONDS)
      };
    }
  };

  // Amount of $SPICY required for each tier (example values)
  func required_spicy(tier : MembershipTier) : Nat {
    switch (tier) {
      case (#Basic) 0;
      case (#Premium) 1000_000_000; // 1 $SPICY (example, 8 decimals)
      case (#Elite) 10_000_000_000; // 10 $SPICY
    }
  };

  // Public query for frontend
  public query func get_required_spicy(tier : MembershipTier) : async Nat {
    required_spicy(tier)
  };

  // Enhanced $SPICY payment check with validation
  func check_spicy_payment(caller : Principal, amount : Nat) : Bool {
    // TODO: Integrate with wallet/token canister for real payment verification
    // For now, implement basic validation
    if (amount == 0) return true; // Basic tier is free
    if (amount > 100_000_000_000) return false; // Prevent excessive amounts
    // In production, this should call the wallet canister to verify actual balance and transfer
    true
  };

  // Join membership (pay $SPICY)
  public shared ({ caller }) func join_membership(tier : MembershipTier) : async Text {
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another membership operation.";
    };
    
    // Check if already a member
    if (members.get(caller) != null) {
      return "Already a member.";
    };
    
    let required = required_spicy(tier);
    
    // Validate tier requirements
    if (tier == #Elite) {
      // Elite tier might require additional validation
      if (required > 50_000_000_000) {
        return "Elite tier requires special approval.";
      };
    };
    
    if (not check_spicy_payment(caller, required)) {
      return "Insufficient $SPICY payment.";
    };
    
    let now = Nat64.fromIntWrap(Time.now());
    let member : Member = { 
      principal = caller; 
      tier = tier; 
      joined = now;
      last_upgrade = now;
    };
    members.put(caller, member);
    membersArr := Iter.toArray(members.vals());
    
    // Update rate limiting
    lastOperationTime.put(caller, now);
    
    "Joined as " # (switch tier { case (#Basic) "Basic"; case (#Premium) "Premium"; case (#Elite) "Elite" }) # " member!";
  };

  // Upgrade membership (pay $SPICY)
  public shared ({ caller }) func upgrade_membership(newTier : MembershipTier) : async Text {
    // Rate limiting
    if (not checkRateLimit(caller)) {
      return "Please wait before making another membership operation.";
    };
    
    switch (members.get(caller)) {
      case null return "Not a member.";
      case (?member) {
        if (member.tier == newTier) return "Already at this tier.";
        
        // Prevent downgrading (security measure)
        if (member.tier == #Elite and newTier != #Elite) {
          return "Cannot downgrade from Elite tier.";
        };
        
        let required = required_spicy(newTier);
        
        // Validate upgrade requirements
        if (newTier == #Elite) {
          // Elite tier might require additional validation
          if (required > 50_000_000_000) {
            return "Elite tier requires special approval.";
          };
        };
        
        if (not check_spicy_payment(caller, required)) {
          return "Insufficient $SPICY payment.";
        };
        
        let now = Nat64.fromIntWrap(Time.now());
        let upgraded : Member = { 
          principal = caller; 
          tier = newTier; 
          joined = member.joined;
          last_upgrade = now;
        };
        members.put(caller, upgraded);
        membersArr := Iter.toArray(members.vals());
        
        // Update rate limiting
        lastOperationTime.put(caller, now);
        
        return "Upgraded to " # (switch newTier { case (#Basic) "Basic"; case (#Premium) "Premium"; case (#Elite) "Elite" }) # "!";
      }
    }
  };

  // Get membership status
  public func get_membership_status(caller : Principal) : async ?Member {
    members.get(caller)
  };

  // List all members (admin only)
  public shared({ caller }) func list_members() : async [Member] {
    if (not isAdmin(caller)) {
      return [];
    };
    Iter.toArray(members.vals())
  };

  // Admin function to remove member
  public shared({ caller }) func remove_member(member_principal : Principal) : async Text {
    if (not isAdmin(caller)) {
      return "Only admin can remove members.";
    };
    
    switch (members.get(member_principal)) {
      case null return "Member not found.";
      case (?member) {
        members.delete(member_principal);
        membersArr := Iter.toArray(members.vals());
        return "Member removed successfully.";
      }
    }
  };

  // Admin function to set admin principal
  public shared({ caller }) func set_admin(new_admin : Principal) : async Text {
    if (not isAdmin(caller)) {
      return "Only current admin can change admin.";
    };
    // Note: This would require a mutable variable for ADMIN_PRINCIPAL
    // For now, we'll keep it as a constant for security
    "Admin principal is set as a constant for security.";
  };

  // Get membership statistics (admin only)
  public shared({ caller }) func get_membership_stats() : async { total_members : Nat; basic_count : Nat; premium_count : Nat; elite_count : Nat } {
    if (not isAdmin(caller)) {
      return { total_members = 0; basic_count = 0; premium_count = 0; elite_count = 0 };
    };
    
    var total : Nat = 0;
    var basic : Nat = 0;
    var premium : Nat = 0;
    var elite : Nat = 0;
    
    for (member in members.vals()) {
      total += 1;
      switch (member.tier) {
        case (#Basic) basic += 1;
        case (#Premium) premium += 1;
        case (#Elite) elite += 1;
      };
    };
    
    { total_members = total; basic_count = basic; premium_count = premium; elite_count = elite }
  };
} 
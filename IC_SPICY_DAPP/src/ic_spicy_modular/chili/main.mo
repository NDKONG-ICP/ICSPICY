import Array "mo:base/Array";
import Int "mo:base/Int";
import Time "mo:base/Time";

actor {
  // Chili fact type
  type ChiliFact = {
    id : Nat;
    title : Text;
    fact : Text;
    author : Text;
    timestamp : Int;
  };

  // Stable storage for facts
  stable var facts : [ChiliFact] = [];
  stable var nextId : Nat = 1;

  // Add a new chili fact
  public shared func add_fact(title : Text, fact : Text, author : Text) : async Nat {
    let newFact = {
      id = nextId;
      title = title;
      fact = fact;
      author = author;
      timestamp = Int.abs(Time.now());
    };
    facts := Array.append<ChiliFact>(facts, [newFact]);
    nextId += 1;
    newFact.id
  };

  // Get a chili fact by id
  public query func get_fact(id : Nat) : async ?ChiliFact {
    Array.find<ChiliFact>(facts, func (f) { f.id == id })
  };

  // List all chili facts
  public query func list_facts() : async [ChiliFact] {
    facts
  };

  // Example inter-canister call (unchanged)
  public shared func get_chili_fact() : async Text {
    let blog_canister : actor { get_blog_info : () -> async Text } = actor("l4gsl-gyaaa-aaaap-qp5ma-cai");
    let blog_info = await blog_canister.get_blog_info();
    "Chili fact with blog info: " # blog_info
  }
} 
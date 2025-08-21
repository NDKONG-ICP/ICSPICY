import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Time "mo:base/Time";

actor {
  // Simple post type matching deployed canister exactly
  public type Post = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    timestamp : Int;
  };

  // Stable storage matching deployed canister exactly
  stable var posts : [Post] = [];
  stable var nextId : Nat = 1;

  // Methods matching deployed canister exactly
  public shared query func list_posts() : async [Post] {
    posts
  };

  public shared query func get_blog_info() : async Text {
    "IC SPICY Blog - Pepper Growing Community"
  };

  public shared ({ caller }) func add_post(title : Text, content : Text, author : Text) : async Nat {
    let newPost : Post = {
      id = nextId;
      title = title;
      content = content;
      author = author;
      timestamp = Int.abs(Time.now());
    };
    
    posts := Array.append(posts, [newPost]);
    nextId += 1;
    newPost.id
  };

  // ICRC-21 Consent Management Methods (NEW - these are the only additions)
  public shared query func icrc21_canister_call_consent_message() : async ?Text {
    ?"This canister may call other canisters on your behalf. By approving this request, you consent to allow this canister to make calls to other canisters in the IC network. This is necessary for the blog functionality to work properly."
  };

  public shared query func icrc21_canister_call_consent_message_preview() : async ?Text {
    ?"This canister may call other canisters on your behalf. By approving this request, you consent to allow this canister to make calls to other canisters in the IC network. This is necessary for the blog functionality to work properly."
  };

  public shared query func icrc21_canister_call_consent_message_url() : async ?Text {
    ?"https://oo7fg-waaaa-aaaap-qp5sq-cai.icp0.io/blog"
  };

  public shared query func icrc21_canister_call_consent_message_metadata() : async ?[Text] {
    ?["blog", "consent", "canister-calls"]
  };
} 
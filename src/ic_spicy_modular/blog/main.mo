// Blog Dapp main.mo
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";

actor {
  module Result {
    public type Result<Ok, Err> = { #ok : Ok; #err : Err };
  };
  type Post = { id : Nat; user : Principal; text : Text; photo : ?Blob; tips : Nat; reactions : [(Principal, Text)] };

  stable var posts : [Post] = [];

  public shared ({ caller }) func create_post(text : Text, photo : ?Blob) : async Result.Result<Nat, Text> {
    if (Option.isSome(photo) and Blob.toArray(Option.get(photo, Blob.fromArray([]))).size() > 1_000_000) return #err("Photo too large");
    let id = Array.size(posts);
    posts := Array.append(posts, [{ id = id; user = caller; text = text; photo = photo; tips = 0; reactions = [] }]);
    #ok(id)
  };

  public shared ({ caller }) func react_to_post(post_id : Nat, emoji : Text) : async Result.Result<(), Text> {
    if (post_id >= Array.size(posts)) return #err("Post not found");
    let post = posts[post_id];
    let updated_post : Post = {
      id = post.id;
      user = post.user;
      text = post.text;
      photo = post.photo;
      tips = post.tips;
      reactions = Array.append(post.reactions, [(caller, emoji)]);
    };
    posts := Array.tabulate(Array.size(posts), func (i : Nat) : Post { if (i == post_id) updated_post else posts[i] });
    #ok(())
  };

  public shared ({ caller }) func tip_post(post_id : Nat, amount : Nat, token : Text) : async Result.Result<(), Text> {
    if (post_id >= Array.size(posts)) return #err("Post not found");
    let post = posts[post_id];
    let updated_post : Post = {
      id = post.id;
      user = post.user;
      text = post.text;
      photo = post.photo;
      tips = post.tips + amount;
      reactions = post.reactions;
    };
    posts := Array.tabulate(Array.size(posts), func (i : Nat) : Post { if (i == post_id) updated_post else posts[i] });
    #ok(())
  };

  // TODO: Implement blog logic
} 
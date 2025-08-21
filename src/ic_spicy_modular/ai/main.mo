// Spicy AI Dapp main.mo
import Text "mo:base/Text";
import Option "mo:base/Option";
import Array "mo:base/Array";

module Result {
  public type Result<Ok, Err> = { #ok : Ok; #err : Err };
};

actor {
  // TODO: Implement AI logic

  public shared query ({ caller }) func ask_ai(question : Text) : async Text {
    let location = "Unknown";
    let ollamaResponse = call_ollama(location, question);
    if (Text.contains(ollamaResponse, #text "error")) "Ollama snoozed! Try pH 6.0, champ! 🌶️" else ollamaResponse
  };

  func call_ollama(location : Text, question : Text) : Text {
    // Mocked response for local dev
    "Witty almanac for " # location # ": " # question # " (mocked)"
  };
} 
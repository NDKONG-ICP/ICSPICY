import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Constants "../Constants";

actor {
  // AI Response type
  public type AIResponse = {
    id : Nat;
    question : Text;
    answer : Text;
    user : Principal;
    timestamp : Int;
    category : Text; // "weather", "farming", "general", "chili"
    confidence : Float;
  };

  // Weather data type
  public type WeatherData = {
    temperature : Float;
    humidity : Float;
    pressure : Float;
    wind_speed : Float;
    description : Text;
    location : Text;
    timestamp : Int;
  };

  // Farming advice type
  public type FarmingAdvice = {
    id : Nat;
    crop : Text;
    advice : Text;
    season : Text;
    difficulty : Text;
    tips : [Text];
  };

  // Stable storage
  stable var aiResponsesArr : [AIResponse] = [];
  stable var weatherDataArr : [WeatherData] = [];
  stable var farmingAdviceArr : [FarmingAdvice] = [];
  stable var nextResponseId : Nat = 1;
  stable var nextAdviceId : Nat = 1;

  // Non-stable HashMaps for fast lookup
  var aiResponses : HashMap.HashMap<Principal, [AIResponse]> = HashMap.HashMap<Principal, [AIResponse]>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
  var weatherData : HashMap.HashMap<Text, WeatherData> = HashMap.HashMap<Text, WeatherData>(10, Text.equal, func(t : Text) : Nat32 { 0 });

  // Farming knowledge base
  let farmingKnowledgeBase : [FarmingAdvice] = [
    {
      id = 1;
      crop = "Jalapeño";
      advice = "Plant in well-draining soil with full sun exposure. Water regularly but avoid overwatering.";
      season = "Spring";
      difficulty = "Easy";
      tips = ["Start seeds indoors 6-8 weeks before last frost", "Plant 18-24 inches apart", "Harvest when green or red"];
    },
    {
      id = 2;
      crop = "Habanero";
      advice = "Requires hot weather and consistent moisture. Best grown in containers in cooler climates.";
      season = "Late Spring";
      difficulty = "Medium";
      tips = ["Needs 90+ days to mature", "Prefers temperatures 70-90°F", "Harvest when orange or red"];
    },
    {
      id = 3;
      crop = "Ghost Pepper";
      advice = "Extremely hot pepper requiring careful handling. Best for experienced growers.";
      season = "Late Spring";
      difficulty = "Hard";
      tips = ["Wear gloves when handling", "Needs 120+ days to mature", "Extremely hot - handle with care"];
    },
    {
      id = 4;
      crop = "Bell Pepper";
      advice = "Sweet pepper variety, great for beginners. Requires consistent watering and full sun.";
      season = "Spring";
      difficulty = "Easy";
      tips = ["Plant after last frost", "Water at base of plant", "Harvest when firm and fully colored"];
    },
    {
      id = 5;
      crop = "Serrano";
      advice = "Medium heat pepper, good for salsas and cooking. Tolerates some drought.";
      season = "Spring";
      difficulty = "Easy";
      tips = ["Plant 12-18 inches apart", "Harvest when 2-3 inches long", "Good for hot sauces"];
    }
  ];

  // System functions for persistence
  system func preupgrade() {
    aiResponsesArr := Array.flatten<AIResponse>(Iter.toArray(aiResponses.vals()));
    weatherDataArr := Iter.toArray(weatherData.vals());
    farmingAdviceArr := farmingKnowledgeBase;
  };

  system func postupgrade() {
    aiResponses := HashMap.HashMap<Principal, [AIResponse]>(10, Principal.equal, func(p : Principal) : Nat32 { 0 });
    for (response in aiResponsesArr.vals()) {
      switch (aiResponses.get(response.user)) {
        case null { aiResponses.put(response.user, [response]) };
        case (?userResponses) { aiResponses.put(response.user, Array.append(userResponses, [response])) };
      };
    };
    
    weatherData := HashMap.HashMap<Text, WeatherData>(10, Text.equal, func(t : Text) : Nat32 { 0 });
    for (wd in weatherDataArr.vals()) {
      weatherData.put(wd.location, wd);
    };
  };

  // Main AI question handler
  public shared ({ caller }) func ask_ai(question : Text) : async Text {
    let response = await processQuestion(caller, question);
    
    // Store the response
    let aiResponse : AIResponse = {
      id = nextResponseId;
      question = question;
      answer = response;
      user = caller;
      timestamp = Int.abs(Time.now());
      category = determineCategory(question);
      confidence = 0.85; // Default confidence
    };
    
    switch (aiResponses.get(caller)) {
      case null { aiResponses.put(caller, [aiResponse]) };
      case (?userResponses) { aiResponses.put(caller, Array.append(userResponses, [aiResponse])) };
    };
    
    nextResponseId += 1;
    response
  };

  // Process the question and generate response
  private func processQuestion(user : Principal, question : Text) : async Text {
    // Weather-related questions
    if (Text.contains(question, #text "weather") or Text.contains(question, #text "temperature") or Text.contains(question, #text "climate")) {
      return await getWeatherAdvice(question);
    };
    
    // Farming-related questions
    if (Text.contains(question, #text "plant") or Text.contains(question, #text "grow") or Text.contains(question, #text "soil") or Text.contains(question, #text "water")) {
      return await getFarmingAdvice(question);
    };
    
    // Chili-specific questions
    if (Text.contains(question, #text "chili") or Text.contains(question, #text "pepper") or Text.contains(question, #text "hot") or Text.contains(question, #text "spicy")) {
      return await getChiliAdvice(question);
    };
    
    // General farming questions
    if (Text.contains(question, #text "farm") or Text.contains(question, #text "garden") or Text.contains(question, #text "harvest")) {
      return await getGeneralFarmingAdvice(question);
    };
    
    // Default response
    "I'm here to help with your farming and chili growing questions! Ask me about weather, planting, soil conditions, or specific chili varieties. For example: 'What's the best time to plant jalapeños?' or 'How do I care for ghost peppers?'"
  };

  // Get weather-related advice
  private func getWeatherAdvice(question : Text) : async Text {
    "🌤️ Weather Advice: For optimal chili growing, maintain temperatures between 70-90°F (21-32°C). Ensure good air circulation and avoid frost. Most chili varieties need full sun (6-8 hours daily). Water in the morning to prevent fungal diseases. Monitor humidity levels - too high can cause mold, too low can stress plants."
  };

  // Get farming advice
  private func getFarmingAdvice(question : Text) : async Text {
    "🌱 Farming Tips: Start seeds indoors 6-8 weeks before last frost. Use well-draining soil with pH 6.0-7.0. Plant 18-24 inches apart for good air circulation. Water consistently but avoid overwatering. Fertilize monthly with balanced fertilizer. Prune lower leaves to improve air flow and reduce disease risk."
  };

  // Get chili-specific advice
  private func getChiliAdvice(question : Text) : async Text {
    "🌶️ Chili Growing Guide: Different varieties have different needs. Jalapeños are great for beginners. Habaneros need more heat and time. Ghost peppers require extreme care and patience. Always wear gloves when handling hot peppers. Harvest when fully colored for maximum heat. Store in cool, dry place or freeze for long-term storage."
  };

  // Get general farming advice
  private func getGeneralFarmingAdvice(question : Text) : async Text {
    "🏡 General Farming: Success starts with good soil preparation. Test your soil pH and amend as needed. Use crop rotation to prevent disease. Companion planting with herbs can deter pests. Regular monitoring for pests and diseases is crucial. Keep records of what works in your specific climate and conditions."
  };

  // Determine question category
  private func determineCategory(question : Text) : Text {
    if (Text.contains(question, #text "weather") or Text.contains(question, #text "temperature")) {
      "weather"
    } else if (Text.contains(question, #text "chili") or Text.contains(question, #text "pepper")) {
      "chili"
    } else if (Text.contains(question, #text "plant") or Text.contains(question, #text "grow")) {
      "farming"
    } else {
      "general"
    }
  };

  // Get user's AI conversation history
  public shared query func getConversationHistory(user : Principal) : async [AIResponse] {
    switch (aiResponses.get(user)) {
      case null { [] };
      case (?userResponses) { userResponses };
    };
  };

  // Get farming advice by crop
  public shared query func getFarmingAdviceByCrop(crop : Text) : async ?FarmingAdvice {
    Array.find<FarmingAdvice>(farmingKnowledgeBase, func advice { 
      Text.contains(advice.crop, #text crop)
    })
  };

  // Get all farming advice
  public shared query func getAllFarmingAdvice() : async [FarmingAdvice] {
    farmingKnowledgeBase
  };

  // Add weather data (for future integration)
  public shared ({ caller }) func addWeatherData(location : Text, temperature : Float, humidity : Float, pressure : Float, wind_speed : Float, description : Text) : async Bool {
    if (not Principal.equal(caller, Principal.fromText(Constants.ADMIN_PRINCIPAL_TEXT))) {
      return false;
    };
    
    let weatherDataEntry : WeatherData = {
      temperature = temperature;
      humidity = humidity;
      pressure = pressure;
      wind_speed = wind_speed;
      description = description;
      location = location;
      timestamp = Int.abs(Time.now());
    };
    
    weatherData.put(location, weatherDataEntry);
    true
  };

  // Get weather data for location
  public shared query func getWeatherData(location : Text) : async ?WeatherData {
    weatherData.get(location)
  };

  // Get AI service statistics
  public shared query func getAIStats() : async { total_questions : Nat; total_users : Nat; categories : [Text] } {
    let total_questions = aiResponsesArr.size();
    let total_users = aiResponses.size();
    let categories = ["weather", "farming", "chili", "general"];
    { total_questions = total_questions; total_users = total_users; categories = categories }
  };
} 
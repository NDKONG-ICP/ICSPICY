import React, { useState, useEffect } from 'react';
import InteractiveButton from '../components/InteractiveButton';
import { useWallet } from '../WalletContext';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import { useAgent, useIdentityKit } from '@nfid/identitykit/react';
import { idlFactory as deepseekIdl } from '../declarations/deepseek_agent';
import { idlFactory as membershipIdl } from '../declarations/membership';
import { CANISTER_IDS } from '../config';

const AI_GATEWAY_URL = process.env.REACT_APP_AI_GATEWAY_URL || 'https://spicy-ai-gateway.floridaman.workers.dev';

const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';

const vegetableAlmanac = {
  'temperate': [
    { name: 'Tomatoes', tips: 'Plant after last frost. Full sun. Water regularly.' },
    { name: 'Lettuce', tips: 'Plant in early spring or fall. Partial shade. Keep soil moist.' },
    { name: 'Carrots', tips: 'Loose, sandy soil. Sow directly. Thin seedlings.' },
  ],
  'tropical': [
    { name: 'Peppers', tips: 'Warm soil. Full sun. Fertilize monthly.' },
    { name: 'Eggplant', tips: 'Plant in late spring. Needs heat. Stake plants.' },
    { name: 'Okra', tips: 'Plant in late spring. Full sun. Tolerates heat.' },
  ],
  'arid': [
    { name: 'Squash', tips: 'Plant after last frost. Mulch to retain moisture.' },
    { name: 'Melons', tips: 'Full sun. Water deeply but infrequently.' },
    { name: 'Beans', tips: 'Tolerates heat. Water at base. Mulch.' },
  ],
  'cold': [
    { name: 'Cabbage', tips: 'Plant in early spring. Tolerates frost.' },
    { name: 'Spinach', tips: 'Plant in early spring or fall. Prefers cool weather.' },
    { name: 'Peas', tips: 'Plant as soon as soil can be worked. Needs support.' },
  ]
};

function getClimateZone(tempC) {
  if (tempC >= 25) return 'tropical';
  if (tempC >= 15) return 'temperate';
  if (tempC >= 5) return 'arid';
  return 'cold';
}

function cToF(c) { return Math.round((c * 9) / 5 + 32); }

const weatherIcons = {
  sun: '🌞',
  cloud: '⛅',
  snow: '❄️',
  rain: '🌧️',
  storm: '⛈️',
  fog: '🌫️',
  clear: '☀️',
  partly_cloudy: '🌤️',
  cloudy: '☁️',
  drizzle: '🌦️',
  heavy_rain: '🌧️',
  thunderstorm: '⛈️',
  sleet: '🌨️',
  hail: '🧊',
  mist: '🌫️',
  smoke: '💨',
  dust: '🌪️',
  sand: '🏜️',
  ash: '🌋',
  tornado: '🌪️',
  hurricane: '🌀'
};

function getWeatherIcon(temp, code) {
  if (code >= 70) return weatherIcons.snow;
  if (code >= 60) return weatherIcons.storm;
  if (code >= 50) return weatherIcons.rain;
  if (code >= 40) return weatherIcons.fog;
  if (temp > 25) return weatherIcons.sun;
  if (temp < 5) return weatherIcons.snow;
  return weatherIcons.cloud;
}

// Weather image placeholder - using a gradient background instead of external image
const WEATHER_IMAGE = null;

const AiPage = () => {
  const { principal: walletPrincipal, plugConnected, canisters, connectPlug } = useWallet();
  const { user } = useIdentityKit();
  const oisyAgent = useAgent();
  
  // Core state
  const [deepseekActor, setDeepseekActor] = useState(null);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [climateZone, setClimateZone] = useState(null);
  const [showF, setShowF] = useState(false);
  
  // Enhanced AI interaction
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions] = useState([
    "What's the optimal pH for growing chili peppers?",
    "When should I plant peppers in my climate?",
    "How often should I water my pepper plants?",
    "What are the best fertilizers for hot peppers?",
    "How do I prevent pest damage on my chili plants?",
    "What temperature range is ideal for pepper growth?"
  ]);
  
  // User and membership
  const [membership, setMembership] = useState(null);
  
  // Enhanced features
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'weather', 'almanac', 'tools'

  const effectivePrincipal = React.useMemo(() => {
    if (user?.principal?.toText) return user.principal.toText();
    if (walletPrincipal) return String(walletPrincipal);
    return null;
  }, [user, walletPrincipal]);

  const isConnected = plugConnected || oisyAgent;

  const askViaGateway = async (q) => {
    const res = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q })
    });
    if (!res.ok) throw new Error('gateway_not_ok');
    return await res.text();
  };

  useEffect(() => {
    setDeepseekActor(canisters?.deepseek_agent || null);
  }, [canisters]);

  // Simple weather loading effect for demo
  useEffect(() => {
    // Load demo weather data
    setTimeout(() => {
      setWeather({
        temperature: 24,
        windspeed: 12,
        weathercode: 10
      });
      setClimateZone('temperate');
      setLocation({ lat: 40.7128, lon: -74.0060 });
    }, 1000);
  }, []);

  const almanac = vegetableAlmanac[climateZone] || vegetableAlmanac['temperate'];

  // Get membership tier for premium features
  const getMembershipTier = () => {
    if (!membership || !membership.tier) return null;
    return Object.keys(membership.tier)[0];
  };

  const membershipTier = getMembershipTier();
  const isPremium = membershipTier === 'Premium' || membershipTier === 'Elite';

  // Load membership status
  useEffect(() => {
    const loadMembership = async () => {
      if (effectivePrincipal && (canisters.membership || oisyAgent)) {
        try {
          const membershipActor = canisters.membership || Actor.createActor(membershipIdl, { 
            agent: oisyAgent, 
            canisterId: CANISTER_IDS.membership 
          });
          const membershipStatus = await membershipActor.get_membership_status(Principal.fromText(effectivePrincipal));
          setMembership(membershipStatus?.[0] || null);
        } catch (err) {
          console.warn('Failed to load membership:', err);
        }
      }
    };
    
    loadMembership();
  }, [effectivePrincipal, canisters.membership, oisyAgent]);

  // Enhanced AI interaction with chat history
  const handleAsk = async (questionText = question) => {
    if (!questionText.trim()) return;
    
    const userMessage = { type: 'user', content: questionText, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setIsTyping(true);
    setError(null);
    
    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let aiResponse = "";
      
    try {
      // Try Cloudflare Worker first (browser fetch avoids IC IPv6 constraints)
        aiResponse = await askViaGateway(questionText);
    } catch (e1) {
      try {
        // Fallback to canister actor
        if (!deepseekActor) throw new Error('AI agent not ready');
          const res = await deepseekActor.ask_deepseek(questionText);
          aiResponse = String(res);
      } catch (e2) {
          // Fallback to smart responses based on keywords
          aiResponse = generateSmartResponse(questionText);
        }
      }
      
      const aiMessage = { type: 'ai', content: aiResponse, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiMessage]);
      setAnswer(aiResponse);
    } catch (err) {
      setError('AI temporarily unavailable. Please try again later.');
      const errorMessage = { type: 'ai', content: 'Sorry, I\'m having trouble connecting right now. Please try again later!', timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Smart fallback responses for common questions
  const generateSmartResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('ph') || q.includes('acid')) {
      return "🌶️ For chili peppers, the optimal pH range is 6.0-6.8. Slightly acidic soil helps with nutrient uptake. You can test your soil with a pH meter and adjust with lime (to raise) or sulfur (to lower) as needed.";
    }
    
    if (q.includes('water') || q.includes('irrigation')) {
      return "💧 Water chili peppers deeply but infrequently. Allow soil to dry slightly between waterings. Overwatering can cause root rot, while underwatering stresses the plant. In hot weather, daily watering may be needed.";
    }
    
    if (q.includes('fertilizer') || q.includes('nutrients')) {
      return "🌱 Use a balanced fertilizer (10-10-10) early in the season, then switch to low-nitrogen, high-phosphorus fertilizer when flowering begins. Too much nitrogen creates leafy growth at the expense of peppers.";
    }
    
    if (q.includes('temperature') || q.includes('heat') || q.includes('cold')) {
      return "🌡️ Chili peppers love heat! Optimal growing temperature is 70-85°F (21-29°C). They're sensitive to cold - plant after last frost and protect if temperatures drop below 50°F (10°C).";
    }
    
    if (q.includes('pest') || q.includes('bug') || q.includes('insect')) {
      return "🐛 Common pepper pests include aphids, spider mites, and hornworms. Use neem oil for organic control, introduce beneficial insects like ladybugs, and inspect plants regularly. Healthy plants resist pests better.";
    }
    
    if (q.includes('plant') || q.includes('seed') || q.includes('germination')) {
      return "🌱 Start pepper seeds indoors 8-10 weeks before last frost. Seeds need 80-85°F for germination. Transplant outside when soil temperature is consistently above 60°F. Space plants 18-24 inches apart.";
    }
    
    return "🌶️ Great question! I'd love to help you grow amazing chili peppers. For the most accurate advice, please connect your wallet to access our premium AI features, or try asking about specific topics like pH levels, watering, fertilizers, or pest control.";
  };

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-white mb-4">Spicy AI Assistant</h1>
          <p className="text-xl text-gray-300 mb-2">
            Your intelligent farming companion for growing perfect peppers
          </p>
          {membershipTier && (
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isPremium ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white' : 'bg-gray-600 text-gray-200'
              }`}>
                {membershipTier === 'Basic' ? '🌶️ Street Team' : membershipTier === 'Elite' ? '🔥 Spicy Chads' : `👑 ${membershipTier}`} Member
                {isPremium && ' - Premium AI Features Unlocked!'}
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="glass-card-dark p-2 border border-white/10">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'chat', label: 'AI Chat', icon: '💬' },
              { id: 'weather', label: 'Weather', icon: '🌤️' },
              { id: 'almanac', label: 'Growing Guide', icon: '📚' },
              { id: 'tools', label: 'Smart Tools', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          </div>
          
        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="glass-card-dark p-6 border border-white/10 max-h-96 overflow-y-auto space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                        : 'bg-white/10 text-gray-200 border border-white/20'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-gray-200 border border-white/20 px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                        <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
              </div>
            )}

            {/* Quick Questions */}
            {chatHistory.length === 0 && (
              <div className="glass-card-dark p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">🌶️ Quick Start Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => handleAsk(q)}
                      className="p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-gray-300 hover:text-white text-sm"
                    >
                      {q}
                    </button>
                  ))}
              </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="glass-card-dark p-6 border border-white/10">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleAsk()}
                  className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Ask me anything about growing chili peppers..."
                  disabled={loading}
                />
                <button
                  onClick={() => handleAsk()}
                  disabled={loading || !question.trim()}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? '🤔 Thinking...' : '🚀 Ask AI'}
                </button>
              </div>
              
              {!isConnected && (
                <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                  <div className="flex items-center space-x-2 text-amber-200">
                    <span>💡</span>
                    <span className="text-sm">
                      Connect your wallet to unlock premium AI features and personalized advice!
                    </span>
              </div>
              </div>
              )}
            </div>

            {error && (
              <div className="glass-card-dark p-4 border border-red-500/40 bg-red-900/20">
                <p className="text-red-200">{error}</p>
                </div>
            )}
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>🌤️</span>
                <span>Local Weather & Climate</span>
              </h3>
              
              {weather ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getWeatherIcon(weather.temperature, weather.weathercode)}</div>
                      <div className="text-3xl font-bold text-white">
                        {showF ? cToF(weather.temperature) : Math.round(weather.temperature)}°{showF ? 'F' : 'C'}
                      </div>
                      <button 
                        onClick={() => setShowF(!showF)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Switch to °{showF ? 'C' : 'F'}
                      </button>
        </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Wind Speed</span>
                        <span className="text-white">{weather.windspeed} km/h</span>
                        </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Climate Zone</span>
                        <span className="text-emerald-400 capitalize">{climateZone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-white">🌱 Growing Conditions</h4>
                    <div className="space-y-2 text-sm">
                      {weather.temperature >= 15 && weather.temperature <= 30 ? (
                        <div className="text-emerald-400">✅ Excellent temperature for peppers</div>
                      ) : weather.temperature < 15 ? (
                        <div className="text-yellow-400">⚠️ Too cool for optimal growth</div>
                      ) : (
                        <div className="text-red-400">🔥 Very hot - ensure adequate watering</div>
                      )}
                      
                      {weather.windspeed < 20 ? (
                        <div className="text-emerald-400">✅ Wind conditions are favorable</div>
                      ) : (
                        <div className="text-yellow-400">⚠️ Strong winds - consider windbreaks</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-gray-300">Loading weather data for your location...</p>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Growing Guide Tab */}
        {activeTab === 'almanac' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>📚</span>
                <span>Chili Pepper Growing Guide</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {almanac && almanac.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                    <h4 className="font-bold text-emerald-400 mb-2">{item.name}</h4>
                    <p className="text-gray-300 text-sm">{item.tips}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-card-dark p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4">🌶️ Essential Growing Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-emerald-400">🌡️ Temperature</div>
                  <p className="text-gray-300">Peppers thrive in 70-85°F (21-29°C). Start seeds indoors 8-10 weeks before last frost.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-blue-400">💧 Watering</div>
                  <p className="text-gray-300">Deep, infrequent watering. Let soil dry slightly between waterings to prevent root rot.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-purple-400">🌱 Soil</div>
                  <p className="text-gray-300">Well-draining soil with pH 6.0-6.8. Rich in organic matter and slightly acidic.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-amber-400">☀️ Light</div>
                  <p className="text-gray-300">Full sun (6-8 hours daily). South-facing location provides optimal growing conditions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>🔧</span>
                <span>Smart Growing Tools</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">🌡️</div>
                  <h4 className="font-bold text-white mb-2">pH Calculator</h4>
                  <p className="text-gray-300 text-sm">Calculate soil amendments needed for optimal pH levels</p>
                  <div className="mt-3 text-xs text-emerald-400">Coming Soon</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">💧</div>
                  <h4 className="font-bold text-white mb-2">Watering Schedule</h4>
                  <p className="text-gray-300 text-sm">Personalized watering recommendations based on weather</p>
                  <div className="mt-3 text-xs text-emerald-400">Coming Soon</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="font-bold text-white mb-2">Planting Calendar</h4>
                  <p className="text-gray-300 text-sm">Optimal planting times for your specific location</p>
                  <div className="mt-3 text-xs text-emerald-400">Coming Soon</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">🐛</div>
                  <h4 className="font-bold text-white mb-2">Pest Identifier</h4>
                  <p className="text-gray-300 text-sm">AI-powered pest identification and treatment recommendations</p>
                  <div className="mt-3 text-xs text-amber-400">Premium Feature</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-bold text-white mb-2">Growth Tracker</h4>
                  <p className="text-gray-300 text-sm">Track your plants' progress with photos and measurements</p>
                  <div className="mt-3 text-xs text-amber-400">Premium Feature</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-bold text-white mb-2">Harvest Predictor</h4>
                  <p className="text-gray-300 text-sm">Predict optimal harvest times based on variety and conditions</p>
                  <div className="mt-3 text-xs text-amber-400">Premium Feature</div>
                </div>
              </div>
            </div>
            
            {!isPremium && (
              <div className="glass-card-dark p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-xl font-bold text-white mb-2">Unlock Premium AI Tools</h3>
                  <p className="text-gray-300 mb-6">
                    Get access to advanced AI tools, personalized recommendations, and expert growing insights
                  </p>
                  <button 
                    onClick={() => window.location.href = '/membership'}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPage; 

import React from 'react';
import CollapsibleSection from '../components/CollapsibleSection';

const whitepaperMeta = {
  title: 'IC SPICY RWA Co-op Whitepaper',
  subtitle: 'Empowering Specialty Agriculture through Decentralized Ownership, AI Innovation, and SNS Governance',
  author: 'IC SPICY RWA Co-op',
  date: 'June 27, 2025',
  version: '2.1',
  contact: 'whiskeybravospices82@gmail.com | @ICSpicyRWA on X',
};

const executiveSummary = (
  <div className="space-y-4 text-accent-soft text-lg">
    <p>
      The IC SPICY RWA Co-op is a decentralized cooperative on the Internet Computer Protocol (ICP), revolutionizing specialty agriculture by tokenizing premium assets and empowering 5,000 farmers with innovative tools. The cooperative manages 2,500 pepper plants (192,000 pods annually across premium varieties), 1,500 gourmet smoked salt blends, and 100 Plumeria seedlings, while providing members with 20-plant hydroponic kits ($198 each). A proposed SNS (Service Nervous System) launch will enhance decentralized governance, allowing the community to steer the co-op's future.
    </p>
    <ul className="list-disc pl-6 space-y-1">
      <li><b>Membership NFTs:</b> 5,000 ICRC-7 NFTs grant co-op membership, a hydroponic kit, voting rights, profit-sharing ($44,850 Year 1), and access to "Spicy AI," an AI Agent trained on member data for pepper-growing advice and historical insights.</li>
      <li><b>Spicy AI:</b> Offers SOPs (e.g., "Set pH to 6.0 for Reapers") and location-based data (e.g., "Miami 2025 rainfall: 50").</li>
      <li><b>Co-op Portal:</b> Members report horticultural, market, and GPS-based climate data, training Spicy AI.</li>
      <li><b>Personalized Blog:</b> Share gardening posts/photos, tip with SPICY/HEAT tokens.</li>
      <li><b>Crypto Wallet:</b> Chain Fusion with Internet Identity (II) sign-in, supporting SPICY/HEAT/ICP transactions.</li>
      <li><b>SNS Governance:</b> Proposed SNS launch for decentralized decision-making via neuron voting.</li>
      <li><b>NFT Marketplace:</b> 2,500 variety-specific NFTs, redeemable for shaker spices, stakeable for HEAT tokens.</li>
      <li><b>Mascot:</b> @ICSpicyRWA's mascot—a flaming frozen frostbite roll of toilet paper rolling dice—symbolizes the project's bold, playful spirit.</li>
      <li><b>Aesthetic Front End:</b> React/Svelte UI with pepper-themed visuals and intuitive UX.</li>
    </ul>
    <p>
      The co-op projects $1,210,000 net revenue in Year 1, driven by RWA sales ($395,000), NFTs ($16,150), and SPICY tokens ($798,850), with a goal of $7M by Year 3. Seeking $500,000 to expand production and deploy the SNS, IC SPICY blends cooperative ownership, AI innovation, and community governance, compliant with U.S. regulations.
    </p>
  </div>
);

const WhitepaperPage = () => {
  const BACKGROUND_IMAGE = process.env.PUBLIC_URL + '/Whitepaper.jpg';

  return (
    <div className="relative min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #181c24 0%, #23272f 100%)',
        fontFamily: '"Baloo 2", "Comic Neue", "Inter", sans-serif',
      }}
    >
      {/* Background image */}
      <img
        src={BACKGROUND_IMAGE}
        alt="Whitepaper Background"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '100vw',
          height: '100vh',
          opacity: 0.25,
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          objectFit: 'cover',
          filter: 'blur(1px) saturate(1.1)',
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl font-bold text-white mb-4">{whitepaperMeta.title}</h1>
          <p className="text-xl text-accent-soft max-w-3xl mx-auto mb-4">
            {whitepaperMeta.subtitle}
          </p>
          <div className="text-sm text-accent-soft space-y-1">
            <p>Version {whitepaperMeta.version} • {whitepaperMeta.date}</p>
            <p>Contact: {whitepaperMeta.contact}</p>
          </div>
        </div>

        {/* Whitepaper Content */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <CollapsibleSection 
            title="1. Executive Summary"
            icon="🔥"
            defaultOpen={true}
          >
            {executiveSummary}
          </CollapsibleSection>

          <CollapsibleSection 
            title="2. Project Overview"
            icon="📋"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                The IC SPICY RWA Co-op represents a paradigm shift in specialty agriculture, leveraging blockchain technology 
                to create a decentralized cooperative that empowers farmers while providing investors with access to 
                premium agricultural assets. Our platform combines real-world assets (RWAs) with cutting-edge AI technology 
                and community governance to create a sustainable, profitable ecosystem.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-xl p-6 border border-orange-200/30">
                  <h4 className="text-xl font-semibold text-white mb-3">Vision</h4>
                  <p>
                    To revolutionize specialty agriculture through decentralized ownership, AI innovation, and community governance, 
                    creating a sustainable ecosystem that benefits farmers, investors, and consumers alike.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-200/30">
                  <h4 className="text-xl font-semibold text-white mb-3">Mission</h4>
                  <p>
                    Democratize access to premium agricultural assets while providing farmers with innovative tools, 
                    AI assistance, and fair compensation for their expertise and labor.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">Core Assets</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg">
                    <div className="text-3xl mb-2">🌶️</div>
                    <h5 className="font-semibold text-white mb-2">2,500 Pepper Plants</h5>
                    <p className="text-sm">192,000 pods annually across premium varieties</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <div className="text-3xl mb-2">🧂</div>
                    <h5 className="font-semibold text-white mb-2">1,500 Salt Blends</h5>
                    <p className="text-sm">Gourmet smoked salt varieties</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                    <div className="text-3xl mb-2">🌸</div>
                    <h5 className="font-semibold text-white mb-2">100 Plumeria</h5>
                    <p className="text-sm">Premium ornamental seedlings</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="3. Business Model & Revenue Streams"
            icon="💰"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                The IC SPICY RWA Co-op operates on a multi-faceted business model designed to create sustainable revenue 
                while providing value to all stakeholders. Our revenue streams are diversified across physical products, 
                digital assets, and platform services.
              </p>
              
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-200/30">
                <h4 className="text-xl font-semibold text-white mb-4">Revenue Projections - Year 1</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Revenue Streams</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>RWA Sales (Peppers, Salt, Plumeria)</span>
                        <span className="text-white font-semibold">$395,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>NFT Sales (Variety-specific NFTs)</span>
                        <span className="text-white font-semibold">$16,150</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SPICY Token Sales</span>
                        <span className="text-white font-semibold">$798,850</span>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total Revenue</span>
                          <span className="text-accent-gold">$1,210,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">Key Metrics</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Membership NFTs</span>
                        <span className="text-white font-semibold">5,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Hydroponic Kits</span>
                        <span className="text-white font-semibold">5,000 ($198 each)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Profit Sharing (Year 1)</span>
                        <span className="text-white font-semibold">$44,850</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Target (Year 3)</span>
                        <span className="text-accent-gold font-bold">$7,000,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="4. Technology Architecture"
            icon="🏗️"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                The IC SPICY platform is built on the Internet Computer Protocol (ICP), utilizing a modular canister 
                architecture that ensures scalability, security, and interoperability. Our 11 specialized canisters 
                work together to create a comprehensive ecosystem.
              </p>
              
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl p-6 border border-blue-200/30">
                <h4 className="text-xl font-semibold text-white mb-4">Canister Architecture</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Core Canisters</h5>
                    <ul className="space-y-2">
                      <li>• <strong>User Management:</strong> Authentication, profiles, permissions</li>
                      <li>• <strong>Spicy AI:</strong> AI-powered farming assistance</li>
                      <li>• <strong>Wallet:</strong> Multi-currency crypto wallet</li>
                      <li>• <strong>Portal:</strong> Staking and governance</li>
                      <li>• <strong>Blog:</strong> Community content management</li>
                      <li>• <strong>Shop:</strong> NFT marketplace and sales</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">Supporting Canisters</h5>
                    <ul className="space-y-2">
                      <li>• <strong>Game:</strong> Interactive farming simulation</li>
                      <li>• <strong>Membership:</strong> Subscription management</li>
                      <li>• <strong>Profile:</strong> User customization</li>
                      <li>• <strong>Chili:</strong> Educational content</li>
                      <li>• <strong>Whitepaper:</strong> Documentation system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="5. Tokenomics & Governance"
            icon="🎯"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                The IC SPICY ecosystem utilizes a dual-token model with SPICY and HEAT tokens, complemented by 
                membership NFTs and a proposed SNS (Service Nervous System) for decentralized governance.
              </p>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-6 border border-purple-200/30">
                <h4 className="text-xl font-semibold text-white mb-4">Token Economics</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">SPICY Token</h5>
                    <ul className="space-y-2">
                      <li>• <strong>Utility:</strong> Platform governance, staking rewards</li>
                      <li>• <strong>Supply:</strong> Fixed total supply with deflationary mechanisms</li>
                      <li>• <strong>Distribution:</strong> Community rewards, development fund</li>
                      <li>• <strong>Staking:</strong> Earn HEAT tokens through staking</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">HEAT Token</h5>
                    <ul className="space-y-2">
                      <li>• <strong>Utility:</strong> Platform transactions, tipping, rewards</li>
                      <li>• <strong>Earning:</strong> Staking SPICY, community participation</li>
                      <li>• <strong>Circulation:</strong> Dynamic supply based on activity</li>
                      <li>• <strong>Burning:</strong> Transaction fees and platform usage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="6. Spicy AI Ecosystem"
            icon="🤖"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                Spicy AI is the intelligent backbone of the IC SPICY ecosystem, providing personalized farming 
                assistance, data insights, and community-driven knowledge sharing.
              </p>
              
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-200/30">
                <h4 className="text-xl font-semibold text-white mb-4">AI Capabilities</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Farming Assistance</h5>
                    <ul className="space-y-2">
                      <li>• <strong>SOPs:</strong> "Set pH to 6.0 for Reapers"</li>
                      <li>• <strong>Climate Data:</strong> "Miami 2025 rainfall: 50"</li>
                      <li>• <strong>Disease Prevention:</strong> Early warning systems</li>
                      <li>• <strong>Harvest Timing:</strong> Optimal picking recommendations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">Data Insights</h5>
                    <ul className="space-y-2">
                      <li>• <strong>Market Analysis:</strong> Price trends and demand</li>
                      <li>• <strong>Yield Optimization:</strong> Production forecasting</li>
                      <li>• <strong>Community Learning:</strong> Shared best practices</li>
                      <li>• <strong>Personalized Advice:</strong> Location-specific recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="7. Development Roadmap"
            icon="🗺️"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                Our development roadmap outlines the strategic phases to achieve our vision of revolutionizing 
                specialty agriculture through blockchain technology and AI innovation.
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    phase: 'Phase 1: Foundation & MVP',
                    period: 'Q2-Q3 2024',
                    status: 'Completed',
                    items: [
                      'Project conceptualization and planning',
                      'Core team assembly and partnerships',
                      'Technical architecture design',
                      'Initial canister development',
                      'Basic frontend implementation',
                      'Community building and marketing'
                    ]
                  },
                  {
                    phase: 'Phase 2: Platform Launch',
                    period: 'Q4 2024',
                    status: 'In Progress',
                    items: [
                      'Complete 11 module canisters',
                      'Frontend integration and testing',
                      'Security audits and optimization',
                      'Beta testing with community',
                      'Documentation and whitepaper',
                      'Initial NFT minting'
                    ]
                  },
                  {
                    phase: 'Phase 3: SNS Launch',
                    period: 'Q1 2025',
                    status: 'Planned',
                    items: [
                      'SNS governance implementation',
                      'Advanced AI features integration',
                      'Enhanced staking mechanisms',
                      'NFT marketplace launch',
                      'Mobile application development',
                      'Partnership integrations'
                    ]
                  },
                  {
                    phase: 'Phase 4: Scale & Optimize',
                    period: 'Q2 2025',
                    status: 'Planned',
                    items: [
                      'Performance optimization',
                      'Advanced analytics dashboard',
                      'Cross-chain integrations',
                      'Enterprise solutions',
                      'Global expansion',
                      'Revenue target: $7M'
                    ]
                  }
                ].map((phase, index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-600 to-gray-600"></div>
                    <div className="relative flex items-start space-x-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-500">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-semibold text-white">{phase.phase}</h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-accent-soft">{phase.period}</span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                              {phase.status}
                            </span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {phase.items.map((item, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-accent-soft">
                              <span className="text-accent-gold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="8. Legal & Compliance"
            icon="⚖️"
            defaultOpen={false}
          >
            <div className="space-y-6 text-accent-soft text-lg">
              <p>
                IC SPICY RWA Co-op operates in full compliance with U.S. regulations, ensuring transparency, 
                security, and legal protection for all stakeholders.
              </p>
              
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-200/30">
                <h4 className="text-xl font-semibold text-white mb-4">Regulatory Compliance</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">U.S. Regulations</h5>
                    <ul className="space-y-2">
                      <li>• SEC compliance for token offerings</li>
                      <li>• Agricultural cooperative regulations</li>
                      <li>• Food safety standards (FDA)</li>
                      <li>• Environmental protection (EPA)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">International Standards</h5>
                    <ul className="space-y-2">
                      <li>• ISO 9001 quality management</li>
                      <li>• Organic certification standards</li>
                      <li>• Fair trade practices</li>
                      <li>• Sustainable agriculture guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-accent-soft mb-4">
              © 2024 IC SPICY RWA Co-op. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <button className="text-accent-gold hover:text-accent-bright transition-colors">Privacy Policy</button>
              <button className="text-accent-gold hover:text-accent-bright transition-colors">Terms of Service</button>
              <button className="text-accent-gold hover:text-accent-bright transition-colors">Contact</button>
              <button className="text-accent-gold hover:text-accent-bright transition-colors">GitHub</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperPage; 
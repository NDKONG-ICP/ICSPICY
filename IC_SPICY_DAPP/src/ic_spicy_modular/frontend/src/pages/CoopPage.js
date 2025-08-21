import React from 'react';

const CoopPage = () => {
  const handleQuoteClick = () => {
    const subject = encodeURIComponent('IC SPICY Co-op Dealer Tier Custom Quote Request');
    const body = encodeURIComponent('Hello IC SPICY Team,%0D%0A%0D%0AI am interested in the Dealer tier and would like to discuss a custom garden kit to fit my agricultural needs. Please contact me to arrange a quote.%0D%0A%0D%0AMy requirements:%0D%0A- [Please describe your needs here]%0D%0A%0D%0AThank you!');
    window.location.href = `mailto:info@icspicy.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center overflow-x-hidden space-y-8">
      {/* Background Image and Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img src="/coop.jpg" alt="Co-op Background" className="w-full h-full object-cover object-center blur-sm opacity-70" />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>
      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem', fontFamily: 'serif'}}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-100 mb-4 tracking-tight" style={{letterSpacing:'0.01em'}}>IC SPICY Co-op Membership</h1>
        <p className="text-xl text-gray-100 max-w-2xl mx-auto">Unlock premium benefits, real-world garden kits, and exclusive AI-powered tools by joining the IC SPICY Co-op. Choose your tier and grow with the community!</p>
      </div>
      {/* Membership Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Beginner Gardener Tier */}
        <div className="glass-card-dark flex flex-col items-center p-8 border-2 border-green-400/30 rounded-2xl shadow-xl">
          <div className="text-5xl mb-3 drop-shadow-lg">🌱</div>
          <h2 className="text-2xl font-bold text-green-200 mb-2">Beginner Gardener</h2>
          <div className="text-lg font-bold text-yellow-100 mb-2">20 $ICP</div>
          <ul className="text-gray-100 text-sm mb-4 space-y-2 text-left">
            <li>• Soil-based garden kit</li>
            <li>• AI Assistant access</li>
            <li>• Irrigation kit with timer</li>
            <li>• Weather station for monitoring environment</li>
          </ul>
          <button className="w-full bg-gradient-to-r from-green-400 to-yellow-300 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-green-400 hover:text-white transition-all shadow-lg mt-auto">Join Now</button>
        </div>
        {/* Ballin' Tier */}
        <div className="glass-card-dark flex flex-col items-center p-8 border-2 border-pink-400/30 rounded-2xl shadow-xl">
          <div className="text-5xl mb-3 drop-shadow-lg">💎</div>
          <h2 className="text-2xl font-bold text-pink-200 mb-2">Ballin' Tier</h2>
          <div className="text-lg font-bold text-yellow-100 mb-2">60 $ICP</div>
          <ul className="text-gray-100 text-sm mb-4 space-y-2 text-left">
            <li>• 20-plant DWC Bucket Hydroponic system</li>
            <li>• All required grow media & installation tubing</li>
            <li>• AI Assistant access</li>
            <li>• Custom NFT badge for social media</li>
          </ul>
          <button className="w-full bg-gradient-to-r from-pink-400 to-yellow-300 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-pink-400 hover:text-white transition-all shadow-lg mt-auto">Join Now</button>
        </div>
        {/* Dealer Tier */}
        <div className="glass-card-dark flex flex-col items-center p-8 border-2 border-blue-400/30 rounded-2xl shadow-xl">
          <div className="text-5xl mb-3 drop-shadow-lg">🚀</div>
          <h2 className="text-2xl font-bold text-blue-200 mb-2">Dealer Tier</h2>
          <div className="text-lg font-bold text-yellow-100 mb-2">Custom Quote</div>
          <ul className="text-gray-100 text-sm mb-4 space-y-2 text-left">
            <li>• Customizable garden kit (expansion ready)</li>
            <li>• Everything from previous tiers</li>
            <li>• Personalized consultation</li>
            <li>• AI Assistant & NFT badge</li>
          </ul>
          <button onClick={handleQuoteClick} className="w-full bg-gradient-to-r from-blue-400 to-yellow-300 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-blue-400 hover:text-white transition-all shadow-lg mt-auto">Quote</button>
        </div>
      </div>
      {/* Custom glassmorphic dark card style */}
      <style>{`
        .glass-card-dark {
          background: rgba(20, 20, 30, 0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
};

export default CoopPage; 
import React, { useState, useEffect } from 'react';
import { generateSocialCaption, generateSocialImage, socialPlatforms, copyToClipboard, downloadImage } from '../utils/socialMedia';

const SocialShareModal = ({ post, isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [caption, setCaption] = useState('');
  const [socialImage, setSocialImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      generateContent();
    }
  }, [isOpen, post, selectedPlatform]);

  const generateContent = async () => {
    if (!post) return;
    
    setGenerating(true);
    try {
      // Generate caption for selected platform
      const generatedCaption = generateSocialCaption(post, selectedPlatform);
      setCaption(generatedCaption);
      
      // Generate social media image
      const imageBlob = await generateSocialImage(post);
      const imageUrl = URL.createObjectURL(imageBlob);
      setSocialImage({ blob: imageBlob, url: imageUrl });
    } catch (error) {
      console.error('Error generating social content:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCaption = async () => {
    const success = await copyToClipboard(caption);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (socialImage) {
      setDownloading(true);
      const filename = `ic-spicy-${post.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      downloadImage(socialImage.blob, filename);
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleShare = () => {
    const platform = socialPlatforms[selectedPlatform];
    const postUrl = `https://oo7fg-waaaa-aaaap-qp5sq-cai.icp0.io/blog?post=${post.id}`;
    
    if (platform.shareUrl && selectedPlatform !== 'instagram') {
      const shareUrl = platform.shareUrl(caption, postUrl);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card-dark max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              📤 Share to Social Media
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Choose Platform:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(socialPlatforms).map(([key, platform]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedPlatform === key
                      ? 'border-amber-500 bg-amber-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl mb-1">{platform.icon}</div>
                  <div className="text-sm font-medium">{platform.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Generated Image Preview */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Generated Image:</h3>
              <div className="relative bg-white/5 rounded-lg p-4 border border-white/20">
                {generating ? (
                  <div className="aspect-[1200/630] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <div className="text-sm text-gray-300">Generating beautiful image...</div>
                    </div>
                  </div>
                ) : socialImage ? (
                  <div>
                    <img
                      src={socialImage.url}
                      alt="Social media preview"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleDownloadImage}
                        disabled={downloading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {downloading ? '⬇️ Downloading...' : '⬇️ Download Image'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Caption Preview */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Caption for {socialPlatforms[selectedPlatform].name}:</h3>
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                {generating ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <div className="text-sm text-gray-300">Generating caption...</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full h-64 bg-transparent text-white placeholder-gray-400 border-none resize-none focus:outline-none"
                      placeholder="Your social media caption will appear here..."
                    />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                      <div className="text-sm text-gray-400">
                        {caption.length} / {socialPlatforms[selectedPlatform].maxLength} characters
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyCaption}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        >
                          {copied ? '✅ Copied!' : '📋 Copy'}
                        </button>
                        {selectedPlatform !== 'instagram' ? (
                          <button
                            onClick={handleShare}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all"
                          >
                            🚀 Share Now
                          </button>
                        ) : (
                          <div className="text-sm text-amber-400 max-w-48">
                            📷 Copy caption & image, then share manually on Instagram
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">📝 How to Share:</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>1. Download the generated image</div>
              <div>2. Copy the caption text</div>
              <div>3. {selectedPlatform === 'instagram' ? 'Open Instagram and create a new post manually' : 'Click "Share Now" or open the platform manually'}</div>
              <div>4. Paste the caption and attach the image</div>
              <div>5. Watch new members join the IC Spicy community! 🌶️</div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;

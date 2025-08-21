import React, { useState } from 'react';
import {
  generateXShareUrl,
  generateFacebookShareUrl,
  generateLinkedInShareUrl,
  generateWhatsAppShareUrl,
  generateTelegramShareUrl,
  generateSMSShareUrl,
  generateEmailShareUrl,
  copyToClipboard,
  webShare,
  handleSocialMediaError
} from '../utils/socialMedia';

const BlogPostShareModal = ({ post, isOpen, onClose }) => {
  const [notification, setNotification] = useState(null);

  if (!isOpen || !post) return null;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async (platform) => {
    try {
      let shareUrl;
      const { id: postId, title, content } = post;

      switch (platform) {
        case 'twitter':
          shareUrl = generateXShareUrl(title, content, postId);
          window.open(shareUrl, '_blank', 'width=600,height=400');
          showNotification('Opened Twitter share window!');
          break;
        case 'facebook':
          shareUrl = generateFacebookShareUrl(postId);
          window.open(shareUrl, '_blank', 'width=600,height=400');
          showNotification('Opened Facebook share window!');
          break;
        case 'linkedin':
          shareUrl = generateLinkedInShareUrl(title, content, postId);
          window.open(shareUrl, '_blank', 'width=600,height=400');
          showNotification('Opened LinkedIn share window!');
          break;
        case 'whatsapp':
          shareUrl = generateWhatsAppShareUrl(title, postId);
          window.open(shareUrl, '_blank');
          showNotification('Opened WhatsApp share!');
          break;
        case 'telegram':
          shareUrl = generateTelegramShareUrl(title, postId);
          window.open(shareUrl, '_blank');
          showNotification('Opened Telegram share!');
          break;
        case 'sms':
          shareUrl = generateSMSShareUrl(title, postId);
          window.location.href = shareUrl;
          showNotification('Opened SMS app!');
          break;
        case 'email':
          shareUrl = generateEmailShareUrl(title, content, postId);
          window.location.href = shareUrl;
          showNotification('Opened email app!');
          break;
        case 'copy':
          const result = await copyToClipboard(title, content, postId);
          showNotification(result.message, result.success ? 'success' : 'error');
          break;
        case 'native':
          const nativeResult = await webShare(title, content, postId);
          showNotification(nativeResult.message, nativeResult.success ? 'success' : 'error');
          break;
        default:
          showNotification('Platform not supported yet', 'error');
      }
    } catch (error) {
      console.error('Share error:', error);
      const errorMessage = handleSocialMediaError(platform, error);
      showNotification(errorMessage, 'error');
    }
  };

  const shareOptions = [
    { 
      id: 'twitter', 
      name: 'X (Twitter)', 
      icon: '𝕏', 
      color: 'from-black to-gray-800',
      description: 'Share with hashtags to reach pepper lovers'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: '📘', 
      color: 'from-blue-600 to-blue-800',
      description: 'Share to your timeline and groups'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: '💼', 
      color: 'from-blue-700 to-blue-900',
      description: 'Professional network sharing'
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: '💬', 
      color: 'from-green-500 to-green-700',
      description: 'Share with friends and family'
    },
    { 
      id: 'telegram', 
      name: 'Telegram', 
      icon: '✈️', 
      color: 'from-blue-400 to-blue-600',
      description: 'Share in channels and groups'
    },
    { 
      id: 'sms', 
      name: 'Text Message', 
      icon: '📱', 
      color: 'from-purple-500 to-purple-700',
      description: 'Send via SMS'
    },
    { 
      id: 'email', 
      name: 'Email', 
      icon: '📧', 
      color: 'from-red-500 to-red-700',
      description: 'Share via email with full details'
    },
    { 
      id: 'copy', 
      name: 'Copy Link', 
      icon: '📋', 
      color: 'from-gray-500 to-gray-700',
      description: 'Copy to paste anywhere'
    }
  ];

  // Add native share if supported
  if (navigator.share) {
    shareOptions.push({
      id: 'native',
      name: 'Share Menu',
      icon: '📤',
      color: 'from-amber-500 to-orange-500',
      description: 'Use device share menu'
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card-dark max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center mb-2">
                🚀 Share Your Grow Experience
              </h2>
              <p className="text-gray-300 text-sm">
                Help others discover IC SPICY and join the pepper growing blockchain revolution!
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* External Service Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">ℹ️</span>
              <h3 className="text-sm font-medium text-blue-300">Note:</h3>
            </div>
            <p className="text-blue-200 text-xs">
              Some social media platforms may show browser warnings. These are external service notifications and don't affect your sharing. If sharing fails, use "Copy Link" as a backup option.
            </p>
          </div>

          {/* Post Preview */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">"{post.title}"</h3>
            <p className="text-gray-300 text-sm line-clamp-3">
              {post.content.substring(0, 150)}...
            </p>
            {post.image && post.image.length > 0 && (
              <div className="mt-3 text-xs text-gray-400">
                📸 Includes your grow photo
              </div>
            )}
          </div>

          {/* Brand Message */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🌶️</span>
              <h3 className="text-lg font-semibold text-amber-400">Your Share Message:</h3>
            </div>
            <p className="text-white text-sm">
              "Join me on my IC SPICY adventures! 🌶️ Growing peppers on the blockchain with real rewards!"
            </p>
            <p className="text-gray-300 text-xs mt-2">
              This message will be included with your post to attract new community members.
            </p>
          </div>

          {/* Share Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`group p-4 rounded-lg bg-gradient-to-r ${option.color} hover:scale-105 transition-all duration-200 text-white`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{option.name}</div>
                    <div className="text-xs opacity-90">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
              💡 Sharing Tips
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Each platform is optimized with the perfect message for maximum engagement</div>
              <div>• Your post includes tracking links to measure community growth</div>
              <div>• New visitors can read your post without signing up, but need to connect wallet to participate</div>
              <div>• Every share helps grow the IC SPICY ecosystem and brings new growers to the community! 🌱</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center">
              🎁 Community Benefits
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Help new growers discover blockchain pepper farming</div>
              <div>• Share your expertise and build your reputation in the community</div>
              <div>• Drive traffic to the dapp and increase token value for all holders</div>
              <div>• Potential future rewards for top community ambassadors</div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-lg border ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}>
              {notification.message}
            </div>
          )}

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostShareModal;

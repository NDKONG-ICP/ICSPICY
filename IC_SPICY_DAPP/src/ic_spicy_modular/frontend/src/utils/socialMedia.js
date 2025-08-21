// Enhanced social media sharing utilities for IC SPICY

const SPICY_BASE_URL = 'https://oo7fg-waaaa-aaaap-qp5sq-cai.icp0.io';
const SPICY_BRAND_MESSAGE = 'Join me on my IC SPICY adventures! 🌶️ Growing peppers on the blockchain with real rewards!';

// Generate blog post share URL with tracking
export const generateBlogPostUrl = (postId) => {
  // Use the IC canister URL with proper routing
  return `${SPICY_BASE_URL}/blog?post=${postId}&utm_source=social&utm_medium=share&utm_campaign=blog_post`;
};

// Generate URL for sharing on X (Twitter)
export const generateXShareUrl = (postTitle, postContent, postId) => {
  try {
    const postUrl = generateBlogPostUrl(postId);
    const hashtags = ['ICSpicy', 'PepperGrowing', 'Web3', 'Blockchain', 'DeFi', 'PlayToEarn'];
    
    let text = `🌶️ ${SPICY_BRAND_MESSAGE}\n\n"${postTitle}"\n\nCheck out my latest grow experience!`;
    
    if (text.length > 240) {
      text = `🌶️ ${SPICY_BRAND_MESSAGE}\n\n"${postTitle.substring(0, 80)}..."\n\nCheck it out!`;
    }
    
    const params = new URLSearchParams({
      text: text,
      url: postUrl,
      hashtags: hashtags.join(',')
    });
    
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  } catch (error) {
    console.log('Twitter sharing URL generation failed, using fallback');
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent('🌶️ Join me on my IC SPICY adventures!')}`;
  }
};

// Generate URL for sharing on Facebook
export const generateFacebookShareUrl = (postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const params = new URLSearchParams({
    u: postUrl,
    quote: SPICY_BRAND_MESSAGE
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
};

// Generate URL for sharing on LinkedIn
export const generateLinkedInShareUrl = (postTitle, postContent, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const summary = `${SPICY_BRAND_MESSAGE}\n\n${postContent.substring(0, 200)}...`;
  
  const params = new URLSearchParams({
    url: postUrl,
    title: `IC SPICY: ${postTitle}`,
    summary: summary
  });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
};

// Generate URL for sharing via WhatsApp
export const generateWhatsAppShareUrl = (postTitle, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const message = `🌶️ ${SPICY_BRAND_MESSAGE}\n\n"${postTitle}"\n\n${postUrl}`;
  
  const params = new URLSearchParams({
    text: message
  });
  return `https://wa.me/?${params.toString()}`;
};

// Generate URL for sharing via Telegram
export const generateTelegramShareUrl = (postTitle, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const message = `🌶️ ${SPICY_BRAND_MESSAGE}\n\n"${postTitle}"\n\n${postUrl}`;
  
  const params = new URLSearchParams({
    url: postUrl,
    text: message
  });
  return `https://t.me/share/url?${params.toString()}`;
};

// Generate URL for sharing via SMS
export const generateSMSShareUrl = (postTitle, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const message = `🌶️ Check out my IC SPICY grow experience: "${postTitle}" ${postUrl}`;
  
  const params = new URLSearchParams({
    body: message
  });
  return `sms:?${params.toString()}`;
};

// Generate mailto link for email sharing
export const generateEmailShareUrl = (postTitle, postContent, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const subject = `🌶️ Check out my IC SPICY grow experience: ${postTitle}`;
  const body = `${SPICY_BRAND_MESSAGE}\n\nI wanted to share my latest pepper growing experience with you!\n\n"${postTitle}"\n\n${postContent.substring(0, 300)}...\n\nRead the full post here: ${postUrl}\n\nJoin the IC SPICY community and start your own blockchain pepper growing adventure!\n\n🌶️ Grow • Earn • Share 🌶️`;
  
  const params = new URLSearchParams({
    subject: subject,
    body: body
  });
  return `mailto:?${params.toString()}`;
};

// Enhanced error handling for social media services
export const handleSocialMediaError = (platform, error) => {
  console.log(`${platform} sharing error:`, error);
  
  // Return user-friendly error messages
  const errorMessages = {
    'twitter': 'Twitter sharing temporarily unavailable. Try copying the link instead.',
    'facebook': 'Facebook sharing temporarily unavailable. Try copying the link instead.',
    'linkedin': 'LinkedIn sharing temporarily unavailable. Try copying the link instead.',
    'whatsapp': 'WhatsApp sharing temporarily unavailable. Try copying the link instead.',
    'telegram': 'Telegram sharing temporarily unavailable. Try copying the link instead.',
    'sms': 'SMS sharing temporarily unavailable. Try copying the link instead.',
    'email': 'Email sharing temporarily unavailable. Try copying the link instead.',
    'default': 'Sharing temporarily unavailable. Try copying the link instead.'
  };
  
  return errorMessages[platform] || errorMessages.default;
};

// Copy to clipboard functionality
export const copyToClipboard = async (postTitle, postContent, postId) => {
  const postUrl = generateBlogPostUrl(postId);
  const shareText = `🌶️ ${SPICY_BRAND_MESSAGE}\n\n"${postTitle}"\n\n${postContent.substring(0, 200)}...\n\n${postUrl}`;
  
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, message: 'Post link copied to clipboard!' };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, message: 'Failed to copy to clipboard. Please try again.' };
  }
};

// Native Web Share API (when available)
export const webShare = async (postTitle, postContent, postId) => {
  if (navigator.share) {
    const postUrl = generateBlogPostUrl(postId);
    const shareData = {
      title: `🌶️ IC SPICY: ${postTitle}`,
      text: `${SPICY_BRAND_MESSAGE}\n\n${postContent.substring(0, 100)}...`,
      url: postUrl
    };
    
    try {
      await navigator.share(shareData);
      return { success: true, message: 'Shared successfully!' };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        return { success: false, message: 'Failed to share. Please try again.' };
      }
      return { success: false, message: 'Share cancelled.' };
    }
  }
  return { success: false, message: 'Web Share API not supported.' };
};

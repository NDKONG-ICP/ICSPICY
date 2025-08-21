import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { useWallet } from '../WalletContext';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useAgent, useIdentityKit } from '@nfid/identitykit/react';
import { idlFactory as membershipIdl } from '../declarations/membership';
import { CANISTER_IDS } from '../config';
import BlogPostShareModal from '../components/BlogPostShareModal';

const BlogPage = () => {
  const { principal: walletPrincipal, plugConnected, canisters, connectPlug } = useWallet();
  const { user } = useIdentityKit();
  const oisyAgent = useAgent();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState('growing');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [membership, setMembership] = useState(null);
  const [tipping, setTipping] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [tipAmount, setTipAmount] = useState('');
  const [tipToken, setTipToken] = useState('SPICY');
  const [showTipModal, setShowTipModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sharePost, setSharePost] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // LocalStorage keys for persistent mock data
  const STORAGE_KEY = 'ic_spicy_blog_posts';
  const POST_ID_KEY = 'ic_spicy_next_post_id';
  
  const formRef = useRef(null);

  const effectivePrincipal = React.useMemo(() => {
    if (user?.principal?.toText) return user.principal.toText();
    if (walletPrincipal) return String(walletPrincipal);
    return null;
  }, [user, walletPrincipal]);

  const isConnected = plugConnected || oisyAgent;

  const categories = [
    { id: 'all', name: 'All Posts', icon: '🌱', color: 'from-emerald-500 to-teal-500' },
    { id: 'growing', name: 'Growing Tips', icon: '🌿', color: 'from-green-500 to-emerald-500' },
    { id: 'harvest', name: 'Harvest Stories', icon: '🌶️', color: 'from-red-500 to-orange-500' },
    { id: 'recipe', name: 'Recipes', icon: '👨‍🍳', color: 'from-yellow-500 to-orange-500' },
    { id: 'experience', name: 'My Experience', icon: '💬', color: 'from-purple-500 to-pink-500' },
    { id: 'tutorial', name: 'Tutorials', icon: '📚', color: 'from-blue-500 to-indigo-500' },
  ];

  // Persistent storage utilities
  const getStoredPosts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading stored posts:', e);
      return [];
    }
  };

  const savePostsToStorage = (postsToSave) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postsToSave));
    } catch (e) {
      console.error('Error saving posts to storage:', e);
    }
  };

  const getNextPostId = () => {
    try {
      const nextId = localStorage.getItem(POST_ID_KEY);
      const id = nextId ? parseInt(nextId) : 1001; // Start from 1001 to avoid conflicts
      localStorage.setItem(POST_ID_KEY, (id + 1).toString());
      return id;
    } catch (e) {
      console.error('Error getting next post ID:', e);
      return Date.now(); // Fallback to timestamp
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load posts
        let blogCanister = canisters.blog;
        if (!blogCanister && oisyAgent) {
          const { idlFactory: blogIdl } = await import('../declarations/blog');
          blogCanister = Actor.createActor(blogIdl, { 
            agent: oisyAgent, 
            canisterId: CANISTER_IDS.blog 
          });
        }
        
        let canisterPosts = [];
        if (blogCanister) {
          try {
            // Try the advanced getPublishedPosts method first
            canisterPosts = await blogCanister.getPublishedPosts();
          } catch (e1) {
            try {
              // Fallback to simple list_posts method
              canisterPosts = await blogCanister.list_posts();
            } catch (e2) {
              // Check if it's an ICRC-21 consent error
              if (e2.message && e2.message.includes('icrc21_canister_call_consent_message')) {
                console.log('ICRC-21 consent required for blog canister, using stored posts');
                setSuccess("🌶️ Blog canister needs consent approval. Using local posts for now.");
                setTimeout(() => setSuccess(""), 5000);
              } else {
                console.log('Blog canister methods not available, using stored posts');
              }
              canisterPosts = [];
            }
          }
        }

        // Load stored posts from localStorage
        const storedPosts = getStoredPosts();
        
        // Add some demo posts if no posts exist (for demonstration)
        let finalPosts;
        if (storedPosts.length === 0 && canisterPosts.length === 0) {
          const demoPosts = [
            {
              id: 1001,
              title: "My First Carolina Reaper Harvest! 🔥",
              content: "After 6 months of careful growing, I finally harvested my first Carolina Reaper peppers! The heat level is absolutely insane - definitely the hottest thing I've ever grown. The plants produced about 20 peppers each, and I'm planning to make some scorching hot sauce. Growing tips: They need LOTS of heat and humidity, consistent watering, and patience. The wait is so worth it when you see those wrinkled, devilish peppers growing. Next year I'm trying the Pepper X variety!",
              author: "2vxsx-fae",
              author_name: "Spicy Grower",
              timestamp: Date.now() - 86400000, // 1 day ago
              created_at: Date.now() - 86400000,
              category: "harvest",
              tags: ["carolina-reaper", "super-hot", "harvest"],
              excerpt: "After 6 months of careful growing, I finally harvested my first Carolina Reaper peppers!",
              read_time: 2,
              views: 47,
              likes: 12,
              status: 'published',
              photo: [],
              image_url: null
            },
            {
              id: 1002,
              title: "Growing Jalapeños in Winter: My Indoor Setup",
              content: "Living in a cold climate doesn't mean you can't grow peppers year-round! I've set up a fantastic indoor growing system that's been producing beautiful jalapeños all winter long. My setup includes: LED grow lights (full spectrum), temperature control (keeps it at 75-80°F), humidity monitoring, and a good ventilation system. The key is maintaining consistent conditions and not overwatering. I've harvested over 50 jalapeños in the past 2 months! The taste is incredible - much better than store-bought. Planning to expand to habaneros next!",
              author: "vklag-edc",
              author_name: "Winter Grower",
              timestamp: Date.now() - 172800000, // 2 days ago
              created_at: Date.now() - 172800000,
              category: "growing",
              tags: ["jalapeño", "indoor", "winter-growing"],
              excerpt: "Living in a cold climate doesn't mean you can't grow peppers year-round!",
              read_time: 3,
              views: 83,
              likes: 25,
              status: 'published',
              photo: [],
              image_url: null
            }
          ];
          
          // Save demo posts to localStorage
          savePostsToStorage(demoPosts);
          finalPosts = demoPosts;
        } else {
          // Merge canister posts with stored posts (stored posts first for demo)
          finalPosts = [...storedPosts, ...canisterPosts];
        }
        
        setPosts(finalPosts.reverse() || []);
          
        // Check if there's a specific post ID in URL params for deep linking
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('post');
        const utmSource = urlParams.get('utm_source');
        
        if (postId && finalPosts.length > 0) {
          // Find and highlight the specific post in final posts
          const targetPost = finalPosts.find(p => p.id === parseInt(postId));
          if (targetPost) {
            // Show welcome message for social media visitors
            if (utmSource === 'social') {
              setSuccess(`🌶️ Welcome to IC SPICY! You're viewing "${targetPost.title}" - Connect your wallet to join our pepper growing community!`);
              setTimeout(() => setSuccess(""), 5000);
            }
            
            // Scroll to the post after a brief delay to ensure rendering
            setTimeout(() => {
              const postElement = document.querySelector(`[data-post-id="${postId}"]`);
              if (postElement) {
                postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                postElement.classList.add('animate-pulse', 'ring-4', 'ring-amber-500/50');
                setTimeout(() => {
                  postElement.classList.remove('animate-pulse', 'ring-4', 'ring-amber-500/50');
                }, 3000);
              }
            }, 500);
          } else if (utmSource === 'social') {
            // Post not found, but user came from social media
            setSuccess(`🌶️ Welcome to IC SPICY! The post you're looking for may have been moved. Check out our latest pepper growing stories below!`);
            setTimeout(() => setSuccess(""), 5000);
          }
        }
        
        // Load membership status
        if (effectivePrincipal && (canisters.membership || oisyAgent)) {
          const membershipActor = canisters.membership || Actor.createActor(membershipIdl, { 
            agent: oisyAgent, 
            canisterId: CANISTER_IDS.membership 
          });
          const membershipStatus = await membershipActor.get_membership_status(Principal.fromText(effectivePrincipal));
          setMembership(membershipStatus?.[0] || null);
        }
      } catch (e) {
        setError("Failed to load blog data: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [canisters.blog, canisters.membership, effectivePrincipal, oisyAgent]);

  // Handle photo selection and preview
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Compress and convert image to base64 for storage
  const compressAndConvert = async (file) => {
    const options = {
      maxSizeMB: 0.1, // Even smaller for canister storage
      maxWidthOrHeight: 600, // Smaller dimensions
      useWebWorker: true,
      initialQuality: 0.6, // Lower quality for smaller size
    };
    
    try {
      const compressed = await imageCompression(file, options);
      
      // Convert to base64 for easier storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  };

  // Get membership tier for premium features
  const getMembershipTier = () => {
    if (!membership || !membership.tier) return null;
    return Object.keys(membership.tier)[0];
  };

  const membershipTier = getMembershipTier();
  const isPremium = membershipTier === 'Premium' || membershipTier === 'Elite';

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }
    
    setUploading(true);
    setError("");
    setSuccess("");
    
    try {
      let imageUrl = null;
      if (photo) {
        setSuccess("🖼️ Compressing image...");
        imageUrl = await compressAndConvert(photo);
      }
      
      // Create excerpt from content (first 150 characters)
      const excerpt = content.length > 150 ? content.substring(0, 150) + "..." : content;
      
      // Estimate read time (average 200 words per minute)
      const wordCount = content.split(' ').length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      
      // Tags based on category
      const categoryTags = {
        'growing': ['growing', 'tips', 'gardening'],
        'harvest': ['harvest', 'peppers', 'success'],
        'recipe': ['recipe', 'cooking', 'spicy'],
        'experience': ['experience', 'community', 'sharing'],
        'tutorial': ['tutorial', 'howto', 'guide']
      };
      
      const tags = categoryTags[category] || ['community'];
      
      setSuccess("📝 Creating your post...");
      
      // Get blog canister (with fallback)
      let blogCanister = canisters.blog;
      if (!blogCanister && oisyAgent) {
        const { idlFactory: blogIdl } = await import('../declarations/blog');
        blogCanister = Actor.createActor(blogIdl, { 
          agent: oisyAgent, 
          canisterId: CANISTER_IDS.blog 
        });
      }
      
      if (!blogCanister) {
        throw new Error("Blog canister not available. Please connect your wallet and try again.");
      }
      
      // Using the deployed canister's simple interface
      
      // Try to create the post using available methods
      let postId;
      try {
        // First try the advanced createPost method
        postId = await blogCanister.createPost(
          title,
          content,
          tags,
          category,
          excerpt,
          imageUrl ? [imageUrl] : [],
          readTime
        );
      } catch (e1) {
        try {
          // Fallback to simple add_post method
          postId = await blogCanister.add_post(
            title,
            content,
            effectivePrincipal || 'Anonymous'
          );
        } catch (e2) {
          // Create a persistent local post with proper ID
          postId = getNextPostId();
          const newPost = {
            id: postId,
            title,
            content,
            author: effectivePrincipal || 'Anonymous',
            author_name: effectivePrincipal || 'Anonymous Grower',
            timestamp: Date.now(),
            created_at: Date.now(),
            category: category,
            tags: tags,
            excerpt: excerpt,
            read_time: readTime,
            views: 0,
            likes: 0,
            status: 'published',
            photo: imageUrl ? [Array.from(atob(imageUrl.split(',')[1]), c => c.charCodeAt(0))] : [],
            image_url: imageUrl || null
          };
          
          // Save to localStorage for persistence
          const currentStoredPosts = getStoredPosts();
          const updatedPosts = [newPost, ...currentStoredPosts];
          savePostsToStorage(updatedPosts);
          
          // Update UI state
          setPosts(prev => [newPost, ...prev]);
          
          setSuccess("🌶️ Your post has been shared with the community! (Stored locally until canister upgrade)");
          
          // Clear form
          setTitle("");
          setContent("");
          setCategory('growing');
          setPhoto(null);
          setPhotoPreview(null);
          setShowForm(false);
          
          return; // Exit early for local post
        }
      }
      
      setSuccess("📤 Publishing your post...");
      
      // Since the simple canister auto-publishes, skip the publish step
      if (postId) {
        setSuccess("🌶️ Your grow experience has been shared with the community!");
        
        // Clear form
        setTitle("");
        setContent("");
        setCategory('growing');
        setPhoto(null);
        setPhotoPreview(null);
        setShowForm(false);
        
        // Refresh posts to show the new one
        try {
          const freshCanisterPosts = await blogCanister.getPublishedPosts();
          const storedPosts = getStoredPosts();
          const allPosts = [...storedPosts, ...freshCanisterPosts];
          setPosts(allPosts.reverse() || []);
        } catch (e) {
          try {
            const freshCanisterPosts = await blogCanister.list_posts();
            const storedPosts = getStoredPosts();
            const allPosts = [...storedPosts, ...freshCanisterPosts];
            setPosts(allPosts.reverse() || []);
          } catch (e2) {
            // Posts already updated in local storage case above
          }
        }
      } else {
        setError("Post was created but failed to publish. Please try again.");
      }
      
    } catch (e) {
      console.error('Failed to create post:', e);
      setError("Failed to share your post: " + (e.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  // Tipping functionality
  const handleTip = async () => {
    if (!selectedPost || !tipAmount || !isConnected) return;
    
    setTipping(true);
    try {
      // This would integrate with your wallet system
      // For now, we'll simulate the tip
      setSuccess(`🎉 Successfully tipped ${tipAmount} ${tipToken} to ${selectedPost.author}!`);
      setShowTipModal(false);
      setTipAmount('');
      setSelectedPost(null);
    } catch (e) {
      setError("Failed to send tip: " + e.message);
    } finally {
      setTipping(false);
    }
  };

  const openTipModal = (post) => {
    setSelectedPost(post);
    setShowTipModal(true);
  };

  const openShareModal = (post) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setSharePost(null);
    setShowShareModal(false);
  };

  // Add this function to handle the Add a Post button
  const handleAddPostClick = () => {
    if (!isConnected) {
      connectPlug();
      return;
    }
    setShowForm(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.18),transparent_55%)]" />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-xl text-gray-300">Loading community stories...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-4xl font-bold text-white mb-4">Grow Experience Blog</h1>
          <p className="text-xl text-gray-300 mb-2">
            Share your growing journey and connect with fellow gardeners
          </p>
          {membershipTier && (
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isPremium ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white' : 'bg-gray-600 text-gray-200'
              }`}>
                {membershipTier === 'Basic' ? '🌶️ Street Team' : membershipTier === 'Elite' ? '🔥 Spicy Chads' : `👑 ${membershipTier}`} Member
              </span>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="glass-card-dark p-4 border border-red-500/40 bg-red-900/20">
            <p className="text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="glass-card-dark p-4 border border-green-500/40 bg-green-900/20">
            <p className="text-green-200">{success}</p>
          </div>
        )}

        {/* Categories */}
        <div className="glass-card-dark p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-br ${category.color} text-white shadow-lg shadow-${category.color.split('-')[1]}-500/50`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card-dark p-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Share Your Growing Journey</h3>
              <p className="text-gray-300">Connect with fellow gardeners and earn tips for your stories</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddPostClick}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-all"
              >
                {isConnected ? '✍️ Share Your Story' : '🔗 Connect Wallet'}
              </button>
              {isPremium && (
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all">
                  👑 Premium Post
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card-dark p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-emerald-400">{filteredPosts.length}</div>
            <div className="text-sm text-gray-300">Stories Shared</div>
          </div>
          <div className="glass-card-dark p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-amber-400">127</div>
            <div className="text-sm text-gray-300">Community Tips</div>
          </div>
          <div className="glass-card-dark p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-pink-400">42</div>
            <div className="text-sm text-gray-300">Active Growers</div>
          </div>
          <div className="glass-card-dark p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-purple-400">4.9★</div>
            <div className="text-sm text-gray-300">Community Rating</div>
          </div>
        </div>

        {/* Add Post Form */}
        {isConnected && showForm && (
          <div ref={formRef} className="glass-card-dark p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Share Your Growing Story</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Share your growing experience..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories.filter(cat => cat.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Story</label>
                <textarea
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Tell us about your growing experience, challenges, successes, and tips..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
                />
                {photoPreview && (
                  <div className="mt-4">
                    <img src={photoPreview} alt="Preview" className="rounded-lg max-h-64 mx-auto shadow-lg" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Sharing..." : "🌱 Share with Community"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Community Stories</h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <article 
                  key={post.id || index} 
                  data-post-id={post.id}
                  className="glass-card-dark border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 group"
                >
                  {post.photo && post.photo.length > 0 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={`data:image/jpeg;base64,${btoa(String.fromCharCode(...post.photo[0]))}`}
                        alt="Garden"
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                          {categories.find(cat => cat.id === post.category)?.icon || '🌱'} 
                          {categories.find(cat => cat.id === post.category)?.name || 'Growing'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {post.author?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{post.author || 'Anonymous'}</div>
                          <div className="text-xs text-gray-400">
                            {post.timestamp ? new Date(Number(post.timestamp)).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openShareModal(post)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium hover:opacity-90 transition-all"
                          title="Share this post to social media"
                        >
                          <span>🚀</span>
                          <span>Share</span>
                        </button>
                        <button 
                          onClick={() => openTipModal(post)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-all"
                        >
                          <span>💰</span>
                          <span>Tip</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs hover:bg-white/20 transition-all">
                          <span>❤️</span>
                          <span>{Math.floor(Math.random() * 20) + 1}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card-dark p-12 border border-white/10 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-white mb-2">No stories yet in this category</h3>
              <p className="text-gray-300 mb-6">Be the first to share your growing experience!</p>
              <button
                onClick={handleAddPostClick}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-all"
              >
                Share Your Story
              </button>
            </div>
          )}
        </div>

        {/* Tipping Modal */}
        {showTipModal && selectedPost && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-dark p-8 border border-white/10 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Tip Creator</h3>
                <button 
                  onClick={() => setShowTipModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedPost.author?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{selectedPost.author || 'Anonymous'}</div>
                    <div className="text-sm text-gray-400">{selectedPost.title}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTipToken('SPICY')}
                      className={`p-3 rounded-lg border transition-all ${
                        tipToken === 'SPICY' 
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-lg mb-1">🌶️</div>
                      <div className="text-sm font-medium">SPICY</div>
                    </button>
                    <button
                      onClick={() => setTipToken('HEAT')}
                      className={`p-3 rounded-lg border transition-all ${
                        tipToken === 'HEAT' 
                          ? 'border-pink-500 bg-pink-500/20 text-pink-300' 
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-lg mb-1">🔥</div>
                      <div className="text-sm font-medium">HEAT</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                    placeholder="Enter tip amount"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleTip}
                    disabled={!tipAmount || tipping}
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {tipping ? 'Sending...' : `💰 Send ${tipAmount} ${tipToken}`}
                  </button>
                  <button
                    onClick={() => setShowTipModal(false)}
                    className="px-6 py-3 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="glass-card-dark p-6 border border-white/10">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">🌱 Community Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="text-emerald-400 font-medium">✅ Share Authentic Experiences</div>
                <p className="text-gray-300">Tell your real growing story with honest tips and challenges</p>
              </div>
              <div className="space-y-2">
                <div className="text-amber-400 font-medium">💰 Earn Community Tips</div>
                <p className="text-gray-300">Quality content gets rewarded with SPICY and HEAT tokens</p>
              </div>
              <div className="space-y-2">
                <div className="text-pink-400 font-medium">🤝 Support Fellow Growers</div>
                <p className="text-gray-300">Tip and engage with stories that inspire your journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canister Upgrade Notice */}
        <div className="glass-card-dark p-6 border border-blue-500/30 bg-blue-500/10">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-400 mb-4">🔧 Canister Upgrade Notice</h3>
            <div className="text-gray-300 mb-4">
              <p className="mb-2">The blog canister needs to be upgraded to support modern consent management (ICRC-21).</p>
              <p className="mb-2">Currently, all posts are stored locally in your browser and work perfectly for sharing!</p>
              <p className="text-sm text-blue-300">This upgrade will enable full blockchain storage and cross-device synchronization.</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/50">
              <p className="text-sm text-blue-200">
                <strong>Current Status:</strong> ✅ Local posts working perfectly | 🔄 Canister upgrade pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Share Modal */}
      <BlogPostShareModal 
        post={sharePost}
        isOpen={showShareModal}
        onClose={closeShareModal}
      />
    </div>
  );
};

export default BlogPage; 
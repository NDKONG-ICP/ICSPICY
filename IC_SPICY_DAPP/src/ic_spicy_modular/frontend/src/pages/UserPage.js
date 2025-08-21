import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import { idlFactory as userIdl } from '../declarations/user';
import { idlFactory as membershipIdl } from '../declarations/membership';
import { useAgent, useIdentityKit } from '@nfid/identitykit/react';
import { CANISTER_IDS } from '../config';

const UserPage = () => {
  const { principal: walletPrincipal, plugConnected, connectPlug, canisters } = useWallet();
  const { user } = useIdentityKit();
  const oisyAgent = useAgent();
  
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    referral_code: ''
  });
  
  const [preferencesForm, setPreferencesForm] = useState({
    notifications: true,
    theme: 'dark',
    language: 'en',
    privacy_level: 'public'
  });

  const effectivePrincipal = React.useMemo(() => {
    if (user?.principal?.toText) return user.principal.toText();
    if (walletPrincipal) return String(walletPrincipal);
    return null;
  }, [user, walletPrincipal]);

  const isConnected = plugConnected || oisyAgent;

  // Helper functions
  const getUserActor = () => {
    return canisters.user || (oisyAgent ? Actor.createActor(userIdl, { agent: oisyAgent, canisterId: CANISTER_IDS.user }) : null);
  };

  const getMembershipActor = () => {
    return canisters.membership || (oisyAgent ? Actor.createActor(membershipIdl, { agent: oisyAgent, canisterId: CANISTER_IDS.membership }) : null);
  };

  // Load user data
  const loadUserData = async () => {
    if (!effectivePrincipal || !isConnected) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userActor = getUserActor();
      const membershipActor = getMembershipActor();
      
      if (userActor) {
        // Load user profile
        const profile = await userActor.get_user_data();
        if (profile && profile.length > 0) {
          setUserData(profile[0]);
          setProfileForm({
            name: profile[0].name || '',
            email: profile[0].email || '',
            referral_code: profile[0].referral_code?.[0] || ''
          });
          setPreferencesForm(profile[0].preferences || {
            notifications: true,
            theme: 'dark',
            language: 'en',
            privacy_level: 'public'
          });
        }
        
        // Load user stats
        const stats = await userActor.get_user_stats();
        if (stats && stats.length > 0) {
          setUserStats(stats[0]);
        }
      }
      
      if (membershipActor) {
        // Load membership status
        const membershipStatus = await membershipActor.get_membership_status(Principal.fromText(effectivePrincipal));
        setMembership(membershipStatus?.[0] || null);
      }
    } catch (err) {
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save profile
  const saveProfile = async () => {
    if (!effectivePrincipal || !isConnected) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const userActor = getUserActor();
      if (!userActor) throw new Error('User canister not available');
      
      const result = await userActor.initialize(
        profileForm.name,
        profileForm.email,
        profileForm.referral_code ? [profileForm.referral_code] : []
      );
      
      setSuccess(result);
      await loadUserData(); // Reload data
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!effectivePrincipal || !isConnected) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const userActor = getUserActor();
      if (!userActor) throw new Error('User canister not available');
      
      const result = await userActor.update_preferences(preferencesForm);
      setSuccess(result);
      await loadUserData(); // Reload data
    } catch (err) {
      setError('Failed to save preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Track module access (for premium features)
  const trackModuleAccess = async (moduleName) => {
    if (!effectivePrincipal || !isConnected) return;
    
    try {
      const userActor = getUserActor();
      if (userActor) {
        await userActor.track_module_access(moduleName);
      }
    } catch (err) {
      console.warn('Failed to track module access:', err);
    }
  };

  // Load data on mount and when connection changes
  useEffect(() => {
    if (effectivePrincipal && isConnected) {
      loadUserData();
    }
  }, [effectivePrincipal, isConnected]);

  // Get membership tier for premium features
  const getMembershipTier = () => {
    if (!membership || !membership.tier) return null;
    return Object.keys(membership.tier)[0];
  };

  const membershipTier = getMembershipTier();
  const isPremium = membershipTier === 'Premium' || membershipTier === 'Elite';

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
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-4xl font-bold text-white mb-4">User Management</h1>
          <p className="text-xl text-gray-300">
            Manage your account, authentication, and profile data
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

        {/* Connection Status */}
        <div className="glass-card-dark p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="font-medium text-white">
                {isConnected ? 'Connected to Internet Computer' : 'Not Connected'}
              </span>
              {effectivePrincipal && (
                <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                  {effectivePrincipal}
                </span>
              )}
            </div>
            {!isConnected && (
              <button
                onClick={connectPlug}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/40 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/40 border border-green-500/40 text-green-200 p-4 rounded-lg">
            {success}
          </div>
        )}

        {!isConnected ? (
          <div className="glass-card-dark p-8 border border-white/10 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access your profile and premium features
            </p>
            <button
              onClick={connectPlug}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90"
            >
              Connect Wallet
            </button>
          </div>
        ) : loading ? (
          <div className="glass-card-dark p-8 border border-white/10 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-300">Loading your profile...</p>
          </div>
        ) : (
          <>
            {/* Profile Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="glass-card-dark p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Referral Code (Optional)</label>
                    <input
                      type="text"
                      value={profileForm.referral_code}
                      onChange={(e) => setProfileForm({...profileForm, referral_code: e.target.value})}
                      className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                      placeholder="Enter referral code"
                    />
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving || !profileForm.name || !profileForm.email}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>

              {/* User Stats */}
              <div className="glass-card-dark p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4">Activity Stats</h2>
                {userStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Modules Accessed</span>
                      <span className="font-bold text-amber-400">{userStats.modules_count}/{userStats.total_modules}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${(userStats.modules_count/userStats.total_modules)*100}%`}}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-amber-400">{userStats.days_active}</div>
                        <div className="text-sm text-gray-300">Days Active</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-emerald-400">{userData?.total_actions || 0}</div>
                        <div className="text-sm text-gray-300">Total Actions</div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-4">
                      <p>Member since: {userStats.join_date}</p>
                      <p>Last active: {userStats.last_active}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <p>No stats available yet. Start using the platform to see your activity!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={preferencesForm.theme}
                    onChange={(e) => setPreferencesForm({...preferencesForm, theme: e.target.value})}
                    className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    value={preferencesForm.language}
                    onChange={(e) => setPreferencesForm({...preferencesForm, language: e.target.value})}
                    className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Privacy Level</label>
                  <select
                    value={preferencesForm.privacy_level}
                    onChange={(e) => setPreferencesForm({...preferencesForm, privacy_level: e.target.value})}
                    className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={preferencesForm.notifications}
                    onChange={(e) => setPreferencesForm({...preferencesForm, notifications: e.target.checked})}
                    className="mr-3 w-4 h-4 text-amber-500 bg-black/30 border-white/10 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="notifications" className="text-sm font-medium text-gray-300">
                    Enable Notifications
                  </label>
                </div>
              </div>
              <button
                onClick={savePreferences}
                disabled={saving}
                className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {/* Premium Features */}
            {isPremium && (
              <div className="glass-card-dark p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-pink-500/10">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">👑</div>
                  <h2 className="text-2xl font-bold text-amber-400">Premium Features</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="font-bold text-white mb-2">🔒 Advanced Analytics</h3>
                    <p className="text-sm text-gray-300">Detailed insights into your activity and engagement</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="font-bold text-white mb-2">🚀 Priority Support</h3>
                    <p className="text-sm text-gray-300">Get priority access to customer support</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="font-bold text-white mb-2">🎁 Exclusive Content</h3>
                    <p className="text-sm text-gray-300">Access premium guides and tutorials</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => trackModuleAccess('premium_features')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90"
                  >
                    Explore Premium Features
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Security & Identity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Internet Identity</h3>
                    <p className="text-sm text-gray-300">Cryptographic authentication via Internet Computer</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Principal ID</h3>
                    <p className="text-sm text-gray-300 font-mono break-all">{effectivePrincipal}</p>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(effectivePrincipal)}
                    className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {!isPremium && (
              <div className="glass-card-dark p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3>
                  <p className="text-gray-300 mb-6">
                    Unlock exclusive features, priority support, and advanced analytics
                  </p>
                  <button 
                    onClick={() => window.location.href = '/membership'}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90"
                  >
                    View Membership Options
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserPage; 
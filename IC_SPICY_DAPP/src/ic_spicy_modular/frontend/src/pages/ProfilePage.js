import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { idlFactory as profile_idlFactory } from '../declarations/profile';
import { idlFactory as membership_idlFactory } from '../declarations/membership';
import { idlFactory as game_idlFactory } from '../declarations/game';
import { CANISTER_IDS } from '../config';

const ProfilePage = () => {
  const { principal, plugConnected, connectPlug, disconnectPlug } = useWallet();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
    notifications: true,
    darkMode: false,
    privacyLevel: 'public'
  });
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [gameStats, setGameStats] = useState({
    level: 0,
    experience: 0,
    totalPlants: 0,
    achievements: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileActor, setProfileActor] = useState(null);
  const [membershipActor, setMembershipActor] = useState(null);
  const [gameActor, setGameActor] = useState(null);

  useEffect(() => {
    if (plugConnected && principal) {
      (async () => {
        try {
          const profileA = await window.ic.plug.createActor({ canisterId: profile_idlFactory.canisterId, interfaceFactory: profile_idlFactory });
          const membershipA = await window.ic.plug.createActor({ canisterId: membership_idlFactory.canisterId, interfaceFactory: membership_idlFactory });
          const gameA = await window.ic.plug.createActor({ canisterId: game_idlFactory.canisterId, interfaceFactory: game_idlFactory });
          
          setProfileActor(profileA);
          setMembershipActor(membershipA);
          setGameActor(gameA);
          
          // Fetch user profile
          const userProfile = await profileA.getUserProfile(principal);
          if (userProfile.length > 0) {
            setProfile({
              username: userProfile[0].username || '',
              email: userProfile[0].email || '',
              bio: userProfile[0].bio || '',
              avatar: userProfile[0].avatar || '',
              notifications: userProfile[0].notifications || true,
              darkMode: userProfile[0].darkMode || false,
              privacyLevel: userProfile[0].privacyLevel || 'public'
            });
          }
          
          // Fetch membership status
          const membership = await membershipA.getMembershipStatus(principal);
          setMembershipStatus(membership);
          
          // Fetch game stats
          const playerData = await gameA.getPlayerData(principal);
          if (playerData.length > 0) {
            const player = playerData[0];
            setGameStats({
              level: Number(player.level),
              experience: Number(player.experience),
              totalPlants: player.plants ? player.plants.length : 0,
              achievements: 0 // Will be fetched separately
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      })();
    }
  }, [plugConnected, principal]);

  const handleSaveProfile = async () => {
    if (!profileActor || !principal) return;
    
    setSaving(true);
    try {
      const success = await profileActor.updateUserProfile(
        principal,
        profile.username,
        profile.email,
        profile.bio,
        profile.avatar,
        profile.notifications,
        profile.darkMode,
        profile.privacyLevel
      );
      
      if (success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!profileActor || !principal) return;
    
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const success = await profileActor.deleteUserProfile(principal);
      if (success) {
        alert('Account deleted successfully');
        disconnectPlug();
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
    setLoading(false);
  };

  const getMembershipBadge = (status) => {
    switch (status) {
      case 'premium': return { text: 'Premium', color: 'text-purple-400', bg: 'bg-purple-400/20' };
      case 'gold': return { text: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
      case 'silver': return { text: 'Silver', color: 'text-gray-400', bg: 'bg-gray-400/20' };
      case 'bronze': return { text: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/20' };
      default: return { text: 'Free', color: 'text-gray-400', bg: 'bg-gray-400/20' };
    }
  };

  if (!plugConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your Plug wallet to access your profile!</h2>
        <button
          onClick={connectPlug}
          className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition"
        >
          Connect Plug Wallet
        </button>
      </div>
    );
  }

  const membershipBadge = getMembershipBadge(membershipStatus);

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center overflow-x-hidden space-y-8">
      {/* Luxury Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 opacity-70" />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>

      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem'}}>
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-100 mb-4 tracking-tight">User Profile</h1>
        <p className="text-xl text-gray-100">Personal settings, preferences, and account management</p>
        <div className="text-sm text-gray-300 mt-2">
          Principal: {principal?.substring(0, 8)}...{principal?.substring(principal.length - 8)}
        </div>
      </div>

      {/* Profile Overview */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Profile Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-dark border border-yellow-200/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-200 mb-2">{gameStats.level}</div>
            <div className="text-lg text-gray-300">Level</div>
          </div>
          <div className="glass-card-dark border border-yellow-200/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-green-200 mb-2">{gameStats.totalPlants}</div>
            <div className="text-lg text-gray-300">Plants</div>
          </div>
          <div className="glass-card-dark border border-yellow-200/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">💎</div>
            <div className={`text-2xl font-bold ${membershipBadge.color} mb-2`}>{membershipBadge.text}</div>
            <div className="text-lg text-gray-300">Membership</div>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Profile Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-100 mb-2">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-100 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-100 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400 h-24"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-100 mb-2">Avatar URL</label>
            <input
              type="url"
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-100 mb-2">Privacy Level</label>
            <select
              value={profile.privacyLevel}
              onChange={(e) => setProfile({ ...profile, privacyLevel: e.target.value })}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-yellow-100">Enable Notifications</span>
            <input
              type="checkbox"
              checked={profile.notifications}
              onChange={() => setProfile({ ...profile, notifications: !profile.notifications })}
              className="h-5 w-5 text-yellow-500 focus:ring-yellow-500 border-yellow-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-yellow-100">Dark Mode</span>
            <input
              type="checkbox"
              checked={profile.darkMode}
              onChange={() => setProfile({ ...profile, darkMode: !profile.darkMode })}
              className="h-5 w-5 text-yellow-500 focus:ring-yellow-500 border-yellow-300 rounded"
            />
          </div>
        </div>
        <button 
          onClick={handleSaveProfile}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Account Actions */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Account Actions</h2>
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition"
            disabled={loading}
          >
            {loading ? 'Deleting...' : '🗑️ Delete Account'}
          </button>
          <button 
            onClick={disconnectPlug}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition"
          >
            🔓 Log Out
          </button>
        </div>
      </div>

      {/* Profile Features */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">👤 Profile Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Personalization</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Custom username and bio</li>
              <li>Avatar and profile picture</li>
              <li>Privacy level settings</li>
              <li>Theme preferences</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Account Management</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Secure IC blockchain storage</li>
              <li>Membership status tracking</li>
              <li>Game statistics integration</li>
              <li>Account deletion options</li>
            </ul>
          </div>
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

export default ProfilePage; 
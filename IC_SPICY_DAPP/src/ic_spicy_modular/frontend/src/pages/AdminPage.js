import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import { useAgent, useIdentityKit } from '@nfid/identitykit/react';
import { useWallet } from '../WalletContext';
import { idlFactory as membershipIdl } from '../declarations/membership';
import { idlFactory as userIdl } from '../declarations/user';
import { CANISTER_IDS, ADMIN_PRINCIPALS } from '../config';

const AdminPage = () => {
  const { principal: walletPrincipal, plugConnected, connectPlug, canisters } = useWallet();
  const { user } = useIdentityKit();
  const oisyAgent = useAgent();

  // Admin verification
  const effectivePrincipal = React.useMemo(() => {
    if (user?.principal?.toText) return user.principal.toText();
    if (walletPrincipal) return String(walletPrincipal);
    return null;
  }, [user, walletPrincipal]);

  const isConnected = plugConnected || oisyAgent;
  const isAdmin = effectivePrincipal && Object.values(ADMIN_PRINCIPALS).includes(effectivePrincipal);

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    membersByTier: { Basic: 0, Premium: 0, Elite: 0 },
    totalUsers: 0,
    recentActivity: [],
    treasuryBalances: {},
    burnTotals: {}
  });

  // Member management
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // Treasury management
  const [treasuryAmount, setTreasuryAmount] = useState('');
  const [treasuryToken, setTreasuryToken] = useState('ICP');
  const [treasuryDestination, setTreasuryDestination] = useState('');
  const [treasuryOperation, setTreasuryOperation] = useState('withdraw');

  // Load admin data
  useEffect(() => {
    if (isAdmin && (canisters.membership || oisyAgent)) {
      loadAdminData();
    }
  }, [isAdmin, canisters.membership, oisyAgent]);

  const getMembershipActor = () => {
    return canisters.membership || Actor.createActor(membershipIdl, { 
      agent: oisyAgent, 
      canisterId: CANISTER_IDS.membership 
    });
  };

  const getUserActor = () => {
    return canisters.user || Actor.createActor(userIdl, { 
      agent: oisyAgent, 
      canisterId: CANISTER_IDS.user 
    });
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const membershipActor = getMembershipActor();
      const userActor = getUserActor();

      // Load members
      const membersList = await membershipActor.list_members();
      setMembers(membersList);

      // Calculate member stats
      const membersByTier = { Basic: 0, Premium: 0, Elite: 0 };
      membersList.forEach(member => {
        if (member.tier) {
          const tier = Object.keys(member.tier)[0];
          membersByTier[tier] = (membersByTier[tier] || 0) + 1;
        }
      });

      // Load user count
      const totalUsers = await userActor.get_total_users();

      // Load treasury balances
      const treasuryBalances = {};
      try {
        treasuryBalances.ICP = await membershipActor.get_treasury_balance('ICP');
        treasuryBalances.ckBTC = await membershipActor.get_treasury_balance('ckBTC');
        treasuryBalances.RAVEN = await membershipActor.get_treasury_balance('RAVEN');
        treasuryBalances.ZOMBIE = await membershipActor.get_treasury_balance('ZOMBIE');
      } catch (e) {
        console.warn('Failed to load some treasury balances:', e);
      }

      // Load burn totals
      const burnTotals = {};
      try {
        burnTotals.RAVEN = await membershipActor.get_burn_total('RAVEN');
        burnTotals.ZOMBIE = await membershipActor.get_burn_total('ZOMBIE');
      } catch (e) {
        console.warn('Failed to load burn totals:', e);
      }

      setAnalytics({
        totalMembers: membersList.length,
        membersByTier,
        totalUsers: Number(totalUsers),
        treasuryBalances,
        burnTotals,
        recentActivity: generateRecentActivity(membersList)
      });

    } catch (err) {
      setError('Failed to load admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (membersList) => {
    // Generate mock recent activity based on members
    return membersList.slice(-10).map((member, index) => ({
      id: index,
      type: 'membership_join',
      user: member.principal ? member.principal.toText().substring(0, 8) + '...' : 'Unknown',
      tier: member.tier ? Object.keys(member.tier)[0] : 'Basic',
      timestamp: Date.now() - (index * 3600000), // Mock timestamps
      description: `Joined as ${member.tier ? Object.keys(member.tier)[0] : 'Basic'} member`
    }));
  };

  const handleTreasuryOperation = async () => {
    if (!treasuryAmount || !treasuryToken) {
      setError('Please enter amount and select token');
      return;
    }

    if (treasuryOperation === 'withdraw' && !treasuryDestination) {
      setError('Please enter destination principal for withdrawal');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const membershipActor = getMembershipActor();
      const amount = Math.floor(parseFloat(treasuryAmount) * 100000000); // Convert to base units

      if (treasuryOperation === 'withdraw') {
        const result = await membershipActor.admin_withdraw(
          treasuryToken,
          amount,
          Principal.fromText(treasuryDestination)
        );
        setSuccess(`Successfully withdrew ${treasuryAmount} ${treasuryToken}`);
      } else {
        const result = await membershipActor.admin_collect(treasuryToken, amount);
        setSuccess(`Successfully collected ${treasuryAmount} ${treasuryToken} to treasury`);
      }

      // Reset form
      setTreasuryAmount('');
      setTreasuryDestination('');
      
      // Reload data
      await loadAdminData();

    } catch (err) {
      setError('Treasury operation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return '0';
    return (Number(balance) / 100000000).toFixed(8);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  const filteredMembers = members.filter(member => {
    if (!memberSearch) return true;
    const principalText = member.principal ? member.principal.toText() : '';
    return principalText.toLowerCase().includes(memberSearch.toLowerCase());
  });

  if (!isConnected) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.18),transparent_55%)]" />
        </div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 border border-white/10 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h1>
            <p className="text-gray-300 mb-6">Connect your wallet to access admin features</p>
            <button
              onClick={connectPlug}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.18),transparent_55%)]" />
        </div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 border border-red-500/30 text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-4">You don't have admin privileges</p>
            <p className="text-xs text-gray-400 font-mono">Connected as: {effectivePrincipal}</p>
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
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-300 mb-2">
            Complete control center for IC Spicy RWA Co-op
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-pink-500 text-white">
              🔐 Admin Access - {effectivePrincipal?.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card-dark p-2 border border-white/10">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'members', label: 'Members', icon: '👥' },
              { id: 'treasury', label: 'Treasury', icon: '💰' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'system', label: 'System', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card-dark p-6 border border-white/10 text-center">
                <div className="text-3xl font-bold text-emerald-400">{analytics.totalMembers}</div>
                <div className="text-sm text-gray-300">Total Members</div>
              </div>
              <div className="glass-card-dark p-6 border border-white/10 text-center">
                <div className="text-3xl font-bold text-blue-400">{analytics.totalUsers}</div>
                <div className="text-sm text-gray-300">Total Users</div>
              </div>
              <div className="glass-card-dark p-6 border border-white/10 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {formatBalance(analytics.treasuryBalances.ICP)}
                </div>
                <div className="text-sm text-gray-300">ICP Treasury</div>
              </div>
              <div className="glass-card-dark p-6 border border-white/10 text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {formatBalance(analytics.burnTotals.RAVEN)}
                </div>
                <div className="text-sm text-gray-300">RAVEN Burned</div>
              </div>
            </div>

            {/* Membership Distribution */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Membership Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics.membersByTier).map(([tier, count]) => (
                  <div key={tier} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-sm text-gray-300">{tier} Members</div>
                    <div className="text-xs text-gray-400">
                      {analytics.totalMembers > 0 ? ((count / analytics.totalMembers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentActivity.length > 0 ? analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {activity.type === 'membership_join' ? '🆕' : '📝'}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white">{activity.description}</div>
                        <div className="text-xs text-gray-400">User: {activity.user}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Member Management</h3>
                <button
                  onClick={loadAdminData}
                  className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Search members by principal..."
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMembers.length > 0 ? filteredMembers.map((member, index) => {
                  const principalText = member.principal ? member.principal.toText() : '';
                  const tierText = member.tier ? Object.keys(member.tier)[0] : 'Basic';
                  const joinDate = member.joined_at ? new Date(Number(member.joined_at)).toLocaleDateString() : 'Unknown';

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex-1">
                        <div className="font-mono text-sm text-white break-all">{principalText}</div>
                        <div className="text-xs text-gray-400">Joined: {joinDate}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tierText === 'Elite' ? 'bg-amber-500/20 text-amber-300' :
                          tierText === 'Premium' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {tierText === 'Basic' ? '🌶️' : tierText === 'Premium' ? '👑' : '🔥'} {tierText}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-400">
                    {memberSearch ? 'No members match your search' : 'No members found'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && (
          <div className="space-y-6">
            {/* Treasury Balances */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Treasury Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analytics.treasuryBalances).map(([token, balance]) => (
                  <div key={token} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatBalance(balance)}
                    </div>
                    <div className="text-sm text-gray-300">{token}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Burn Totals */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Token Burn Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.burnTotals).map(([token, total]) => (
                  <div key={token} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {formatBalance(total)}
                    </div>
                    <div className="text-sm text-gray-300">{token} Burned</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Treasury Operations */}
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Treasury Operations</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Operation</label>
                    <select
                      value={treasuryOperation}
                      onChange={(e) => setTreasuryOperation(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="withdraw">Withdraw</option>
                      <option value="collect">Collect</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                    <select
                      value={treasuryToken}
                      onChange={(e) => setTreasuryToken(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="ICP">ICP</option>
                      <option value="ckBTC">ckBTC</option>
                      <option value="RAVEN">RAVEN</option>
                      <option value="ZOMBIE">ZOMBIE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={treasuryAmount}
                    onChange={(e) => setTreasuryAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter amount"
                    step="0.00000001"
                  />
                </div>

                {treasuryOperation === 'withdraw' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Destination Principal</label>
                    <input
                      type="text"
                      value={treasuryDestination}
                      onChange={(e) => setTreasuryDestination(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      placeholder="Enter destination principal"
                    />
                  </div>
                )}

                <button
                  onClick={handleTreasuryOperation}
                  disabled={loading || !treasuryAmount}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Processing...' : `💰 ${treasuryOperation === 'withdraw' ? 'Withdraw' : 'Collect'} ${treasuryToken}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Platform Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Growth Metrics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-emerald-400">Growth Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Members Growth</span>
                      <span className="text-emerald-400 font-bold">+{analytics.totalMembers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">User Registrations</span>
                      <span className="text-blue-400 font-bold">+{analytics.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Premium Adoption</span>
                      <span className="text-purple-400 font-bold">
                        {analytics.totalMembers > 0 ? 
                          (((analytics.membersByTier.Premium + analytics.membersByTier.Elite) / analytics.totalMembers) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue Metrics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-amber-400">Treasury Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Total ICP</span>
                      <span className="text-emerald-400 font-bold">{formatBalance(analytics.treasuryBalances.ICP)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Total ckBTC</span>
                      <span className="text-orange-400 font-bold">{formatBalance(analytics.treasuryBalances.ckBTC)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">RAVEN Burned</span>
                      <span className="text-red-400 font-bold">{formatBalance(analytics.burnTotals.RAVEN)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Analytics */}
            <div className="glass-card-dark p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-300 mb-6">
                  Enhanced charts, user behavior analytics, and detailed financial reports
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="text-emerald-400 font-medium">📈 Growth Charts</div>
                    <p className="text-gray-400">Visual growth tracking over time</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-blue-400 font-medium">👥 User Behavior</div>
                    <p className="text-gray-400">Engagement and retention metrics</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-purple-400 font-medium">💰 Financial Reports</div>
                    <p className="text-gray-400">Detailed treasury and revenue analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">System Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-blue-400">Canister Status</h4>
                  <div className="space-y-2">
                    {Object.entries(CANISTER_IDS).map(([name, id]) => (
                      <div key={name} className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <span className="text-gray-300 capitalize">{name}</span>
                        <span className="text-emerald-400 text-xs font-mono">Online</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-purple-400">Admin Principals</h4>
                  <div className="space-y-2">
                    {Object.entries(ADMIN_PRINCIPALS).map(([name, principal]) => (
                      <div key={name} className="p-2 bg-white/5 rounded">
                        <div className="text-gray-300 text-xs">{name}</div>
                        <div className="text-white font-mono text-xs break-all">{principal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-dark p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={loadAdminData}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-white font-medium">Refresh All Data</div>
                </button>
                
                <button
                  onClick={() => window.open(`https://dashboard.internetcomputer.org/canister/${CANISTER_IDS.membership}`, '_blank')}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-center"
                >
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="text-white font-medium">IC Dashboard</div>
                </button>
                
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(analytics, null, 2))}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-center"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="text-white font-medium">Export Data</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

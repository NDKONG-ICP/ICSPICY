import React, { useEffect, useState } from 'react';
import { useWallet } from '../WalletContext';
import { validateForm, rateLimiter, auditLog, handleError, validateInput } from '../utils/security';
import { ADMIN_PRINCIPALS } from '../config';

const TIER_MAP = [
  { id: 1, name: 'Basic', price: 0, features: ['Access to public modules', 'Community support'], icon: '🆓', motoko: { Basic: null } },
  { id: 2, name: 'Premium', price: 9.99, features: ['All Basic features', 'Early access to new modules', 'Priority support'], icon: '🚀', motoko: { Premium: null } },
  { id: 3, name: 'Elite', price: 49.99, features: ['All Premium features', 'Exclusive NFT drops', 'VIP events', 'Personalized AI'], icon: '👑', motoko: { Elite: null } },
];

const MembershipPage = () => {
  const { principal, plugConnected, connectPlug, canisters } = useWallet();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [spicyRequired, setSpicyRequired] = useState({});

  // Fetch membership status
  useEffect(() => {
    if (canisters.membership && principal) {
      setLoading(true);
      setError('');
      canisters.membership.get_membership_status(principal)
        .then((res) => {
          setMembership(res);
        })
        .catch((e) => setError('Failed to fetch membership: ' + e.message))
        .finally(() => setLoading(false));
    }
  }, [canisters.membership, principal]);

  // Fetch required $SPICY for each tier
  useEffect(() => {
    if (canisters.membership) {
      TIER_MAP.forEach(async (tier) => {
        try {
          const amt = await canisters.membership.get_required_spicy(tier.motoko);
          setSpicyRequired((prev) => ({ ...prev, [tier.name]: amt }));
        } catch (e) {
          console.error('Failed to get required SPICY for tier:', tier.name, e);
        }
      });
    }
  }, [canisters.membership]);

  // Fetch all members (admin only)
  useEffect(() => {
    if (canisters.membership && principal === ADMIN_PRINCIPALS.membership) {
      canisters.membership.list_members().then(setMembers).catch(() => {});
    }
  }, [canisters.membership, principal]);

  const handleJoinMembership = async (tier) => {
    if (!canisters.membership || !principal) return;

    // Rate limiting
    if (!rateLimiter.canPerformAction('join_membership', principal, 2, 60000)) {
      alert('Please wait before joining again');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.membership.join_membership(tier.motoko);
      alert(result);
      auditLog.log('join_membership', principal, { tier });
      setMembership(await canisters.membership.get_membership_status(principal));
    } catch (error) {
      alert(handleError(error, 'joining membership'));
    }
    setLoading(false);
  };

  const handleUpgradeMembership = async (newTier) => {
    if (!canisters.membership || !principal) return;

    // Rate limiting
    if (!rateLimiter.canPerformAction('upgrade_membership', principal, 2, 60000)) {
      alert('Please wait before upgrading again');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.membership.upgrade_membership(newTier.motoko);
      alert(result);
      auditLog.log('upgrade_membership', principal, { newTier });
      setMembership(await canisters.membership.get_membership_status(principal));
    } catch (error) {
      alert(handleError(error, 'upgrading membership'));
    }
    setLoading(false);
  };

  const refreshStatus = async () => {
    if (!canisters.membership || !principal) return;
    setLoading(true);
    setError('');
    try {
      const res = await canisters.membership.get_membership_status(principal);
      setMembership(res);
    } catch (e) {
      setError('Failed to refresh membership: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Membership</h1>
        <p className="text-xl text-gray-600">Exclusive features and subscription benefits</p>
      </div>

      {/* Wallet connect */}
      {!plugConnected && (
        <div className="flex flex-col items-center">
          <button onClick={connectPlug} className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition mb-4">
            Connect Plug Wallet
          </button>
          <p className="text-gray-600">Connect your Plug wallet to manage your membership.</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Membership status */}
      {plugConnected && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          {loading ? (
            <div className="text-lg text-gray-500">Loading membership status...</div>
          ) : membership ? (
            <>
              <div className="text-3xl mb-2">{TIER_MAP.find(t => t.name === Object.keys(membership.tier)[0])?.icon}</div>
              <div className="text-xl font-bold text-amber-600 mb-2">{Object.keys(membership.tier)[0]} Member</div>
              <div className="text-gray-700 mb-2">Joined: {new Date(Number(membership.joined) / 1_000_000).toLocaleString()}</div>
              <div className="text-green-600 font-semibold">Active Membership</div>
            </>
          ) : (
            <div className="text-gray-700">You are not a member yet.</div>
          )}
        </div>
      )}

      {/* Membership Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIER_MAP.map((tier) => {
          const isCurrent = membership && Object.keys(membership.tier)[0] === tier.name;
          const canUpgrade = membership && TIER_MAP.findIndex(t => t.name === Object.keys(membership.tier)[0]) < tier.id - 1;
          return (
            <div key={tier.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="text-4xl mb-2">{tier.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className="text-2xl font-bold text-amber-600 mb-2 flex items-center gap-2">
                {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}/mo`}
                {spicyRequired[tier.name] > 0 && (
                  <span className="ml-2 text-yellow-500">🌶 {Number(spicyRequired[tier.name]) / 1_000_000_000} $SPICY</span>
                )}
              </div>
              <ul className="text-gray-600 text-sm mb-4 space-y-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
              {tier.price === 0 ? (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
                  Basic
                </button>
              ) : !plugConnected ? (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
                  Connect Wallet
                </button>
              ) : isCurrent ? (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-green-400 text-white cursor-not-allowed" disabled>
                  Current Plan
                </button>
              ) : membership && canUpgrade ? (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-amber-500 text-white hover:bg-amber-600" onClick={() => handleUpgradeMembership(tier)} disabled={loading}>
                  {loading ? 'Upgrading...' : 'Upgrade'}
                </button>
              ) : !membership ? (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-amber-500 text-white hover:bg-amber-600" onClick={() => handleJoinMembership(tier)} disabled={loading}>
                  {loading ? 'Joining...' : 'Join'}
                </button>
              ) : (
                <button className="w-full py-2 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
                  Not available
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin: Member Listing */}
      {plugConnected && principal === ADMIN_PRINCIPALS.membership && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">All Members (Admin View)</h3>
          <div className="space-y-2">
            {members.map((member, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{member.principal}</span>
                <span className="text-sm font-medium text-amber-600">{Object.keys(member.tier)[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage; 
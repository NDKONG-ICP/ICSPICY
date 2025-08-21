import React, { useState, useEffect } from 'react';
import { useWallet } from '../WalletContext';
import { validateForm, rateLimiter, auditLog, handleError } from '../utils/security';

const PortalPage = () => {
  const { principal, plugConnected, connectPlug, canisters } = useWallet();
  const [stakeInput, setStakeInput] = useState('');
  const [lockMonths, setLockMonths] = useState(3);
  const [userStake, setUserStake] = useState(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const minMonths = 3;
  const maxMonths = 24;
  const minAPY = 12.5;
  const maxAPY = 30;
  const calcAPY = minAPY + ((lockMonths - minMonths) / (maxMonths - minMonths)) * (maxAPY - minAPY);
  const calcHeat = ((stakeInput * (calcAPY / 100)) * (lockMonths / 12)).toFixed(2);

  // Load user stake data
  const loadUserStake = async () => {
    if (!canisters.portal || !principal) return;
    
    try {
      const stake = await canisters.portal.get_stake();
      setUserStake(stake);
    } catch (error) {
      console.error('Error loading user stake:', error);
    }
  };

  // Load total staked amount
  const loadTotalStaked = async () => {
    if (!canisters.portal) return;
    
    try {
      const total = await canisters.portal.total_staked();
      setTotalStaked(total);
    } catch (error) {
      console.error('Error loading total staked:', error);
    }
  };

  // Load governance proposals
  const loadProposals = async () => {
    if (!canisters.portal) return;
    
    try {
      const proposalList = await canisters.portal.list_proposals();
      setProposals(proposalList);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  // Stake tokens
  const handleStake = async () => {
    if (!canisters.portal || !principal) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('stake', principal, 3, 60000)) {
      setMessage('Please wait before making another stake operation');
      setMessageType('error');
      return;
    }

    // Input validation
    const errors = validateForm.staking(Number(stakeInput), lockMonths);
    if (errors.length > 0) {
      setMessage(errors[0]);
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.portal.stake(parseInt(stakeInput), lockMonths);
      setMessage(result);
      setMessageType('success');
      setStakeInput('');
      await loadUserStake();
      await loadTotalStaked();
      
      // Audit logging
      auditLog.log('stake', principal, { amount: stakeInput, lockMonths });
    } catch (error) {
      const errorMessage = handleError(error, 'staking');
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Unstake tokens
  const handleUnstake = async () => {
    if (!canisters.portal || !principal) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('unstake', principal, 2, 300000)) { // 5 minutes
      setMessage('Please wait before making another unstake operation');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.portal.unstake();
      setMessage(result);
      setMessageType('success');
      await loadUserStake();
      await loadTotalStaked();
      
      // Audit logging
      auditLog.log('unstake', principal, {});
    } catch (error) {
      const errorMessage = handleError(error, 'unstaking');
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Claim rewards
  const handleClaimRewards = async () => {
    if (!canisters.portal || !principal) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('claim_rewards', principal, 5, 300000)) { // 5 minutes
      setMessage('Please wait before making another claim operation');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.portal.claim_rewards();
      setMessage(result);
      setMessageType('success');
      await loadUserStake();
      
      // Audit logging
      auditLog.log('claim_rewards', principal, {});
    } catch (error) {
      const errorMessage = handleError(error, 'claiming rewards');
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Create governance proposal
  const handleCreateProposal = async (title, description) => {
    if (!canisters.portal || !principal) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('create_proposal', principal, 2, 3600000)) { // 1 hour
      setMessage('Please wait before creating another proposal');
      setMessageType('error');
      return;
    }

    // Input validation
    if (!title || title.length > 100) {
      setMessage('Title must be 1-100 characters');
      setMessageType('error');
      return;
    }

    if (!description || description.length > 1000) {
      setMessage('Description must be 1-1000 characters');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const proposalId = await canisters.portal.create_proposal(title, description);
      setMessage(`Proposal created with ID: ${proposalId}`);
      setMessageType('success');
      await loadProposals();
      
      // Audit logging
      auditLog.log('create_proposal', principal, { title, description, proposalId });
    } catch (error) {
      const errorMessage = handleError(error, 'creating proposal');
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Vote on proposal
  const handleVote = async (proposalId, voteFor) => {
    if (!canisters.portal || !principal) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('vote', principal, 10, 60000)) { // 1 minute
      setMessage('Please wait before voting again');
      setMessageType('error');
      return;
    }

    // Input validation
    if (!proposalId || proposalId <= 0) {
      setMessage('Invalid proposal ID');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const result = await canisters.portal.vote(proposalId, voteFor);
      setMessage(result);
      setMessageType('success');
      await loadProposals();
      
      // Audit logging
      auditLog.log('vote', principal, { proposalId, voteFor });
    } catch (error) {
      const errorMessage = handleError(error, 'voting');
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when wallet connects
  useEffect(() => {
    if (plugConnected && canisters.portal) {
      loadUserStake();
      loadTotalStaked();
      loadProposals();
    }
  }, [plugConnected, canisters.portal, principal]);

  // Wallet connection section
  if (!plugConnected) {
    return (
      <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center">
        <div className="glass-card-dark max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🏦</div>
          <h1 className="text-2xl font-bold text-yellow-100 mb-4">Staking Portal & Governance</h1>
          <p className="text-gray-300 mb-6">
            Connect your Plug wallet to access staking and governance features
          </p>
          <button
            onClick={connectPlug}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold py-3 px-6 rounded-md hover:bg-yellow-600 transition-colors"
          >
            🔌 Connect Plug Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center overflow-x-hidden space-y-8">
      {/* Message display */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-500' : 
          messageType === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {message}
          <button onClick={() => setMessage('')} className="ml-2">×</button>
        </div>
      )}

      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem'}}>
        <div className="text-6xl mb-4">🏦</div>
        <h1 className="text-4xl font-extrabold text-yellow-100 mb-4">Staking Portal & Governance</h1>
        <p className="text-xl text-gray-100">
          Connected as: {principal?.slice(0, 10)}...{principal?.slice(-10)}
        </p>
      </div>

      {/* Staking Calculator */}
      <div className="glass-card-dark max-w-xl w-full mx-auto mb-8 p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">Staking Calculator</h2>
        <div className="w-full flex flex-col md:flex-row md:items-end gap-6 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-yellow-100 mb-2">Amount to Stake ($SPICY)</label>
            <input
              type="number"
              min="1"
              value={stakeInput}
              onChange={e => setStakeInput(Number(e.target.value))}
              className="w-full p-3 border border-yellow-400/40 rounded-md bg-black/30 text-yellow-100 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Enter $SPICY amount"
            />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <label className="block text-sm font-medium text-yellow-100 mb-2">Staking Duration (months)</label>
            <div className="flex items-center w-full">
              <span className="text-2xl mr-2">3</span>
              <input
                type="range"
                min={minMonths}
                max={maxMonths}
                value={lockMonths}
                onChange={e => setLockMonths(Number(e.target.value))}
                className="flex-1 accent-red-500 h-2 rounded-lg appearance-none bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                style={{ background: 'none' }}
              />
              <span className="text-2xl ml-2">24</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <span className="text-lg">{'🌶️'.repeat(Math.round((lockMonths - minMonths) / (maxMonths - minMonths) * 7) + 1)}</span>
              <span className="text-yellow-200 font-bold">{lockMonths} mo</span>
            </div>
          </div>
        </div>
        <div className="w-full mt-4 p-4 rounded-lg bg-black/40 border border-yellow-400/20 flex flex-col items-center">
          <div className="text-lg text-yellow-100 mb-1">APY: <span className="font-bold text-orange-200">{calcAPY.toFixed(2)}%</span></div>
          <div className="text-lg text-yellow-100">Estimated $HEAT Earned: <span className="font-bold text-orange-200">{calcHeat}</span></div>
        </div>
      </div>

      {/* User Stake Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card-dark text-center">
          <div className="text-3xl font-bold text-yellow-200">
            {userStake ? Number(userStake.amount) : 0}
          </div>
          <div className="text-sm text-gray-100">Your Staked $SPICY</div>
        </div>
        <div className="glass-card-dark text-center">
          <div className="text-3xl font-bold text-green-200">
            {userStake ? userStake.apy.toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-100">Your APY</div>
        </div>
        <div className="glass-card-dark text-center">
          <div className="text-3xl font-bold text-orange-200">
            {userStake ? userStake.rewards : 0}
          </div>
          <div className="text-sm text-gray-100">$HEAT Rewards Earned</div>
        </div>
        <div className="glass-card-dark text-center">
          <div className="text-3xl font-bold text-purple-200">
            {totalStaked.toLocaleString()}
          </div>
          <div className="text-sm text-gray-100">Total Staked</div>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stake */}
        <div className="glass-card-dark">
          <h2 className="text-2xl font-bold text-yellow-100 mb-4">Stake $SPICY Tokens</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Stake ($SPICY)
              </label>
              <input
                type="number"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-yellow-400/40 rounded-md bg-black/30 text-yellow-100 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lock Period (months)
              </label>
              <input
                type="number"
                min="3"
                max="24"
                value={lockMonths}
                onChange={(e) => setLockMonths(Number(e.target.value))}
                className="w-full p-3 border border-yellow-400/40 rounded-md bg-black/30 text-yellow-100 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="bg-yellow-900/40 border border-yellow-400/30 rounded-lg p-4">
              <div className="text-sm text-yellow-200">
                <strong>Estimated APY:</strong> {calcAPY.toFixed(2)}%
              </div>
            </div>
            <button 
              onClick={handleStake}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold py-3 px-6 rounded-md hover:bg-yellow-600 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Staking...' : '🌶️ Stake $SPICY Tokens'}
            </button>
          </div>
        </div>

        {/* Unstake */}
        <div className="glass-card-dark">
          <h2 className="text-2xl font-bold text-yellow-100 mb-4">Unstake $SPICY Tokens</h2>
          <div className="space-y-4">
            <div className="bg-red-900/40 border border-red-400/30 rounded-lg p-4">
              <div className="text-sm text-red-200">
                <strong>Note:</strong> Unstaking requires lock period to end
              </div>
            </div>
            <button 
              onClick={handleUnstake}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-gray-100 font-bold py-3 px-6 rounded-md hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Unstaking...' : '🔓 Unstake $SPICY Tokens'}
            </button>
          </div>
        </div>

        {/* Claim Rewards */}
        <div className="glass-card-dark">
          <h2 className="text-2xl font-bold text-yellow-100 mb-4">Claim $HEAT Rewards</h2>
          <div className="space-y-4">
            <div className="bg-green-900/40 border border-green-400/30 rounded-lg p-4">
              <div className="text-sm text-green-200">
                <strong>Available:</strong> {userStake ? userStake.rewards : 0} $HEAT
              </div>
            </div>
            <button 
              onClick={handleClaimRewards}
              disabled={loading || !userStake || userStake.rewards === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-gray-100 font-bold py-3 px-6 rounded-md hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Claiming...' : '⚡ Claim $HEAT Rewards'}
            </button>
          </div>
        </div>
      </div>

      {/* Governance Proposals */}
      <div className="glass-card-dark">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">Governance Proposals</h2>
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center text-gray-300 py-8">
              No proposals yet. Create the first one!
            </div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="p-4 border border-purple-400/20 rounded-lg bg-black/20">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-purple-100">{proposal.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    proposal.executed ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {proposal.executed ? 'Executed' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{proposal.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Votes: {proposal.votes_for} For / {proposal.votes_against} Against
                  </div>
                  {!proposal.executed && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        Vote Against
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
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

export default PortalPage; 
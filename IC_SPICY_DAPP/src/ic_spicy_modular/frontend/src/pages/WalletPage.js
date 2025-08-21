import React, { useEffect, useState } from 'react';
import { useWallet } from '../WalletContext';
import { idlFactory as game_idlFactory } from '../declarations/game';
import { idlFactory as wallet_idlFactory } from '../declarations/wallet';
import { validateForm, rateLimiter, auditLog, handleError, validateInput } from '../utils/security';
import { CANISTER_IDS } from '../config';

const WalletPage = () => {
  const { principal, plugConnected, connectPlug } = useWallet();
  const [spicyBalance, setSpicyBalance] = useState(0);
  const [heatBalance, setHeatBalance] = useState(0);
  const [gameActor, setGameActor] = useState(null);
  const [walletActor, setWalletActor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: '',
    tokenType: 'SPICY'
  });

  useEffect(() => {
    if (plugConnected && principal) {
      (async () => {
        try {
          const gameA = await window.ic.plug.createActor({ canisterId: CANISTER_IDS.game, interfaceFactory: game_idlFactory });
          const walletA = await window.ic.plug.createActor({ canisterId: CANISTER_IDS.wallet2, interfaceFactory: wallet_idlFactory });
          setGameActor(gameA);
          setWalletActor(walletA);
          
          // Fetch balances
          const spicy = await gameA.getSpicyBalance(principal);
          const heat = await gameA.getHeatBalance(principal);
          setSpicyBalance(Number(spicy));
          setHeatBalance(Number(heat));
          
          // Fetch transaction history
          const txHistory = await walletA.getTransactionHistory(principal);
          setTransactions(txHistory);
        } catch (error) {
          console.error('Error fetching wallet data:', error);
        }
      })();
    }
  }, [plugConnected, principal]);

  const refreshBalances = async () => {
    if (!gameActor || !principal) return;
    setLoading(true);
    try {
      const spicy = await gameActor.getSpicyBalance(principal);
      const heat = await gameActor.getHeatBalance(principal);
      setSpicyBalance(Number(spicy));
      setHeatBalance(Number(heat));
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
    setLoading(false);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!walletActor || !principal) return;

    // Rate limiting
    if (!rateLimiter.canPerformAction('transfer', principal, 5, 60000)) {
      alert('Please wait before making another transfer');
      return;
    }

    // Input validation
    const errors = validateForm.transfer(transferForm.recipient, transferForm.amount, transferForm.tokenType);
    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }

    const amount = parseInt(transferForm.amount);
    if (transferForm.tokenType === 'SPICY' && amount > spicyBalance) {
      alert('Insufficient $SPICY balance');
      return;
    }
    if (transferForm.tokenType === 'HEAT' && amount > heatBalance) {
      alert('Insufficient $HEAT balance');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      if (transferForm.tokenType === 'SPICY') {
        success = await walletActor.transferSpicy(principal, transferForm.recipient, amount);
      } else {
        success = await walletActor.transferHeat(principal, transferForm.recipient, amount);
      }

      if (success) {
        // Refresh balances and transactions
        await refreshBalances();
        const txHistory = await walletActor.getTransactionHistory(principal);
        setTransactions(txHistory);
        setTransferForm({ recipient: '', amount: '', tokenType: 'SPICY' });
        alert(`${transferForm.amount} $${transferForm.tokenType} transferred successfully!`);
        // Audit logging
        auditLog.log('transfer', principal, { ...transferForm, amount });
      } else {
        alert('Transfer failed');
      }
    } catch (error) {
      alert(handleError(error, 'transferring tokens'));
    }
    setLoading(false);
  };

  const formatTransaction = (tx) => {
    const date = new Date(Number(tx.timestamp) / 1000000);
    return {
      ...tx,
      formattedDate: date.toLocaleString(),
      formattedAmount: `${tx.amount} $${tx.tokenType}`,
      isIncoming: tx.to === principal,
      isOutgoing: tx.from === principal
    };
  };

  if (!plugConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your Plug wallet to view balances!</h2>
        <button
          onClick={connectPlug}
          className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition"
        >
          Connect Plug Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8 px-2 md:px-0 flex flex-col items-center justify-center overflow-x-hidden space-y-8">
      {/* Luxury Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-700 opacity-70" />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>

      {/* Header */}
      <div className="text-center glass-card-dark mb-8 px-6 py-8 md:px-12 md:py-10" style={{borderRadius: '2rem'}}>
        <div className="text-6xl mb-4">💎</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-100 mb-4 tracking-tight">Spicy Wallet</h1>
        <p className="text-xl text-gray-100">Manage your $SPICY and $HEAT tokens on the Internet Computer</p>
        <div className="text-sm text-gray-300 mt-2">
          Principal: {principal?.substring(0, 8)}...{principal?.substring(principal.length - 8)}
        </div>
      </div>

      {/* Token Balances */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Token Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card-dark border border-yellow-200/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🌶️</div>
            <div className="text-3xl font-bold text-yellow-200 mb-2">{spicyBalance.toLocaleString()}</div>
            <div className="text-lg text-gray-300">$SPICY</div>
            <div className="text-sm text-gray-400 mt-2">Spicy Token</div>
          </div>
          <div className="glass-card-dark border border-orange-200/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-orange-200 mb-2">{heatBalance.toLocaleString()}</div>
            <div className="text-lg text-gray-300">$HEAT</div>
            <div className="text-sm text-gray-400 mt-2">Heat Token</div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={refreshBalances}
            className="bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-emerald-600 transition"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Balances'}
          </button>
        </div>
      </div>

      {/* Transfer Tokens */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Transfer Tokens</h2>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Recipient Principal"
              value={transferForm.recipient}
              onChange={e => setTransferForm({...transferForm, recipient: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
              required
            />
            <select
              value={transferForm.tokenType}
              onChange={e => setTransferForm({...transferForm, tokenType: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white"
            >
              <option value="SPICY">$SPICY</option>
              <option value="HEAT">$HEAT</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={transferForm.amount}
              onChange={e => setTransferForm({...transferForm, amount: e.target.value})}
              className="w-full p-3 bg-black/30 border border-yellow-200/30 rounded-lg text-white placeholder-gray-400"
              min="1"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
              disabled={loading}
            >
              {loading ? 'Transferring...' : '💸 Transfer Tokens'}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History */}
      <div className="glass-card-dark w-full max-w-6xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-6">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <div className="text-4xl mb-2">📊</div>
            <p>No transactions yet. Start trading to see your history!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-yellow-200/20">
                  <th className="py-2 text-yellow-100">Date</th>
                  <th className="py-2 text-yellow-100">Type</th>
                  <th className="py-2 text-yellow-100">Amount</th>
                  <th className="py-2 text-yellow-100">From</th>
                  <th className="py-2 text-yellow-100">To</th>
                  <th className="py-2 text-yellow-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx, index) => {
                  const formattedTx = formatTransaction(tx);
                  return (
                    <tr key={index} className="border-b border-yellow-200/10">
                      <td className="py-2 text-gray-100 text-sm">{formattedTx.formattedDate}</td>
                      <td className="py-2">
                        <span className={`text-sm font-bold ${
                          formattedTx.isIncoming ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formattedTx.isIncoming ? '📥 Incoming' : '📤 Outgoing'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-100 font-bold">{formattedTx.formattedAmount}</td>
                      <td className="py-2 text-gray-100 text-sm">{formattedTx.from.substring(0, 8)}...</td>
                      <td className="py-2 text-gray-100 text-sm">{formattedTx.to.substring(0, 8)}...</td>
                      <td className="py-2">
                        <span className="text-green-400 text-sm">✓ Confirmed</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet Features */}
      <div className="glass-card-dark w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">💎 Wallet Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Token Management</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>View $SPICY and $HEAT balances</li>
              <li>Transfer tokens to other users</li>
              <li>Real-time balance updates</li>
              <li>Secure IC blockchain storage</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Transaction History</h3>
            <ul className="list-disc pl-6 text-gray-100 space-y-1">
              <li>Complete transaction log</li>
              <li>Incoming and outgoing transfers</li>
              <li>Timestamp and status tracking</li>
              <li>Principal address verification</li>
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

export default WalletPage; 
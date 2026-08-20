'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Wallet {
  id: number;
  address: string;
  balance_usdt: string;
  balance_eth: string;
  escrow_balance: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
}

export default function Wallet() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      fetchWalletData();
      fetchTransactions();
    }
  }, [user, authLoading]);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
      } else {
        console.error('Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(addFundsAmount),
          currency: 'USDT'
        })
      });

      if (response.ok) {
        setAddFundsAmount('');
        setShowAddFunds(false);
        fetchWalletData();
        fetchTransactions();
        alert('Funds added successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Failed to add funds');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          currency: 'USDT'
        })
      });

      if (response.ok) {
        setWithdrawAmount('');
        setShowWithdraw(false);
        fetchWalletData();
        fetchTransactions();
        alert('Withdrawal request submitted!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to withdraw funds');
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Failed to withdraw funds');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Balance</h3>
            <p className="text-3xl font-bold text-green-600">${wallet?.balance_usdt || '0.00'}</p>
            <p className="text-sm text-gray-500">USDT</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Escrow Balance</h3>
            <p className="text-3xl font-bold text-yellow-600">${wallet?.escrow_balance || '0.00'}</p>
            <p className="text-sm text-gray-500">USDT (Locked)</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ETH Balance</h3>
            <p className="text-3xl font-bold text-blue-600">{wallet?.balance_eth || '0.00000000'}</p>
            <p className="text-sm text-gray-500">ETH</p>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Address</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
            <code className="text-sm text-gray-700 break-all">{wallet?.address}</code>
            <button
              onClick={() => navigator.clipboard.writeText(wallet?.address || '')}
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowAddFunds(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
          >
            Add Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-medium"
          >
            Withdraw
          </button>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Funds</h3>
              <form onSubmit={handleAddFunds}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Add Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFunds(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
              <form onSubmit={handleWithdraw}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    max={wallet?.balance_usdt}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: ${wallet?.balance_usdt} USDT
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                  >
                    Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdraw(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          <div className="p-6">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.type}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type.includes('deposit') || transaction.type.includes('received') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type.includes('deposit') || transaction.type.includes('received') ? '+' : '-'}
                        ${transaction.amount} {transaction.currency}
                      </p>
                      <p className={`text-sm ${
                        transaction.status === 'completed' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
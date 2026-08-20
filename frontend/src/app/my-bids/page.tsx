'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Bid {
  id: number;
  project_id: number;
  amount: string;
  proposal: string;
  delivery_time: number;
  status: string;
  created_at: string;
  project: {
    id: number;
    title: string;
    description: string;
    category: string;
    budget: string;
    status: string;
  };
}

export default function MyBids() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      fetchMyBids();
    }
  }, [user, authLoading]);

  const fetchMyBids = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // For demo purposes, we'll fetch bids from the first project
      // In a real app, there would be a dedicated endpoint for user's bids
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/1/bids`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedBids = data.bids?.map((bid: any) => ({
          ...bid,
          project: {
            id: 1,
            title: 'DeFi Trading Dashboard',
            description: 'Build a comprehensive DeFi trading dashboard...',
            category: 'Web Development',
            budget: '5000.00',
            status: 'open'
          }
        })) || [];
        setBids(transformedBids);
      } else {
        console.error('Failed to fetch bids');
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const handleWithdrawBid = async (bidId: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/${bidId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBids(bids.filter(bid => bid.id !== bidId));
        alert('Bid withdrawn successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to withdraw bid');
      }
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      alert('Failed to withdraw bid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Browse Projects
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bids' },
                { key: 'pending', label: 'Pending' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'rejected', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bids List */}
        {filteredBids.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "You haven't submitted any bids yet." 
                : `No ${filter} bids found.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/projects"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Browse Projects to Bid
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBids.map((bid) => (
              <div key={bid.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        <Link 
                          href={`/projects/${bid.project.id}`}
                          className="hover:text-blue-600"
                        >
                          {bid.project.title}
                        </Link>
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{bid.project.category}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Project Budget: ${bid.project.budget}</span>
                      <span>Delivery: {bid.delivery_time} days</span>
                      <span>Submitted: {new Date(bid.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-green-600">${bid.amount}</div>
                    <div className="text-sm text-gray-500">Your bid</div>
                  </div>
                </div>

                {/* Proposal */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Your Proposal:</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md text-sm">
                    {bid.proposal}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Link
                      href={`/projects/${bid.project.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Project
                    </Link>
                    {bid.status === 'pending' && (
                      <>
                        <span className="text-gray-300">•</span>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Edit Bid
                        </button>
                        <span className="text-gray-300">•</span>
                        <button 
                          onClick={() => handleWithdrawBid(bid.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                    {bid.status === 'accepted' && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Link
                          href={`/projects/${bid.project.id}/workspace`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Go to Workspace
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bid.status === 'accepted' && (
                      <span className="text-green-600 font-medium">✓ Accepted</span>
                    )}
                    {bid.status === 'rejected' && (
                      <span className="text-red-600 font-medium">✗ Rejected</span>
                    )}
                    {bid.status === 'pending' && (
                      <span className="text-yellow-600 font-medium">⏳ Pending Review</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
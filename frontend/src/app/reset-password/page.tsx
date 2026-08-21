'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
    hash: '',
    password: '',
    password_confirmation: ''
  });
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Pre-fill form with URL parameters
  useEffect(() => {
    const email = searchParams.get('email');
    const hash = searchParams.get('hash');
    
    if (email || hash) {
      setFormData(prev => ({
        ...prev,
        email: email || '',
        hash: hash || ''
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          verification_hash: formData.hash,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        console.error('Reset password error:', data);
        if (data.errors) {
          const errorMessages = Object.entries(data.errors).map(([field, messages]) => 
            `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          ).join('\n');
          setError(`Validation failed:\n${errorMessages}`);
        } else {
          setError(data.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ALPHA
              </span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email, reset hash, and new password
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hash" className="block text-sm font-medium text-gray-700">
                Reset Hash
              </label>
              <div className="mt-1">
                <input
                  id="hash"
                  name="hash"
                  type="text"
                  required
                  value={formData.hash}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder="Enter 8-character reset hash"
                  maxLength={8}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Security Note:</h3>
          <p className="text-xs text-yellow-700">
            Reset hashes expire in 24 hours. If your hash has expired, 
            <Link href="/forgot-password" className="underline ml-1">
              generate a new one
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

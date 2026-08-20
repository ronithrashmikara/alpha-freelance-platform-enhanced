'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ALPHA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
              Projects
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/my-projects" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Projects
                </Link>
                <Link href="/my-bids" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Bids
                </Link>
                <Link href="/wallet" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Wallet
                </Link>
                <Link href="/reviews" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Reviews
                </Link>
                <Link href="/disputes" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Disputes
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <UserCircleIcon className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="text-gray-900 font-medium">{user.name}</span>
                      {user.wallet && (
                        <span className="text-blue-600 text-sm font-medium">
                          ${user.wallet.balance_usdt} USDT
                        </span>
                      )}
                    </Link>
                    <Button onClick={handleLogout} variant="outline">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button>Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/projects" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/my-projects" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Projects
                  </Link>
                  <Link 
                    href="/my-bids" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bids
                  </Link>
                  <Link 
                    href="/wallet" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wallet
                  </Link>
                  <Link 
                    href="/reviews" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Reviews
                  </Link>
                  <Link 
                    href="/disputes" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Disputes
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {!loading && (
                  <>
                    {user ? (
                      <div className="flex flex-col space-y-3">
                        <Link 
                          href="/profile" 
                          className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                          )}
                          <span className="text-gray-900 font-medium">{user.name}</span>
                        </Link>
                        {user.wallet && (
                          <span className="text-blue-600 text-sm font-medium">
                            Balance: ${user.wallet.balance_usdt} USDT
                          </span>
                        )}
                        <Button onClick={handleLogout} variant="outline" className="w-full">
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full">Get Started</Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
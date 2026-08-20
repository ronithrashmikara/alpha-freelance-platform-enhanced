'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'consumer' as 'consumer' | 'provider'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: About, 2: Registration Form

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role as 'consumer' | 'provider'
      })
      
      // Auto-login after successful registration
      login(response.user, response.token)
      router.push('/projects')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Side - About */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-8 lg:p-12 flex items-center">
            <div className="max-w-lg mx-auto text-white">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-3xl font-bold">ALPHA</span>
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Welcome to the Future of Work
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join the decentralized economy where AI meets blockchain to create 
                the most secure and efficient freelancing platform ever built.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered Matching</h3>
                    <p className="text-blue-100 text-sm">
                      Our advanced AI analyzes your skills and project requirements 
                      to find perfect matches instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Blockchain Security</h3>
                    <p className="text-blue-100 text-sm">
                      Smart contracts ensure secure payments and protect both 
                      clients and freelancers with transparent escrow.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Crypto Payments</h3>
                    <p className="text-blue-100 text-sm">
                      Get paid in USDT, ETH, or other cryptocurrencies with 
                      instant, low-fee transactions worldwide.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  <span className="font-semibold">Welcome Bonus</span>
                </div>
                <p className="text-sm text-blue-100">
                  Get $20 USDT credited to your wallet upon successful registration
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Role Selection */}
          <div className="p-8 lg:p-12 flex items-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Choose Your Path
                </h2>
                <p className="text-gray-600">
                  Select how you want to use ALPHA
                </p>
              </div>

              <div className="space-y-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    formData.role === 'consumer' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'consumer' })}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">I'm a Client</CardTitle>
                      <Badge variant={formData.role === 'consumer' ? 'default' : 'outline'}>
                        Consumer
                      </Badge>
                    </div>
                    <CardDescription>
                      I want to hire talented developers and designers for my projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Post projects and receive bids</li>
                      <li>• Access to elite Web3 talent</li>
                      <li>• AI-powered project breakdowns</li>
                      <li>• Secure escrow payments</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    formData.role === 'provider' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'provider' })}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">I'm a Freelancer</CardTitle>
                      <Badge variant={formData.role === 'provider' ? 'default' : 'outline'}>
                        Provider
                      </Badge>
                    </div>
                    <CardDescription>
                      I want to offer my skills and work on exciting projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Browse and bid on projects</li>
                      <li>• Showcase your portfolio</li>
                      <li>• Instant crypto payments</li>
                      <li>• Build your reputation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full mt-8"
                size="lg"
              >
                Continue Registration
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ALPHA
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join as a {formData.role === 'consumer' ? 'Client' : 'Freelancer'}
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sign Up</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep(1)}
              >
                Change Role
              </Button>
            </div>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Bonus */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Welcome Bonus</h4>
                <p className="text-sm text-green-700">
                  Get $20 USDT credited to your wallet upon registration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
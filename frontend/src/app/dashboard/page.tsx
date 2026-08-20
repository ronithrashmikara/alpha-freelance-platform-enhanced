'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { 
  CurrencyDollarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [projectsData, paymentsData, walletData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getPayments(),
        apiClient.getWallet().catch(() => null) // Wallet might not exist yet
      ])
      
      setProjects(projectsData.data || [])
      setPayments(paymentsData.data || [])
      setWallet(walletData)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (projectId: string) => {
    try {
      await apiClient.markProjectCompleted(projectId)
      setSuccessMessage('✅ Project marked as completed! Payment will be released to the provider.')
      setShowSuccessDialog(true)
      loadDashboardData()
    } catch (err: any) {
      alert('Failed to mark project as completed: ' + err.message)
    }
  }

  const handleReleasePayment = async (paymentId: string) => {
    try {
      await apiClient.releaseEscrow(paymentId)
      setSuccessMessage('💰 Payment released successfully! Funds have been transferred to the provider.')
      setShowSuccessDialog(true)
      loadDashboardData()
    } catch (err: any) {
      alert('Failed to release payment: ' + err.message)
    }
  }

  const handleCreateEscrow = async (projectId: string, amount: number) => {
    try {
      await apiClient.createEscrow(projectId, { amount })
      setSuccessMessage('🔒 Escrow created successfully! Funds are now secured for this project.')
      setShowSuccessDialog(true)
      loadDashboardData()
    } catch (err: any) {
      alert('Failed to create escrow: ' + err.message)
    }
  }

  const getProjectStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default' as const, label: 'Open' },
      in_progress: { variant: 'secondary' as const, label: 'In Progress' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      held: { variant: 'default' as const, label: 'In Escrow' },
      released: { variant: 'default' as const, label: 'Released' },
      refunded: { variant: 'destructive' as const, label: 'Refunded' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your projects and payments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {wallet ? formatCurrency(parseFloat(wallet.balance || 0)) : '$0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Manage your active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          <Link href={`/projects/${project.id}`} className="hover:text-blue-600">
                            {project.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: {formatCurrency(parseFloat(project.budget))}
                        </p>
                      </div>
                      <div className="text-right">
                        {getProjectStatusBadge(project.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(project.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {project.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkCompleted(project.id)}
                        >
                          Mark Completed
                        </Button>
                      )}
                      {project.status === 'open' && !project.payments?.length && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCreateEscrow(project.id, parseFloat(project.budget))}
                        >
                          Create Escrow
                        </Button>
                      )}
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects yet</p>
                    <Link href="/projects">
                      <Button className="mt-2">Browse Projects</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Track your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Payment #{payment.id}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Amount: {formatCurrency(parseFloat(payment.amount))}
                        </p>
                        {payment.project && (
                          <p className="text-xs text-gray-500">
                            Project: {payment.project.title}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {getPaymentStatusBadge(payment.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {payment.status === 'held' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleReleasePayment(payment.id)}
                        >
                          Release Payment
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                
                {payments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payments yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/projects">
                <Button variant="outline" className="w-full">
                  Browse Projects
                </Button>
              </Link>
              <Link href="/reviews">
                <Button variant="outline" className="w-full">
                  Leave Review
                </Button>
              </Link>
              <Link href="/disputes">
                <Button variant="outline" className="w-full">
                  Create Dispute
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                View Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <Button 
                onClick={() => setShowSuccessDialog(false)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { 
  UsersIcon, 
  BriefcaseIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid'

interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalDisputes: number
  totalRevenue: number
  activeProjects: number
  completedProjects: number
}

interface DisputeWithDetails {
  id: number
  project: {
    id: number
    title: string
    budget: number
  }
  user: {
    id: number
    name: string
    email: string
  }
  type: string
  description: string
  status: string
  created_at: string
  resolution?: string
  admin_notes?: string
}

interface ProjectWithDetails {
  id: number
  title: string
  budget: number
  status: string
  user: {
    id: number
    name: string
    email: string
  }
  assigned_to?: {
    id: number
    name: string
    email: string
  }
  bids_count: number
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalDisputes: 0,
    totalRevenue: 0,
    activeProjects: 0,
    completedProjects: 0
  })
  const [disputes, setDisputes] = useState<DisputeWithDetails[]>([])
  const [projects, setProjects] = useState<ProjectWithDetails[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [serviceProviders, setServiceProviders] = useState<any[]>([])
  const [consumers, setConsumers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithDetails | null>(null)
  const [resolution, setResolution] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [disputeStatus, setDisputeStatus] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')

  const downloadProjectsPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Projects Report', 20, 20)
      
      // Add date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      
      // Prepare table data
      const tableData = projects.map(project => [
        project.id.toString(),
        project.title,
        project.user?.name || 'N/A',
        project.assigned_to?.name || 'Unassigned',
        project.status.replace('_', ' ').toUpperCase(),
        `$${project.budget.toLocaleString()}`,
        project.bids_count?.toString() || '0',
        new Date(project.created_at).toLocaleDateString()
      ])
      
      // Add table using autoTable
      autoTable(doc, {
        head: [['ID', 'Title', 'Client', 'Assigned To', 'Status', 'Budget', 'Bids', 'Created']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
      // Save the PDF
      doc.save(`projects-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Failed to load PDF library:', error)
      // Fallback: create a simple text-based download
      const csvContent = [
        'ID,Title,Client,Assigned To,Status,Budget,Bids,Created',
        ...projects.map(project => [
          project.id,
          `"${project.title}"`,
          `"${project.user?.name || 'N/A'}"`,
          `"${project.assigned_to?.name || 'Unassigned'}"`,
          project.status,
          project.budget,
          project.bids_count || 0,
          new Date(project.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `projects-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Load disputes
      const disputesResponse = await apiClient.getDisputes()
      setDisputes(disputesResponse.disputes || [])
      
      // Load projects
      const projectsResponse = await apiClient.getProjects()
      setProjects(projectsResponse.data || [])
      
      // Load payments
      try {
        const paymentsResponse = await apiClient.getPayments()
        setPayments(paymentsResponse.data || [])
      } catch (paymentErr) {
        console.error('Failed to load payments:', paymentErr)
        setPayments([])
      }
      
      // Load users data
      try {
        const serviceProvidersResponse = await apiClient.get('/admin/service-providers')
        setServiceProviders(serviceProvidersResponse.data || [])
        
        const consumersResponse = await apiClient.get('/admin/consumers')
        setConsumers(consumersResponse.data || [])
        
        // Combine all users
        const allUsers = [...(serviceProvidersResponse.data || []), ...(consumersResponse.data || [])]
        setUsers(allUsers)
      } catch (userErr) {
        console.error('Failed to load users:', userErr)
        setServiceProviders([])
        setConsumers([])
        setUsers([])
      }
      
      // Calculate stats
      const totalUsers = users.length || 156 // fallback to mock data
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 125000
      setStats({
        totalUsers,
        totalProjects: projectsResponse.data?.length || 0,
        totalDisputes: disputesResponse.disputes?.length || 0,
        totalRevenue,
        activeProjects: projectsResponse.data?.filter((p: any) => p.status === 'in_progress').length || 0,
        completedProjects: projectsResponse.data?.filter((p: any) => p.status === 'completed').length || 0
      })
      
    } catch (err: any) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveDispute = async (disputeId: number) => {
    try {
      await apiClient.updateDispute(disputeId.toString(), {
        status: disputeStatus as any,
        resolution,
        admin_notes: adminNotes
      })
      
      setSuccessMessage('Dispute resolved successfully!')
      setShowSuccessDialog(true)
      setTimeout(() => setShowSuccessDialog(false), 3000)
      
      // Reset form
      setSelectedDispute(null)
      setResolution('')
      setAdminNotes('')
      setDisputeStatus('')
      
      // Reload data
      loadAdminData()
    } catch (err: any) {
      console.error('Failed to resolve dispute:', err)
    }
  }

  const handleToggleUserStatus = async (userId: number, newStatus: string, reason?: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/toggle-status`, {
        status: newStatus,
        reason: reason || 'Admin action'
      })
      
      setSuccessMessage(`User ${newStatus} successfully!`)
      setShowSuccessDialog(true)
      setTimeout(() => setShowSuccessDialog(false), 3000)
      
      // Reload data
      loadAdminData()
    } catch (err: any) {
      console.error('Failed to toggle user status:', err)
    }
  }

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/details`)
      setSelectedUser(response.user)
    } catch (err: any) {
      console.error('Failed to load user details:', err)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'default'
      case 'resolved': return 'secondary'
      case 'closed': return 'outline'
      default: return 'default'
    }
  }

  const getProjectStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default'
      case 'in_progress': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform operations and resolve disputes</p>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Success</h3>
            </div>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              OK
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.filter(d => d.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDisputes} total disputes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="disputes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
              <CardDescription>Review and resolve platform disputes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No disputes found
                  </div>
                ) : (
                  disputes.map((dispute) => (
                    <div key={dispute.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Dispute #{dispute.id}</h3>
                          <p className="text-sm text-gray-600">
                            Project: {dispute.project?.title || 'Unknown Project'}
                          </p>
                          <p className="text-sm text-gray-600">
                            User: {dispute.user?.name || 'Unknown User'} ({dispute.user?.email})
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadgeVariant(dispute.status)}>
                            {dispute.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(dispute.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Type: {dispute.type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-700">{dispute.description}</p>
                      </div>

                      {dispute.status === 'open' && (
                        <div className="border-t pt-3">
                          <Button
                            onClick={() => {
                              setSelectedDispute(dispute)
                              setDisputeStatus('in_progress')
                            }}
                            size="sm"
                          >
                            Resolve Dispute
                          </Button>
                        </div>
                      )}

                      {dispute.resolution && (
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm font-medium mb-1">Resolution:</p>
                          <p className="text-sm text-gray-700">{dispute.resolution}</p>
                          {dispute.admin_notes && (
                            <>
                              <p className="text-sm font-medium mb-1 mt-2">Admin Notes:</p>
                              <p className="text-sm text-gray-700">{dispute.admin_notes}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Monitor all platform projects and assignments</CardDescription>
              </div>
              <Button onClick={downloadProjectsPDF} variant="outline">
                Download PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No projects found
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600">
                            Client: {project.user?.name} ({project.user?.email})
                          </p>
                          {project.assigned_to && (
                            <p className="text-sm text-gray-600">
                              Assigned to: {project.assigned_to.name} ({project.assigned_to.email})
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={getProjectStatusBadgeVariant(project.status)}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatCurrency(project.budget)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{project.bids_count || 0} bids</span>
                        <span>Created: {formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage service providers and consumers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="provider">Service Providers</SelectItem>
                      <SelectItem value="consumer">Consumers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Service Providers</h4>
                    <p className="text-2xl font-bold text-blue-600">{serviceProviders.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Consumers</h4>
                    <p className="text-2xl font-bold text-green-600">{consumers.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Total Users</h4>
                    <p className="text-2xl font-bold text-purple-600">{users.length}</p>
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found
                    </div>
                  ) : (
                    users
                      .filter(user => {
                        if (userFilter === 'all') return true
                        if (userFilter === 'provider') return user.role === 'provider'
                        if (userFilter === 'consumer') return user.role === 'consumer'
                        if (userFilter === 'active') return user.status === 'active'
                        if (userFilter === 'suspended') return user.status === 'suspended'
                        return true
                      })
                      .filter(user => 
                        userSearch === '' || 
                        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((user) => (
                        <div key={user.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={user.role === 'provider' ? 'default' : 'secondary'}>
                                    {user.role === 'provider' ? 'Service Provider' : 'Consumer'}
                                  </Badge>
                                  <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
                                    {user.status}
                                  </Badge>
                                  {user.is_verified && (
                                    <Badge variant="secondary">Verified</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Rating: {user.rating || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Balance: ${user.wallet?.balance_usdt || '0.00'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Joined: {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">{user.bio}</p>
                            {user.skills && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.skills.slice(0, 3).map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {user.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center border-t pt-3">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => loadUserDetails(user.id)}
                                size="sm"
                                variant="outline"
                              >
                                View Details
                              </Button>
                              {user.status === 'active' ? (
                                <Button
                                  onClick={() => handleToggleUserStatus(user.id, 'suspended')}
                                  size="sm"
                                  variant="destructive"
                                >
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleToggleUserStatus(user.id, 'active')}
                                  size="sm"
                                  variant="default"
                                >
                                  Activate
                                </Button>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.role === 'provider' && user.statistics && (
                                <span>
                                  {user.statistics.total_bids} bids, 
                                  {user.statistics.won_projects} projects won
                                </span>
                              )}
                              {user.role === 'consumer' && user.statistics && (
                                <span>
                                  {user.statistics.total_projects_created} projects created
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Track payments and platform fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Total Processed</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Platform Fees</h4>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue * 0.05)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Pending Payments</h4>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(15000)}</p>
                  </div>
                </div>
                
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payment transactions found
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Transactions</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Project</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.slice(0, 10).map((payment) => (
                            <tr key={payment.id}>
                              <td className="border border-gray-300 px-4 py-2">#{payment.id}</td>
                              <td className="border border-gray-300 px-4 py-2">{payment.project?.title || 'N/A'}</td>
                              <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.amount)}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <Badge variant={payment.status === 'completed' ? 'secondary' : 'default'}>
                                  {payment.status}
                                </Badge>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{formatDate(payment.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Resolve Dispute #{selectedDispute.id}</h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Dispute Details</h4>
              <p className="text-sm text-gray-600 mb-1">
                Project: {selectedDispute.project?.title}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                User: {selectedDispute.user?.name} ({selectedDispute.user?.email})
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Type: {selectedDispute.type.replace('_', ' ')}
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {selectedDispute.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={disputeStatus} onValueChange={setDisputeStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the resolution..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDispute(null)
                  setResolution('')
                  setAdminNotes('')
                  setDisputeStatus('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleResolveDispute(selectedDispute.id)}
                disabled={!disputeStatus || !resolution}
              >
                Resolve Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">User Details</h3>
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">{selectedUser.name}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={selectedUser.role === 'provider' ? 'default' : 'secondary'}>
                        {selectedUser.role === 'provider' ? 'Service Provider' : 'Consumer'}
                      </Badge>
                      <Badge variant={selectedUser.status === 'active' ? 'outline' : 'destructive'}>
                        {selectedUser.status}
                      </Badge>
                      {selectedUser.is_verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Bio</h5>
                  <p className="text-sm text-gray-700">{selectedUser.bio || 'No bio provided'}</p>
                </div>
                
                {selectedUser.skills && (
                  <div>
                    <h5 className="font-medium mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium mb-2">Account Info</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Rating:</span> {selectedUser.rating || 'N/A'}</p>
                    <p><span className="font-medium">Total Projects:</span> {selectedUser.total_projects || 0}</p>
                    <p><span className="font-medium">Joined:</span> {formatDate(selectedUser.created_at)}</p>
                    <p><span className="font-medium">Last Activity:</span> {selectedUser.statistics?.last_activity ? formatDate(selectedUser.statistics.last_activity) : 'N/A'}</p>
                  </div>
                </div>
                
                {selectedUser.wallet && (
                  <div>
                    <h5 className="font-medium mb-2">Wallet</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">USDT Balance:</span> ${selectedUser.wallet.balance_usdt}</p>
                      <p><span className="font-medium">ETH Balance:</span> {selectedUser.wallet.balance_eth} ETH</p>
                      <p><span className="font-medium">Escrow Balance:</span> ${selectedUser.wallet.escrow_balance}</p>
                      <p><span className="font-medium">Address:</span> <code className="text-xs">{selectedUser.wallet.address}</code></p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Activity & Statistics */}
              <div className="space-y-4">
                {selectedUser.statistics && (
                  <div>
                    <h5 className="font-medium mb-2">Statistics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.role === 'provider' && (
                        <>
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm text-blue-600">Total Bids</p>
                            <p className="text-lg font-semibold text-blue-800">{selectedUser.statistics.total_bids || 0}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm text-green-600">Projects Won</p>
                            <p className="text-lg font-semibold text-green-800">{selectedUser.statistics.won_projects || 0}</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <p className="text-sm text-purple-600">Completion Rate</p>
                            <p className="text-lg font-semibold text-purple-800">{selectedUser.statistics.completion_rate || 0}%</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded">
                            <p className="text-sm text-yellow-600">Total Earned</p>
                            <p className="text-lg font-semibold text-yellow-800">${selectedUser.statistics.total_earned || 0}</p>
                          </div>
                        </>
                      )}
                      {selectedUser.role === 'consumer' && (
                        <>
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm text-blue-600">Projects Created</p>
                            <p className="text-lg font-semibold text-blue-800">{selectedUser.statistics.total_projects_created || 0}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm text-green-600">Total Spent</p>
                            <p className="text-lg font-semibold text-green-800">${selectedUser.statistics.total_spent || 0}</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <p className="text-sm text-purple-600">Avg Rating Given</p>
                            <p className="text-lg font-semibold text-purple-800">{selectedUser.statistics.average_rating_given || 'N/A'}</p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded">
                            <p className="text-sm text-orange-600">Disputes Raised</p>
                            <p className="text-lg font-semibold text-orange-800">{selectedUser.statistics.total_disputes_raised || 0}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Recent Projects */}
                {selectedUser.projects && selectedUser.projects.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Recent Projects</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedUser.projects.map((project: any) => (
                        <div key={project.id} className="border rounded p-2">
                          <p className="font-medium text-sm">{project.title}</p>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{formatCurrency(project.budget)}</span>
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Reviews */}
                {selectedUser.received_reviews && selectedUser.received_reviews.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Recent Reviews</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedUser.received_reviews.map((review: any) => (
                        <div key={review.id} className="border rounded p-2">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium">Rating: {review.rating}/5</span>
                            <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                          </div>
                          <p className="text-xs text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              {selectedUser.status === 'active' ? (
                <Button
                  onClick={() => {
                    handleToggleUserStatus(selectedUser.id, 'suspended')
                    setSelectedUser(null)
                  }}
                  variant="destructive"
                >
                  Suspend User
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleToggleUserStatus(selectedUser.id, 'active')
                    setSelectedUser(null)
                  }}
                  variant="default"
                >
                  Activate User
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
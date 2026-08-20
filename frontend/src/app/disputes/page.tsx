'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

const disputeTypes = [
  { value: 'payment', label: 'Payment Issue' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'deadline', label: 'Deadline Issue' },
  { value: 'communication', label: 'Communication Issue' },
  { value: 'other', label: 'Other' }
]

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [newDispute, setNewDispute] = useState({
    project_id: '',
    type: 'payment' as 'payment' | 'quality' | 'deadline' | 'communication' | 'other',
    description: '',
    evidence: [] as string[]
  })

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getDisputes()
      setDisputes(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createDispute({
        project_id: parseInt(newDispute.project_id),
        type: newDispute.type,
        description: newDispute.description,
        evidence: newDispute.evidence
      })
      
      setShowSuccessDialog(true)
      setShowCreateForm(false)
      setNewDispute({
        project_id: '',
        type: 'payment',
        description: '',
        evidence: []
      })
      loadDisputes()
    } catch (err: any) {
      alert('Failed to create dispute: ' + err.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'destructive' as const, label: 'Open' },
      in_progress: { variant: 'secondary' as const, label: 'In Progress' },
      resolved: { variant: 'default' as const, label: 'Resolved' },
      closed: { variant: 'outline' as const, label: 'Closed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'closed':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading disputes...</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
              <p className="text-gray-600 mt-2">Manage project disputes and resolutions</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Dispute
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Dispute Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Dispute</CardTitle>
              <CardDescription>Report an issue with a project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDispute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project ID</label>
                  <Input
                    type="number"
                    placeholder="Enter project ID"
                    value={newDispute.project_id}
                    onChange={(e) => setNewDispute({...newDispute, project_id: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Dispute Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newDispute.type}
                    onChange={(e) => setNewDispute({...newDispute, type: e.target.value as any})}
                  >
                    {disputeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    value={newDispute.description}
                    onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Submit Dispute</Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Disputes List */}
        <div className="space-y-6">
          {disputes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                <p className="text-gray-600 mb-4">All projects are running smoothly!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Dispute
                </Button>
              </CardContent>
            </Card>
          ) : (
            disputes.map((dispute) => (
              <Card key={dispute.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(dispute.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dispute #{dispute.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Type: {disputeTypes.find(t => t.value === dispute.type)?.label || dispute.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(dispute.status)}
                      <p className="text-sm text-gray-500 mt-1">
                        Created {formatDate(dispute.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">{dispute.description}</p>
                  
                  {dispute.project && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Project: <Link href={`/projects/${dispute.project.id}`} className="text-blue-600 hover:underline">
                          {dispute.project.title}
                        </Link>
                      </p>
                    </div>
                  )}

                  {dispute.resolution && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">Resolution</h4>
                      <p className="text-sm text-green-800">{dispute.resolution}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>{dispute.messages?.length || 0} messages</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {dispute.status === 'open' && (
                        <Button size="sm">
                          Add Message
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispute Created</h3>
              <p className="text-gray-600 mb-6">
                Your dispute has been submitted successfully. Our team will review it and get back to you within 24 hours.
              </p>
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
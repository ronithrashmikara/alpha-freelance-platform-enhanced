'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { StarIcon, UserIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newReview, setNewReview] = useState({
    project_id: '',
    reviewee_id: '',
    rating: 5,
    comment: '',
    type: 'consumer_to_provider' as 'consumer_to_provider' | 'provider_to_consumer'
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReviews()
      setReviews(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createReview({
        project_id: parseInt(newReview.project_id),
        reviewee_id: parseInt(newReview.reviewee_id),
        rating: newReview.rating,
        comment: newReview.comment,
        type: newReview.type
      })
      
      alert('✅ Review submitted successfully!')
      setShowCreateForm(false)
      setNewReview({
        project_id: '',
        reviewee_id: '',
        rating: 5,
        comment: '',
        type: 'consumer_to_provider'
      })
      loadReviews()
    } catch (err: any) {
      alert('Failed to create review: ' + err.message)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
              <p className="text-gray-600 mt-2">View and manage project reviews</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              Leave a Review
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Review Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>Share your experience with a project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project ID</label>
                    <Input
                      type="number"
                      placeholder="Enter project ID"
                      value={newReview.project_id}
                      onChange={(e) => setNewReview({...newReview, project_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reviewee ID</label>
                    <Input
                      type="number"
                      placeholder="Enter user ID to review"
                      value={newReview.reviewee_id}
                      onChange={(e) => setNewReview({...newReview, reviewee_id: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Review Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newReview.type}
                    onChange={(e) => setNewReview({...newReview, type: e.target.value as any})}
                  >
                    <option value="consumer_to_provider">Consumer to Provider</option>
                    <option value="provider_to_consumer">Provider to Consumer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: i + 1})}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-6 w-6 ${i < newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600">({newReview.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Comment</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    placeholder="Share your experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Submit Review</Button>
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

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">Be the first to leave a review!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Leave a Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={review.reviewer?.avatar || '/placeholder-avatar.png'}
                        alt={review.reviewer?.name || 'Reviewer'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.reviewer?.name || 'Anonymous'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {review.type === 'consumer_to_provider' ? 'Client Review' : 'Provider Review'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  {review.project && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Project: <Link href={`/projects/${review.project.id}`} className="text-blue-600 hover:underline">
                          {review.project.title}
                        </Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
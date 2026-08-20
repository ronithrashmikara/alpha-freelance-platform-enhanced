'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, truncateText } from '@/lib/utils'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { ClockIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

const categories = ['All', 'Web Development', 'Design', 'Data Science', 'Blockchain', 'Mobile Development']

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getProjects({
          search: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort_by: sortBy === 'budget' ? 'budget' : 'created_at',
          sort_order: sortBy === 'budget' ? 'desc' : 'desc'
        })
        setProjects(response.data || [])
      } catch (error: any) {
        setError(error.message || 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [searchTerm, selectedCategory, sortBy])

  // Since we're filtering on the server side, we can use projects directly
  const displayProjects = projects

  const getLowestBid = (project: any) => {
    if (!project.bids || project.bids.length === 0) return null
    return Math.min(...project.bids.map((bid: any) => parseFloat(bid.amount)))
  }

  const getBidCount = (project: any) => {
    return project.bids ? project.bids.length : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse Projects
          </h1>
          <p className="text-xl text-gray-600">
            Discover exciting opportunities and start building the future
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          {loading ? (
            <p className="text-gray-600">Loading projects...</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <p className="text-gray-600">
              Showing {displayProjects.length} projects
            </p>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {!loading && !error && displayProjects.map((project) => {
            const lowestBid = getLowestBid(project)
            const bidCount = getBidCount(project)

            return (
              <Card key={project.id} className="card-hover">
                <CardHeader>
                  {project.images && project.images.length > 0 && (
                    <div className="mb-4 -mx-6 -mt-6">
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {project.title}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(parseFloat(project.budget))}
                      </div>
                      <div className="text-sm text-gray-500">Budget</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {project.description}
                  </CardDescription>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {project.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(project.created_at)}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {bidCount} bids
                    </div>
                  </div>

                  {lowestBid && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">Lowest Bid:</span>
                        <span className="font-semibold text-blue-700">
                          {formatCurrency(lowestBid)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button className="w-full">
                      View Details & Bid
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {!loading && !error && displayProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all categories
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
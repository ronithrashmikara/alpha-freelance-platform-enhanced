export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'consumer' | 'provider' | 'admin'
  rating?: number
  totalProjects?: number
  walletBalance: number
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  budget: number
  category: string
  skills: string[]
  status: 'open' | 'in_progress' | 'completed' | 'disputed'
  consumerId: string
  providerId?: string
  createdAt: string
  updatedAt: string
  bids: Bid[]
  aiBreakdown?: AIBreakdown
  images?: string[]
}

export interface Bid {
  id: string
  projectId: string
  providerId: string
  amount: number
  proposal: string
  deliveryTime: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  provider: User
}

export interface AIBreakdown {
  id: string
  projectId: string
  steps: AIStep[]
  estimatedTime: number
  complexity: 'low' | 'medium' | 'high'
  recommendations: string[]
  createdAt: string
}

export interface AIStep {
  id: string
  title: string
  description: string
  estimatedHours: number
  order: number
}

export interface Payment {
  id: string
  projectId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'disputed'
  type: 'escrow' | 'release' | 'refund'
  transactionHash?: string
  createdAt: string
}

export interface Dispute {
  id: string
  projectId: string
  raisedBy: string
  reason: string
  status: 'open' | 'in_review' | 'resolved'
  messages: DisputeMessage[]
  resolution?: string
  createdAt: string
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderId: string
  message: string
  isAdmin: boolean
  createdAt: string
}

export interface Review {
  id: string
  projectId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: string
  reviewer: User
}
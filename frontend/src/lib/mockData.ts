import { User, Project, Bid, Review, AIBreakdown } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'consumer',
    rating: 4.8,
    totalProjects: 12,
    walletBalance: 1250.00,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'provider',
    rating: 4.9,
    totalProjects: 28,
    walletBalance: 3420.50,
    createdAt: '2023-11-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'provider',
    rating: 4.7,
    totalProjects: 15,
    walletBalance: 2100.75,
    createdAt: '2024-02-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'provider',
    rating: 4.6,
    totalProjects: 22,
    walletBalance: 1890.25,
    createdAt: '2023-12-05T16:45:00Z'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@alpha.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    walletBalance: 0,
    createdAt: '2023-01-01T00:00:00Z'
  }
]

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    description: 'Need a modern e-commerce website built with React and Node.js. Should include user authentication, product catalog, shopping cart, and payment integration.',
    budget: 2500,
    category: 'Web Development',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
    status: 'open',
    consumerId: '1',
    createdAt: '2024-08-10T10:00:00Z',
    updatedAt: '2024-08-10T10:00:00Z',
    bids: [],
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
    ]
  },
  {
    id: '2',
    title: 'Mobile App UI/UX Design',
    description: 'Looking for a talented designer to create a modern, user-friendly interface for a fitness tracking mobile app. Need wireframes, mockups, and a complete design system.',
    budget: 1200,
    category: 'Design',
    skills: ['Figma', 'UI/UX Design', 'Mobile Design', 'Prototyping'],
    status: 'in_progress',
    consumerId: '1',
    providerId: '3',
    createdAt: '2024-08-05T14:30:00Z',
    updatedAt: '2024-08-12T09:15:00Z',
    bids: [],
    images: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'
    ]
  },
  {
    id: '3',
    title: 'Data Analysis & Visualization Dashboard',
    description: 'Create an interactive dashboard for sales data analysis using Python and Tableau. Need to process large datasets and create meaningful visualizations.',
    budget: 1800,
    category: 'Data Science',
    skills: ['Python', 'Tableau', 'Pandas', 'SQL'],
    status: 'open',
    consumerId: '1',
    createdAt: '2024-08-12T16:45:00Z',
    updatedAt: '2024-08-12T16:45:00Z',
    bids: [],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    ]
  },
  {
    id: '4',
    title: 'Smart Contract Development',
    description: 'Develop and deploy smart contracts for a DeFi lending platform on Ethereum. Includes token contracts, lending pools, and governance mechanisms.',
    budget: 5000,
    category: 'Blockchain',
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts'],
    status: 'completed',
    consumerId: '1',
    providerId: '2',
    createdAt: '2024-07-20T11:20:00Z',
    updatedAt: '2024-08-01T15:30:00Z',
    bids: [],
    images: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop'
    ]
  }
]

export const mockBids: Bid[] = [
  {
    id: '1',
    projectId: '1',
    providerId: '2',
    amount: 2200,
    proposal: 'I have 5+ years of experience in full-stack development with React and Node.js. I can deliver this project within 3 weeks with all the requested features.',
    deliveryTime: 21,
    status: 'pending',
    createdAt: '2024-08-11T09:30:00Z',
    provider: mockUsers[1]
  },
  {
    id: '2',
    projectId: '1',
    providerId: '3',
    amount: 2400,
    proposal: 'Experienced e-commerce developer with expertise in modern web technologies. I will ensure responsive design and optimal performance.',
    deliveryTime: 28,
    status: 'pending',
    createdAt: '2024-08-11T14:15:00Z',
    provider: mockUsers[2]
  },
  {
    id: '3',
    projectId: '3',
    providerId: '4',
    amount: 1600,
    proposal: 'Data scientist with 4 years of experience in Python and Tableau. I can create comprehensive dashboards with real-time data processing.',
    deliveryTime: 14,
    status: 'pending',
    createdAt: '2024-08-13T10:45:00Z',
    provider: mockUsers[3]
  }
]

export const mockReviews: Review[] = [
  {
    id: '1',
    projectId: '4',
    reviewerId: '1',
    revieweeId: '2',
    rating: 5,
    comment: 'Excellent work! Marcus delivered the smart contracts on time and they work perfectly. Great communication throughout the project.',
    createdAt: '2024-08-02T10:00:00Z',
    reviewer: mockUsers[0]
  },
  {
    id: '2',
    projectId: '4',
    reviewerId: '2',
    revieweeId: '1',
    rating: 5,
    comment: 'Sarah was very clear about requirements and provided quick feedback. Great client to work with!',
    createdAt: '2024-08-02T10:30:00Z',
    reviewer: mockUsers[1]
  }
]

export const mockAIBreakdown: AIBreakdown = {
  id: '1',
  projectId: '1',
  steps: [
    {
      id: '1',
      title: 'Project Setup & Architecture',
      description: 'Set up the development environment, configure build tools, and establish the project architecture with React frontend and Node.js backend.',
      estimatedHours: 8,
      order: 1
    },
    {
      id: '2',
      title: 'User Authentication System',
      description: 'Implement user registration, login, password reset, and JWT-based authentication with proper security measures.',
      estimatedHours: 12,
      order: 2
    },
    {
      id: '3',
      title: 'Product Catalog & Management',
      description: 'Create product listing, search, filtering, and admin panel for product management with image upload capabilities.',
      estimatedHours: 16,
      order: 3
    },
    {
      id: '4',
      title: 'Shopping Cart & Checkout',
      description: 'Develop shopping cart functionality, checkout process, and order management system.',
      estimatedHours: 14,
      order: 4
    },
    {
      id: '5',
      title: 'Payment Integration',
      description: 'Integrate Stripe payment gateway for secure payment processing and order confirmation.',
      estimatedHours: 10,
      order: 5
    },
    {
      id: '6',
      title: 'Testing & Deployment',
      description: 'Comprehensive testing, bug fixes, and deployment to production environment.',
      estimatedHours: 8,
      order: 6
    }
  ],
  estimatedTime: 68,
  complexity: 'medium',
  recommendations: [
    'Use TypeScript for better code maintainability',
    'Implement proper error handling and logging',
    'Add comprehensive unit and integration tests',
    'Consider using a state management library like Redux',
    'Implement proper SEO optimization'
  ],
  createdAt: '2024-08-10T10:30:00Z'
}

// Update projects with bids
mockProjects[0].bids = [mockBids[0], mockBids[1]]
mockProjects[2].bids = [mockBids[2]]
mockProjects[0].aiBreakdown = mockAIBreakdown
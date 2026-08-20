'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Intelligence',
    description: 'Advanced machine learning algorithms match projects with the perfect talent, analyze requirements, and provide intelligent insights.',
    color: 'text-purple-600'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Blockchain Security',
    description: 'Smart contracts ensure transparent, secure transactions with automated escrow and dispute resolution mechanisms.',
    color: 'text-green-600'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Crypto Payments',
    description: 'Instant, low-fee payments in USDT, ETH, and other cryptocurrencies. No more waiting for traditional bank transfers.',
    color: 'text-blue-600'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Talent Pool',
    description: 'Access elite developers, designers, and specialists from around the world, all verified and rated by our community.',
    color: 'text-indigo-600'
  }
]

const stats = [
  { number: '10,000+', label: 'Active Users', description: 'Developers and clients worldwide' },
  { number: '$50M+', label: 'Total Volume', description: 'Processed through our platform' },
  { number: '500+', label: 'Projects', description: 'Successfully completed' },
  { number: '99%', label: 'Success Rate', description: 'Client satisfaction guaranteed' }
]

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    bio: 'Former blockchain engineer at Ethereum Foundation with 8+ years in Web3'
  },
  {
    name: 'Sarah Kim',
    role: 'CTO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    bio: 'AI researcher and former Google engineer specializing in machine learning'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    bio: 'Product leader with experience at Airbnb and Stripe, expert in marketplace dynamics'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Design',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    bio: 'Design systems expert and former Figma designer focused on user experience'
  }
]

export default function AboutPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              About ALPHA
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Revolutionizing the
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Future of Work
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              ALPHA combines the power of artificial intelligence with blockchain technology 
              to create the most secure, efficient, and fair freelancing platform ever built.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe the future of work is decentralized, transparent, and powered by 
                cutting-edge technology. ALPHA is building the infrastructure for a new economy 
                where talent and opportunity meet without barriers.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                By leveraging AI for intelligent matching and blockchain for secure transactions, 
                we're creating a platform that benefits everyone - from individual freelancers 
                to enterprise clients.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-gray-700">Innovation First</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-gray-700">Security Focused</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <RocketLaunchIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Building Tomorrow</h3>
                  <p className="text-blue-100">
                    We're not just creating another freelancing platform - we're building 
                    the foundation for the decentralized economy of the future.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ALPHA isn't just another freelancing platform. We're pioneering the next generation 
              of work with revolutionary technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Numbers that speak to our growing community and success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-600 text-sm">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The visionaries building the future of decentralized work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join the Revolution?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of the future of work. Whether you're looking to hire or get hired, 
              ALPHA is your gateway to the decentralized economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
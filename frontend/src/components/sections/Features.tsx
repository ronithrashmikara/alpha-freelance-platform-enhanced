'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  CpuChipIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Matching',
    description: 'Our advanced AI analyzes project requirements and matches you with the perfect talent or opportunities.',
    color: 'text-purple-600'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Escrow',
    description: 'Blockchain-based escrow system ensures secure payments and protects both clients and freelancers.',
    color: 'text-green-600'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Crypto Payments',
    description: 'Get paid in USDT, ETH, or other cryptocurrencies with instant, low-fee transactions.',
    color: 'text-blue-600'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Smart Disputes',
    description: 'AI-mediated dispute resolution with human oversight ensures fair outcomes for all parties.',
    color: 'text-orange-600'
  },
  {
    icon: CpuChipIcon,
    title: 'Project Breakdown',
    description: 'Mistral AI automatically breaks down complex projects into manageable tasks and milestones.',
    color: 'text-indigo-600'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Talent Pool',
    description: 'Access elite developers and designers from around the world, all verified and rated.',
    color: 'text-teal-600'
  }
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose ALPHA?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of freelancing with cutting-edge technology and unmatched security
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
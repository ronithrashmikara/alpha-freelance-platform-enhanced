<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Bid;
use App\Models\Wallet;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create users
        $users = [
            [
                'name' => 'Sarah Chen',
                'email' => 'sarah@example.com',
                'password' => Hash::make('demo123'),
                'role' => 'consumer',
                'avatar' => 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Startup founder building the next generation of fintech solutions.',
                'rating' => 4.8,
                'total_projects' => 12,
                'is_verified' => true,
            ],
            [
                'name' => 'Marcus Rodriguez',
                'email' => 'marcus@example.com',
                'password' => Hash::make('demo123'),
                'role' => 'provider',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Full-stack developer specializing in React, Node.js, and blockchain development.',
                'skills' => ['React', 'Node.js', 'TypeScript', 'Solidity', 'Web3'],
                'rating' => 4.9,
                'total_projects' => 28,
                'is_verified' => true,
            ],
            [
                'name' => 'Emily Watson',
                'email' => 'emily@example.com',
                'password' => Hash::make('demo123'),
                'role' => 'provider',
                'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                'bio' => 'UI/UX designer with expertise in modern web design and user experience.',
                'skills' => ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
                'rating' => 4.7,
                'total_projects' => 15,
                'is_verified' => true,
            ],
            [
                'name' => 'David Kim',
                'email' => 'david@example.com',
                'password' => Hash::make('demo123'),
                'role' => 'provider',
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Blockchain developer and smart contract auditor.',
                'skills' => ['Solidity', 'Web3', 'Smart Contracts', 'DeFi', 'Security Auditing'],
                'rating' => 5.0,
                'total_projects' => 22,
                'is_verified' => true,
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@alpha.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                'bio' => 'Platform administrator',
                'is_verified' => true,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create($userData);
            
            // Create wallet for each user
            Wallet::create([
                'user_id' => $user->id,
                'address' => '0x' . bin2hex(random_bytes(20)),
                'private_key' => bin2hex(random_bytes(32)),
                'balance_usdt' => 20.00, // Welcome bonus
            ]);
        }

        // Create projects
        $projects = [
            [
                'user_id' => 1, // Sarah Chen
                'title' => 'DeFi Trading Dashboard',
                'description' => 'Build a comprehensive DeFi trading dashboard with real-time price feeds, portfolio tracking, and advanced charting capabilities. The platform should support multiple DEXs and provide users with detailed analytics.',
                'category' => 'Web Development',
                'skills' => ['React', 'TypeScript', 'Web3', 'DeFi', 'Chart.js'],
                'budget' => 5000.00,
                'status' => 'open',
                'images' => ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'],
                'ai_breakdown' => [
                    'estimatedTime' => 120,
                    'steps' => [
                        [
                            'id' => 1,
                            'order' => 1,
                            'title' => 'Project Setup & Architecture',
                            'description' => 'Set up the development environment, choose tech stack, and design the overall architecture.',
                            'estimatedHours' => 16
                        ],
                        [
                            'id' => 2,
                            'order' => 2,
                            'title' => 'UI/UX Design & Wireframing',
                            'description' => 'Create wireframes, design mockups, and establish the user interface components.',
                            'estimatedHours' => 24
                        ],
                        [
                            'id' => 3,
                            'order' => 3,
                            'title' => 'Frontend Development',
                            'description' => 'Implement the React components, routing, and responsive design.',
                            'estimatedHours' => 40
                        ],
                        [
                            'id' => 4,
                            'order' => 4,
                            'title' => 'Web3 Integration',
                            'description' => 'Integrate with Web3 providers, implement wallet connections, and DEX interactions.',
                            'estimatedHours' => 32
                        ],
                        [
                            'id' => 5,
                            'order' => 5,
                            'title' => 'Testing & Deployment',
                            'description' => 'Write tests, perform security audits, and deploy to production.',
                            'estimatedHours' => 8
                        ]
                    ],
                    'recommendations' => [
                        'Use TypeScript for better code maintainability',
                        'Implement proper error handling for Web3 interactions',
                        'Consider using a state management library like Redux',
                        'Ensure mobile responsiveness for better user experience'
                    ]
                ],
            ],
            [
                'user_id' => 1, // Sarah Chen
                'title' => 'Mobile App UI/UX Redesign',
                'description' => 'Complete redesign of our mobile application interface focusing on user experience, accessibility, and modern design principles. Need someone with strong portfolio in fintech apps.',
                'category' => 'Design',
                'skills' => ['UI/UX Design', 'Mobile Design', 'Figma', 'Prototyping'],
                'budget' => 3000.00,
                'status' => 'in_progress',
                'images' => ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop'],
            ],
            [
                'user_id' => 1, // Sarah Chen
                'title' => 'Smart Contract Development',
                'description' => 'Develop and audit smart contracts for a new DeFi protocol. Includes token contracts, staking mechanisms, and governance features. Security is paramount.',
                'category' => 'Blockchain',
                'skills' => ['Solidity', 'Smart Contracts', 'Security Auditing', 'DeFi'],
                'budget' => 8000.00,
                'status' => 'open',
                'images' => ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop'],
            ],
            [
                'user_id' => 1, // Sarah Chen
                'title' => 'Data Analytics Platform',
                'description' => 'Build a comprehensive data analytics platform for cryptocurrency market analysis. Should include data visualization, trend analysis, and predictive modeling capabilities.',
                'category' => 'Data Science',
                'skills' => ['Python', 'Data Analysis', 'Machine Learning', 'Visualization'],
                'budget' => 4500.00,
                'status' => 'completed',
                'images' => ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'],
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }

        // Create bids
        $bids = [
            [
                'project_id' => 1,
                'user_id' => 2, // Marcus Rodriguez
                'amount' => 4500.00,
                'proposal' => 'I have extensive experience building DeFi applications and trading dashboards. I can deliver a high-quality, responsive dashboard with all the features you need. My approach includes using React with TypeScript, integrating with popular DEXs like Uniswap and SushiSwap, and implementing real-time price feeds.',
                'delivery_time' => 21,
                'status' => 'pending',
            ],
            [
                'project_id' => 1,
                'user_id' => 4, // David Kim
                'amount' => 4800.00,
                'proposal' => 'As a blockchain developer with deep DeFi expertise, I can build a comprehensive trading dashboard that meets all your requirements. I will focus on security, performance, and user experience. The solution will include advanced charting, portfolio tracking, and seamless Web3 integration.',
                'delivery_time' => 28,
                'status' => 'pending',
            ],
            [
                'project_id' => 3,
                'user_id' => 4, // David Kim
                'amount' => 7500.00,
                'proposal' => 'I specialize in smart contract development and security auditing. I can develop secure, gas-optimized contracts for your DeFi protocol with comprehensive testing and documentation. My experience includes working on major DeFi projects and conducting security audits.',
                'delivery_time' => 35,
                'status' => 'pending',
            ],
        ];

        foreach ($bids as $bidData) {
            Bid::create($bidData);
        }

        // Create reviews
        $reviews = [
            [
                'project_id' => 4,
                'reviewer_id' => 1, // Sarah Chen
                'reviewed_user_id' => 2, // Marcus Rodriguez
                'rating' => 5,
                'comment' => 'Outstanding work! Marcus delivered exactly what we needed and more. The data analytics platform exceeded our expectations with its intuitive interface and powerful analysis capabilities. Communication was excellent throughout the project.',
            ],
            [
                'project_id' => 4,
                'reviewer_id' => 2, // Marcus Rodriguez
                'reviewed_user_id' => 1, // Sarah Chen
                'rating' => 5,
                'comment' => 'Sarah was a fantastic client to work with. Clear requirements, prompt communication, and fair payment. The project was well-defined and she provided excellent feedback throughout the development process.',
            ],
        ];

        foreach ($reviews as $reviewData) {
            Review::create($reviewData);
        }
    }
}

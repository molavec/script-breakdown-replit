export const PRICING_PLANS = [
  {
    id: 'FREE',
    name: 'Free Plan',
    price: '$0',
    interval: '/month',
    features: ['Up to 750 tokens/month', 'Basic Script Editor', 'Community Support'],
    available: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$15',
    interval: '/month',
    features: ['Up to 7,500 tokens/month', 'Advanced Analytics', 'Priority Support', 'Export to PDF'],
    available: false, // Coming soon
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: '$49',
    interval: '/month',
    features: ['Up to 30,000 tokens/month', 'Collaborative Editing', 'Custom Templates', 'Dedicated Manager'],
    available: false, // Coming soon
  }
]

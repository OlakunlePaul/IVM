import { CarModel, NavLink } from '@/types'

export const NAV_LINKS: NavLink[] = [
  { label: 'Models', href: '#models' },
  { label: 'Experience', href: '#virtual-tour' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export const FEATURED_MODELS: CarModel[] = [
  {
    id: 'g80',
    name: 'INNOSON G80',
    tagline: 'The Commander of Roads',
    category: 'Luxury SUV',
    price: '₦18,500,000',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2670&auto=format&fit=crop',
    specs: {
      engine: 'Powerful Engine',
      power: 'High Performance',
      transmission: 'Automatic',
      seats: 7,
    },
  },
  {
    id: 'g40',
    name: 'INNOSON G40',
    tagline: 'Born for the Wild',
    category: 'Off-Road SUV',
    price: '₦12,800,000',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2670&auto=format&fit=crop',
    specs: {
      engine: 'Robust Engine',
      power: 'Strong Performance',
      transmission: 'Manual/Automatic',
      seats: 5,
    },
  },
  {
    id: 'g5t',
    name: 'INNOSON G5T',
    tagline: 'Urban Sophistication',
    category: 'Crossover SUV',
    price: '₦9,950,000',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574&auto=format&fit=crop',
    specs: {
      engine: 'Efficient Engine',
      power: 'Balanced Performance',
      transmission: 'Automatic',
      seats: 5,
    },
  },
]


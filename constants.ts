import { CarModel, NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Models', href: '#models' },
  { label: 'Experience', href: '#virtual-tour' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export const FEATURED_MODELS: CarModel[] = [
  {
    id: 'g80',
    name: 'IVM G80',
    tagline: 'The Commander of Roads',
    category: 'Luxury',
    price: '₦60,000,000',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2670&auto=format&fit=crop', // G-Class style
    specs: {
      engine: '3.0L V6 Turbo',
      power: '300 HP',
      transmission: 'Automatic 9-Speed',
      seats: 7,
    },
  },
  {
    id: 'g40',
    name: 'IVM G40',
    tagline: 'Born for the Wild',
    category: 'Off-Road',
    price: '₦35,500,000',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2670&auto=format&fit=crop', // Rugged SUV
    specs: {
      engine: '2.4L Inline-4',
      power: '140 HP',
      transmission: 'Manual 5-Speed',
      seats: 5,
    },
  },
  {
    id: 'g5',
    name: 'IVM G5',
    tagline: 'Urban Sophistication',
    category: 'Crossover',
    price: '₦28,000,000',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574&auto=format&fit=crop', // White Luxury SUV
    specs: {
      engine: '2.0L Turbo',
      power: '180 HP',
      transmission: 'Automatic 6-Speed',
      seats: 5,
    },
  },
];
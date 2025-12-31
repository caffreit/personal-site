import type { Metadata } from 'next';
import ThreeStationsClient from './ThreeStationsClient';

export const metadata: Metadata = {
  title: 'Three Stations | Lumina & Data',
  description: 'Interactive Google Maps lab comparing walking times from central Dublin stations.',
};

export default function ThreeStationsPage() {
  return <ThreeStationsClient />;
}



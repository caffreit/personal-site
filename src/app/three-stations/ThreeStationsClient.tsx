'use client';

import { useRouter } from 'next/navigation';
import { ThreeStations } from '@/components/tools/ThreeStations';

export default function ThreeStationsClient() {
  const router = useRouter();

  return <ThreeStations onBack={() => router.push('/')} />;
}



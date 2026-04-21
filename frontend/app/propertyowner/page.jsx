'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Propertyownerdashboard from '../components/Propertyownerdashboard';

export default function PropertyOwnerPage() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Guard — only owners can access this page
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role) {
      router.push('/login');
    } else if (user.role !== 'owner') {
      router.push('/');
    }
  }, []);

  return (
    <>
      <Propertyownerdashboard />
    </>
  );
}
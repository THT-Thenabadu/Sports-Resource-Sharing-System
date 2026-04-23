'use client';

 import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SharedPayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenParam = params.get('token') || '';

  useEffect(() => {
    if (tokenParam) {
      // Redirect to the main booking page with shared payment info
      router.replace(`/booking?shared_token=${encodeURIComponent(tokenParam)}`);
    } else {
      // Handle missing token, maybe redirect to an error page or home
      router.replace('/booking');
    }
  }, [tokenParam, router]);

  // Render a loading state while redirecting
  return <div className="p-6">Loading payment details...</div>;
}



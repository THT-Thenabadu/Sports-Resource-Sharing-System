'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        name: payload.name,
        role: payload.role
      }));

      // ✅ Fire event so navbar updates
      window.dispatchEvent(new Event('userUpdated'));

      // ✅ Use window.location instead of router.push
      // router.push does a soft nav and navbar doesn't re-mount
      // window.location does a full reload so navbar reads localStorage fresh
      window.location.href = '/';

    } catch (err) {
      console.error('Token decode error:', err);
      window.location.href = '/';
    }
  }, []);

  return <p>Logging you in...</p>;
}
'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackClient() {
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
        id: payload.id,
        name: payload.name,
        role: payload.role
      }));

      // ✅ Fire event so navbar updates
      window.dispatchEvent(new Event('userUpdated'));

      // Redirect by role after OAuth login
      if (payload.role === 'admin') {
        window.location.href = '/admin';
      } else if (payload.role === 'owner') {
        window.location.href = '/dashboard/owner';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      console.error('Token decode error:', err);
      window.location.href = '/';
    }
  }, [params, router]);

  return <p>Logging you in...</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p>Logging you in...</p>}>
      <AuthCallbackClient />
    </Suspense>
  );
}

'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Mobile menu state management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('AuthLayout - Auth state change:', { user: user?.email, loading, pathname });
    
    // Optimized auth state handling - immediate redirect for authenticated users
    if (!user && !pathname.startsWith('/auth/login') && !pathname.startsWith('/auth/signup')) {
      // Only redirect if we're sure the user is not authenticated AND not currently loading
      if (!loading) {
        console.log('Redirecting to login - no user found');
        router.push('/auth/login');
      }
    }
    // If authenticated and on auth pages, redirect to dashboard immediately
    else if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
      console.log('User authenticated, redirecting to dashboard');
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard layout
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuChange={setMobileMenuOpen}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth pages without dashboard layout
  return <>{children}</>;
}

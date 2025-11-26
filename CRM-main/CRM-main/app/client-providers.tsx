'use client';

import { AuthProvider } from '@/lib/auth-context';
import { Providers } from './providers';
import AuthLayout from './auth-layout';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <AuthLayout>
        <Providers>
          {children}
        </Providers>
      </AuthLayout>
    </AuthProvider>
  );
}

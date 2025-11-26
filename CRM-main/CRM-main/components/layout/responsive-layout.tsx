'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useState, useEffect } from 'react';
import { useCRMStore } from '@/lib/store';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    fetchContacts,
    fetchCompanies,
    fetchOpportunities,
    fetchActivities,
    fetchSettings
  } = useCRMStore();

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing CRM data...');

        // Fetch all data
        await Promise.all([
          fetchContacts(),
          fetchCompanies(),
          fetchOpportunities(),
          fetchActivities(),
          fetchSettings()
        ]);

        console.log('CRM data initialized');
      } catch (error) {
        console.error('Error initializing CRM data:', error);
      }
    };

    initializeData();
  }, [fetchContacts, fetchCompanies, fetchOpportunities, fetchActivities, fetchSettings]);

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
        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useCRMStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchContacts = useCRMStore((state) => state.fetchContacts);
  const fetchCompanies = useCRMStore((state) => state.fetchCompanies);
  const fetchOpportunities = useCRMStore((state) => state.fetchOpportunities);
  const fetchActivities = useCRMStore((state) => state.fetchActivities);
  const fetchExpenses = useCRMStore((state) => state.fetchExpenses);
  const fetchSettings = useCRMStore((state) => state.fetchSettings);
  const fetchLeads = useCRMStore((state) => state.fetchLeads);

  useEffect(() => {
    // Initialize data sequentially to avoid rate limiting
    const initializeData = async () => {
      try {
        // Fetch settings first (most important)
        await fetchSettings();

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch core business data
        await fetchContacts();
        await new Promise(resolve => setTimeout(resolve, 100));

        await fetchCompanies();
        await new Promise(resolve => setTimeout(resolve, 100));

        await fetchOpportunities();
        await new Promise(resolve => setTimeout(resolve, 100));

        await fetchActivities();
        await new Promise(resolve => setTimeout(resolve, 100));

        await fetchExpenses();
        await new Promise(resolve => setTimeout(resolve, 100));

        await fetchLeads();
      } catch (error) {
        console.error('Error initializing app data:', error);
      }
    };

    initializeData();
  }, [fetchContacts, fetchCompanies, fetchOpportunities, fetchActivities, fetchExpenses, fetchSettings, fetchLeads]);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}

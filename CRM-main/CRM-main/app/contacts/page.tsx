'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, X, Upload } from 'lucide-react';
import { ContactTable } from '@/components/contacts/contact-table';
import { ContactImportDialog } from '@/components/contacts/contact-import-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    company: 'none',
    position: 'none',
    status: 'none',
  });

  const contacts = useCRMStore((state) => state.contacts);
  const companies = useCRMStore((state) => state.companies);
  const fetchContacts = useCRMStore((state) => state.fetchContacts);
  const fetchCompanies = useCRMStore((state) => state.fetchCompanies);

  // Fetch initial data and set up real-time subscriptions
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Force refresh contacts when coming from add page or if not loaded
        await Promise.all([
          fetchContacts(true),
          fetchCompanies()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup on unmount
    return () => {};
  }, [fetchContacts, fetchCompanies]);

  // Get unique positions for filter
  const uniquePositions = useMemo(() =>
    Array.from(new Set(contacts.map(c => c.position).filter(Boolean) as string[])).sort(),
    [contacts]
  );

  // Apply filters with memoization
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      const matchesSearch = search === '' ||
        contact.first_name.toLowerCase().includes(search.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(search.toLowerCase()) ||
        contact.email?.toLowerCase().includes(search.toLowerCase()) ||
        contact.position?.toLowerCase().includes(search.toLowerCase()) ||
        contact.company?.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.company?.industry?.toLowerCase().includes(search.toLowerCase()) ||
        contact.company?.sector?.toLowerCase().includes(search.toLowerCase()) ||
        contact.company?.website?.toLowerCase().includes(search.toLowerCase());

      // Company filter
      const matchesCompany = filters.company === 'none' || contact.company_id === filters.company;

      // Position filter
      const matchesPosition = filters.position === 'none' || contact.position === filters.position;

      // Status filter (for future use with contact status)
      const matchesStatus = filters.status === 'none' || true; // Placeholder for contact status

      return matchesSearch && matchesCompany && matchesPosition && matchesStatus;
    });
  }, [contacts, search, filters]);

  // Count active filters (excluding 'none' values)
  const activeFiltersCount = Object.values(filters).filter(f => f !== 'none').length;

  const clearFilters = () => {
    setFilters({ company: 'none', position: 'none', status: 'none' });
    setSearch('');
  };

  const hasActiveFilters = activeFiltersCount > 0 || search !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your contact relationships ({filteredContacts.length} of {contacts.length})
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
          <Button 
            onClick={() => router.push('/contacts/add')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, position, company, industry, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative w-full sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Select value={filters.position} onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All positions</SelectItem>
                    {uniquePositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <Badge variant="secondary" className="gap-1">
                      Search: `{search}`
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
                    </Badge>
                  )}
                  {filters.company !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      Company: {companies.find(c => c.id === filters.company)?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, company: 'none' }))} />
                    </Badge>
                  )}
                  {filters.position !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      Position: {filters.position}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, position: 'none' }))} />
                    </Badge>
                  )}
                  {filters.status !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, status: 'none' }))} />
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ContactTable contacts={filteredContacts} />

      <ContactImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}

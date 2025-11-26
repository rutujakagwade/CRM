'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Competitor } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, X } from 'lucide-react';
import { CompetitorTable } from '@/components/competitors/competitor-table';
import { CompetitorDialog } from '@/components/competitors/competitor-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';

export default function CompetitorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'none',
    positionVsYou: 'none',
  });

  // For now, we'll use a simple state management. In a real app, you'd use a store like the contacts page does.
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // Fetch competitors from API
  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getCompetitors();
      if (response.success) {
        setCompetitors((response.data as Competitor[]) || []);
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  // Apply filters with memoization
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(competitor => {
      // Search filter
      const matchesSearch = search === '' ||
        competitor.name.toLowerCase().includes(search.toLowerCase()) ||
        competitor.marketShare?.toLowerCase().includes(search.toLowerCase()) ||
        competitor.customerBase?.toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'none' || competitor.status === filters.status;

      // Position vs You filter
      const matchesPosition = filters.positionVsYou === 'none' || competitor.positionVsYou === filters.positionVsYou;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [competitors, search, filters]);

  // Count active filters (excluding 'none' values)
  const activeFiltersCount = Object.values(filters).filter(f => f !== 'none').length;

  const clearFilters = () => {
    setFilters({ status: 'none', positionVsYou: 'none' });
    setSearch('');
  };

  const hasActiveFilters = activeFiltersCount > 0 || search !== '';

  const handleEdit = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCompetitor(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading competitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and analyze your market competitors ({filteredCompetitors.length} of {competitors.length})
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search competitors by name, market share, or customer base..."
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All statuses</SelectItem>
                    <SelectItem value="Equal">Equal</SelectItem>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Inferior">Inferior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position vs You</label>
                <Select value={filters.positionVsYou} onValueChange={(value) => setFilters(prev => ({ ...prev, positionVsYou: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All positions</SelectItem>
                    <SelectItem value="Leader">Leader</SelectItem>
                    <SelectItem value="Challenger">Challenger</SelectItem>
                    <SelectItem value="Follower">Follower</SelectItem>
                    <SelectItem value="Niche Player">Niche Player</SelectItem>
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
                  {filters.status !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, status: 'none' }))} />
                    </Badge>
                  )}
                  {filters.positionVsYou !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      Position: {filters.positionVsYou}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, positionVsYou: 'none' }))} />
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <CompetitorTable
        competitors={filteredCompetitors}
        onEdit={handleEdit}
        onDeleteSuccess={fetchCompetitors}
      />

      <CompetitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        competitor={editingCompetitor}
        onSuccess={() => {
          fetchCompetitors();
          setDialogOpen(false);
          setEditingCompetitor(null);
        }}
      />
    </div>
  );
}
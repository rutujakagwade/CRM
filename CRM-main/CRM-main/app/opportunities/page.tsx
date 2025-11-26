'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OpportunityDialog } from '@/components/opportunities/opportunity-dialog';
import { Opportunity } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { useCRMStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function OpportunitiesPage() {
  const opportunities = useCRMStore((state) => state.opportunities);
  const contacts = useCRMStore((state) => state.contacts);
  const loading = useCRMStore((state) => state.loading);
  const fetchContacts = useCRMStore((state) => state.fetchContacts);
  const fetchOpportunities = useCRMStore((state) => state.fetchOpportunities);
  const addOpportunity = useCRMStore((state) => state.addOpportunity);
  const updateOpportunity = useCRMStore((state) => state.updateOpportunity);
  const deleteOpportunity = useCRMStore((state) => state.deleteOpportunity);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([fetchContacts(), fetchOpportunities()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    initializeData();
  }, [fetchContacts, fetchOpportunities]);

  const handleAddOpportunity = async (data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addOpportunity(data);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to add opportunity:', err);
      // Error handling - could show toast
    }
  };

  const handleUpdateOpportunity = async (id: string, data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await updateOpportunity(id, data);
      setDialogOpen(false);
      setEditingOpportunity(null);
    } catch (err) {
      console.error('Failed to update opportunity:', err);
      // Error handling - could show toast
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity(id);
      } catch (err) {
        console.error('Failed to delete opportunity:', err);
        // Error handling - could show toast
      }
    }
  };

  const openAddDialog = () => {
    setEditingOpportunity(null);
    setDialogOpen(true);
  };

  const openEditDialog = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingOpportunity) {
      handleUpdateOpportunity(editingOpportunity.id, data);
    } else {
      handleAddOpportunity(data);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading opportunities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Opportunities</CardTitle>
          <Button onClick={openAddDialog}>Add Opportunity</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity Name</TableHead>
                <TableHead>Key Person Name</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products Pitched</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forecast</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map(opportunity => (
                <TableRow key={opportunity.id}>
                  <TableCell>{opportunity.title}</TableCell>
                  <TableCell>{opportunity.key_person_name || '-'}</TableCell>
                  <TableCell>{opportunity.open_date ? new Date(opportunity.open_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{opportunity.close_date ? new Date(opportunity.close_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>₹{Number(opportunity.amount).toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs truncate" title={opportunity.description}>
                    {opportunity.description || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={opportunity.products_pitched?.join(', ')}>
                    {opportunity.products_pitched?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    {opportunity.status === 'meet_contact' ? 'Meet/Contact' :
                     opportunity.status === 'meet_present' ? 'Meet & Present' :
                     opportunity.status === 'closed_win' ? 'Closed by Win' :
                     opportunity.status === 'not_responding' ? 'Not Responding' :
                     opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                  </TableCell>
                  <TableCell>{opportunity.forecast || '-'}</TableCell>
                  <TableCell>
                    {opportunity.stage === 'meet_contact' ? 'Meet/Contact' :
                     opportunity.stage === 'meet_present' ? 'Meet & Present' :
                     opportunity.stage === 'not_responding' ? 'Not Responding' :
                     opportunity.stage || '-'}
                  </TableCell>
                  <TableCell>
                    {opportunity.importance ? `${opportunity.importance}` : '-'}
                  </TableCell>
                  <TableCell>{opportunity.priority}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(opportunity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {opportunities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-muted-foreground">
                    No opportunities found. Add your first opportunity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        opportunity={editingOpportunity}
        contacts={contacts}
      />
    </div>
  );
}

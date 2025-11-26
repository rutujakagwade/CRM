'use client';

import { useState } from 'react';
import { Competitor } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash, Building2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface CompetitorTableProps {
  competitors: Competitor[];
  onEdit: (competitor: Competitor) => void;
  onDeleteSuccess?: () => void;
}

export function CompetitorTable({ competitors, onEdit, onDeleteSuccess }: CompetitorTableProps) {
  const [deleteCompetitor, setDeleteCompetitor] = useState<Competitor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteCompetitor) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteCompetitor(deleteCompetitor.id);
      toast({
        title: 'Success',
        description: `Competitor ${deleteCompetitor.name} has been deleted.`,
      });
      setDeleteCompetitor(null);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete competitor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Superior':
        return 'destructive';
      case 'Equal':
        return 'default';
      case 'Inferior':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPositionBadgeVariant = (position: string) => {
    switch (position) {
      case 'Leader':
        return 'destructive';
      case 'Challenger':
        return 'default';
      case 'Follower':
        return 'secondary';
      case 'Niche Player':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (competitors.length === 0) {
    return (
      <>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Market Share</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Weakness</TableHead>
                <TableHead>Position vs You</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Key Features</TableHead>
                <TableHead>Customer Base</TableHead>
                <TableHead>Recent Development</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No competitors found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get started by adding your first competitor.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={!!deleteCompetitor} onOpenChange={(open) => !open && setDeleteCompetitor(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Competitor</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteCompetitor?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Market Share</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Weakness</TableHead>
              <TableHead>Position vs You</TableHead>
              <TableHead>Pricing Model</TableHead>
              <TableHead>Key Features</TableHead>
              <TableHead>Customer Base</TableHead>
              <TableHead>Recent Development</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((competitor) => (
              <TableRow key={competitor.id}>
                <TableCell>
                  <div className="font-medium">{competitor.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(competitor.status)}>
                    {competitor.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {competitor.marketShare || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {competitor.strength || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {competitor.weakness || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={getPositionBadgeVariant(competitor.positionVsYou)}>
                    {competitor.positionVsYou}
                  </Badge>
                </TableCell>
                <TableCell>
                  {competitor.pricingModel || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {competitor.keyFeatures || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {competitor.customerBase || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {competitor.recentDevelopment || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(competitor)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteCompetitor(competitor)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteCompetitor} onOpenChange={(open) => !open && setDeleteCompetitor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Competitor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteCompetitor?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
'use client';

import { Opportunity } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Building2, DollarSign, Calendar, User } from 'lucide-react';

const statusColors: Record<string, string> = {
  lead: 'bg-slate-100',
  qualified: 'bg-blue-100',
  proposal: 'bg-yellow-100',
  negotiation: 'bg-orange-100',
  won: 'bg-green-100',
  lost: 'bg-red-100',
};

export function OpportunityTable({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No opportunities found
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.title}</TableCell>
                  <TableCell>{opportunity.company?.name}</TableCell>
                  <TableCell>${Number(opportunity.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[opportunity.status]}>
                      {opportunity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{opportunity.sector}</TableCell>
                  <TableCell>
                    <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                      {opportunity.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {opportunity.close_date ? format(new Date(opportunity.close_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{opportunity.owner}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-center">No opportunities found</p>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium leading-tight">{opportunity.title}</CardTitle>
                  <Badge 
                    className={`ml-2 shrink-0 ${statusColors[opportunity.status]}`}
                    variant="secondary"
                  >
                    {opportunity.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{opportunity.company?.name || 'No company'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">${Number(opportunity.amount).toLocaleString()}</span>
                  </div>
                  <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                    {opportunity.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {opportunity.close_date ? format(new Date(opportunity.close_date), 'MMM dd') : 'No date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="truncate">{opportunity.owner}</span>
                  </div>
                </div>

                {opportunity.sector && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Sector:</span>
                    <span className="font-medium">{opportunity.sector}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

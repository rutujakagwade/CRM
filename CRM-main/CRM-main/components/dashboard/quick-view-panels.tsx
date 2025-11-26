'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, UserPlus, ArrowUpRight, Eye, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Contact, Opportunity } from '@/types';

interface QuickViewPanelsProps {
  contacts: Contact[];
  opportunities: Opportunity[];
  onNavigateToLeads: () => void;
  onNavigateToContacts: () => void;
  onNavigateToOpportunities: () => void;
}

export function QuickViewPanels({ 
  contacts, 
  opportunities, 
  onNavigateToLeads, 
  onNavigateToContacts, 
  onNavigateToOpportunities 
}: QuickViewPanelsProps) {
  // Recent contacts (last 5)
  const recentContacts = contacts
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Hot opportunities (high priority, not closed_win/lost)
  const hotOpportunities = opportunities
    .filter(o => !['closed_win', 'lost'].includes(o.status))
    .sort((a, b) => {
      // Sort by priority first, then by amount
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.amount - a.amount;
    })
    .slice(0, 5);

  // Lead opportunities (using 'quality' as initial stage)
  const leadsOpportunities = opportunities
    .filter(o => o.status === 'quality')
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Leads Quick View */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Leads Overview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToLeads}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Leads</span>
              <Badge variant="outline" className="font-bold">
                {leadsOpportunities.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {leadsOpportunities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No leads yet</p>
                </div>
              ) : (
                leadsOpportunities.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lead.company?.name}</span>
                        <span>•</span>
                        <span>₹{lead.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {lead.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <Button 
              onClick={onNavigateToLeads}
              className="w-full" 
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Quick View */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Contacts Overview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToContacts}
            className="text-green-600 hover:text-green-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Contacts</span>
              <Badge variant="outline" className="font-bold">
                {contacts.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {recentContacts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No contacts yet</p>
                </div>
              ) : (
                recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{contact.position || 'No position'}</span>
                        {contact.company && (
                          <>
                            <span>•</span>
                            <span>{contact.company.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                ))
              )}
            </div>

            <Button 
              onClick={onNavigateToContacts}
              className="w-full" 
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Quick View */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Hot Opportunities</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToOpportunities}
            className="text-orange-600 hover:text-orange-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Deals</span>
              <Badge variant="outline" className="font-bold">
                {hotOpportunities.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {hotOpportunities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Target className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No opportunities yet</p>
                </div>
              ) : (
                hotOpportunities.map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{opp.title}</p>
                        <Badge 
                          variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {opp.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{opp.company?.name}</span>
                        <span>•</span>
                        <span>{opp.probability}% chance</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">₹{opp.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button 
              onClick={onNavigateToOpportunities}
              className="w-full" 
              variant="outline"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Add New Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface Activity {
  id: string;
  title: string;
  type: string;
  start_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  contact?: {
    first_name: string;
    last_name: string;
  };
}

interface Opportunity {
  id: string;
  title: string;
  amount: number;
  status: 'quality' | 'meet_contact' | 'meet_present' | 'purpose' | 'negotiate' | 'closed_win' | 'lost' | 'not_responding' | 'remarks';
  close_date?: string;
  priority: 'low' | 'medium' | 'high';
  probability: number;
  company?: {
    name: string;
  };
}

interface TodaysOverviewProps {
  activities: Activity[];
  opportunities: Opportunity[];
  contacts: any[];
}

export function TodaysOverview({ activities, opportunities, contacts }: TodaysOverviewProps) {
  // Today's activities
  const todaysActivities = activities.filter(a => isToday(new Date(a.start_time)));
  
  // Follow-ups due today
  const todaysFollowups = activities.filter(a => 
    a.type.toLowerCase().includes('follow') && isToday(new Date(a.start_time))
  );
  
  // New opportunities this week
  const newOpportunities = opportunities.filter(o => {
    const oppDate = new Date(o.close_date || Date.now());
    const weekAgo = addDays(new Date(), -7);
    return oppDate >= weekAgo && oppDate <= new Date();
  });
  
  // Won opportunities this month
  const wonOpportunities = opportunities.filter(o => o.status === 'closed_win');

  // Lost opportunities this month
  const lostOpportunities = opportunities.filter(o => o.status === 'lost');
  
  // Big deals closing soon (within 30 days)
  const bigDealsClosingSoon = opportunities.filter(o => 
    o.close_date && 
    new Date(o.close_date) <= addDays(new Date(), 30) && 
    new Date(o.close_date) >= new Date() &&
    o.amount >= 10000
  );

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Today's Tasks */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaysActivities.length}</div>
          <div className="flex items-center gap-2 mt-2">
            {todaysFollowups.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {todaysFollowups.length} follow-ups
              </Badge>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {todaysActivities.filter(a => a.status === 'completed').length} completed
          </div>
        </CardContent>
      </Card>

      {/* New Opportunities */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Opportunities</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newOpportunities.length}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              This week
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Total value: ₹{newOpportunities.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Won/Lost This Month */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{wonOpportunities.length}</div>
              <div className="text-xs text-muted-foreground">Won</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{lostOpportunities.length}</div>
              <div className="text-xs text-muted-foreground">Lost</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Win rate: {wonOpportunities.length + lostOpportunities.length > 0 
              ? ((wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100).toFixed(1)
              : 0}%
          </div>
        </CardContent>
      </Card>

      {/* Big Deals Closing Soon */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Big Deals Closing</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bigDealsClosingSoon.length}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              Next 30 days
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Total: ₹{bigDealsClosingSoon.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LeadsSummaryProps {
  opportunities: Opportunity[];
}

export function LeadsSummary({ opportunities }: LeadsSummaryProps) {
  const leadOpportunities = opportunities.filter(o => o.status === 'quality');
  
  const hotLeads = leadOpportunities.filter(o => o.priority === 'high' && o.probability > 50);
  const warmLeads = leadOpportunities.filter(o => o.priority === 'medium' && o.probability > 30);
  const coldLeads = leadOpportunities.filter(o => o.priority === 'low' || o.probability <= 30);

  return (
    <Card className="transition-all duration-700 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Leads Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Hot Leads</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">{hotLeads.length}</div>
              <div className="text-xs text-muted-foreground">
                ₹{hotLeads.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Warm Leads</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-600">{warmLeads.length}</div>
              <div className="text-xs text-muted-foreground">
                ₹{warmLeads.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Cold Leads</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-600">{coldLeads.length}</div>
              <div className="text-xs text-muted-foreground">
                ₹{coldLeads.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

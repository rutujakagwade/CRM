'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  TrendingUp,
  Clock,
  Target,
  Users,
  Activity,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { ChartsSection, SectorChart } from '@/components/dashboard/charts-section';
import { TodaysOverview, LeadsSummary } from '@/components/dashboard/todays-overview';
import { WidgetsSection, FoodTravelExpenses, PipelineStageDistribution } from '@/components/dashboard/widgets-section';
import { ScheduleSection } from '@/components/dashboard/schedule-section';
import { QuickViewPanels } from '@/components/dashboard/quick-view-panels';

import { useOpportunities } from '@/hooks/use-opportunities';
import { useActivities } from '@/hooks/use-activities';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Contact, Company, Expense } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError } = useOpportunities();
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivities();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [animateCards, setAnimateCards] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Fetch additional data and set up real-time subscriptions
  useEffect(() => {
    let isMounted = true;

    async function fetchAdditionalData() {
      try {
        console.log('Fetching dashboard data for user:', user?.email);

        // Fetch expenses
        const expensesResponse = await apiClient.getExpenses();
        const expensesData = expensesResponse.success ? expensesResponse.data : [];

        // Fetch contacts
        const contactsResponse = await apiClient.getContacts();
        const contactsData = contactsResponse.success ? contactsResponse.data : [];

        // Fetch companies
        const companiesResponse = await apiClient.getCompanies();
        const companiesData = companiesResponse.success ? companiesResponse.data : [];

        if (isMounted) {
          setExpenses((expensesData as Expense[]) || []);
          setContacts((contactsData as Contact[]) || []);
          setCompanies((companiesData as Company[]) || []);
          setLastUpdated(new Date());
          setLoading(false);
          console.log('Dashboard data loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Only fetch data when user is authenticated and auth is not loading
    if (user && !authLoading) {
      fetchAdditionalData();
    }

    // Trigger card animations
    const timer = setTimeout(() => setAnimateCards(true), 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  // Enhanced metrics calculations - handle loading states gracefully
  const metrics = useMemo(() => {
    // Use default values when data is loading
    const opportunitiesList = opportunities || [];
    const expensesList = expenses || [];
    
    const totalOpportunities = opportunitiesList.length;
    const wonOpportunities = opportunitiesList.filter(o => o.status === 'closed_win').length;
    const lostOpportunities = opportunitiesList.filter(o => o.status === 'lost').length;
    const qualifiedOpportunities = opportunitiesList.filter(o => ['purpose', 'negotiate'].includes(o.status)).length;

    const totalRevenue = opportunitiesList.filter(o => o.status === 'closed_win').reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const forecastRevenue = opportunitiesList.filter(o => !['closed_win', 'lost'].includes(o.status)).reduce((sum, o) => sum + Number(o.forecast_amount || o.amount || 0), 0);
    
    const winRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;
    const conversionRate = qualifiedOpportunities > 0 ? (wonOpportunities / qualifiedOpportunities) * 100 : 0;
    const avgDealSize = wonOpportunities > 0 ? totalRevenue / wonOpportunities : 0;
    
    const totalExpenses = expensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    
    return {
      totalOpportunities,
      wonOpportunities,
      lostOpportunities,
      qualifiedOpportunities,
      totalRevenue,
      forecastRevenue,
      winRate,
      conversionRate,
      avgDealSize,
      totalExpenses,
      profitMargin,
      isLoading: opportunitiesLoading || activitiesLoading || loading
    };
  }, [opportunities, expenses, opportunitiesLoading, activitiesLoading, loading]);

  // Enhanced pipeline data
  const pipelineData = useMemo(() => [
    {
      name: 'Quality',
      value: opportunities.filter(o => o.status === 'quality').length,
      color: '#6366f1',
      amount: opportunities.filter(o => o.status === 'quality').reduce((sum, o) => sum + Number(o.amount), 0)
    },
    {
      name: 'Meet Contact',
      value: opportunities.filter(o => o.status === 'meet_contact').length,
      color: '#3b82f6',
      amount: opportunities.filter(o => o.status === 'meet_contact').reduce((sum, o) => sum + Number(o.amount), 0)
    },
    {
      name: 'Meet & Present',
      value: opportunities.filter(o => o.status === 'meet_present').length,
      color: '#06b6d4',
      amount: opportunities.filter(o => o.status === 'meet_present').reduce((sum, o) => sum + Number(o.amount), 0)
    },
    {
      name: 'Purpose',
      value: opportunities.filter(o => o.status === 'purpose').length,
      color: '#10b981',
      amount: opportunities.filter(o => o.status === 'purpose').reduce((sum, o) => sum + Number(o.amount), 0)
    },
    {
      name: 'Negotiate',
      value: opportunities.filter(o => o.status === 'negotiate').length,
      color: '#f59e0b',
      amount: opportunities.filter(o => o.status === 'negotiate').reduce((sum, o) => sum + Number(o.amount), 0)
    },
    {
      name: 'Won',
      value: metrics.wonOpportunities,
      color: '#22c55e',
      amount: metrics.totalRevenue
    },
  ], [opportunities, metrics]);

  // Revenue trend data - calculate based on real opportunity data
  const revenueTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Group won opportunities by month
    const monthlyRevenue = opportunities
      .filter(opp => opp.status === 'closed_win')
      .reduce((acc: { [key: string]: number }, opp) => {
        const date = new Date(opp.updated_at || opp.created_at || Date.now());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + Number(opp.amount || 0);
        return acc;
      }, {});

    return months.map((month, index) => {
      const monthDate = new Date(currentYear, index, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const actualRevenue = monthlyRevenue[monthKey] || 0;

      // Calculate target as 120% of actual for past months, or estimated for future
      const isPastMonth = index <= currentMonth;
      const target = isPastMonth
        ? actualRevenue * 1.2
        : Math.max(metrics.totalRevenue * 0.15, 50000); // Estimate for future months

      return {
        month,
        revenue: actualRevenue,
        target,
        actual: actualRevenue
      };
    });
  }, [opportunities, metrics.totalRevenue]);

  // Enhanced sector data
  const sectorData = useMemo(() => {
    const sectors = opportunities.reduce((acc: any[], opp) => {
      const sector = opp.sector || 'Unknown';
      const existing = acc.find(s => s.name === sector);
      if (existing) {
        existing.value += Number(opp.amount);
        existing.count += 1;
        existing.won += opp.status === 'closed_win' ? 1 : 0;
      } else {
        acc.push({ name: sector, value: Number(opp.amount), count: 1, won: opp.status === 'closed_win' ? 1 : 0 });
      }
      return acc;
    }, []);
    
    return sectors.map(sector => ({
      ...sector,
      winRate: sector.count > 0 ? (sector.won / sector.count) * 100 : 0
    }));
  }, [opportunities]);

  // Recent activities data
  const recentActivities = useMemo(() => {
    return activities
      .filter(a => a.status === 'completed')
      .sort((a, b) => {
        const aTime = new Date(b.updated_at || b.created_at || Date.now()).getTime();
        const bTime = new Date(a.updated_at || a.created_at || Date.now()).getTime();
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [activities]);

  // Performance insights
  const insights = useMemo(() => {
    const insights = [];
    
    if (metrics.winRate > 30) {
      insights.push({ type: 'success', message: 'Great win rate! Keep up the excellent work.', icon: CheckCircle });
    } else if (metrics.winRate < 15) {
      insights.push({ type: 'warning', message: 'Win rate could be improved. Focus on qualification.', icon: AlertCircle });
    }
    
    if (metrics.profitMargin > 20) {
      insights.push({ type: 'success', message: 'Healthy profit margins detected.', icon: TrendingUp });
    }
    
    const overdueActivities = activities.filter(a => a.status === 'scheduled' && new Date(a.start_time) < new Date());
    if (overdueActivities.length > 0) {
      insights.push({ type: 'error', message: `${overdueActivities.length} overdue activities need attention.`, icon: XCircle });
    }
    
    return insights;
  }, [metrics.winRate, metrics.profitMargin, activities]);

  // Navigation handlers
  const handleNavigateToLeads = () => {
    router.push('/opportunities?status=lead');
  };

  const handleNavigateToContacts = () => {
    router.push('/contacts');
  };

  const handleNavigateToOpportunities = () => {
    router.push('/opportunities');
  };

  // Show dashboard only when auth is ready and initialized
  // This prevents blank pages after login/signup
  const hasCriticalError = opportunitiesError || activitiesError;
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  if (hasCriticalError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error loading dashboard: {opportunitiesError || activitiesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <DashboardHeader
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        notifications={notifications}
        onRefresh={handleRefresh}
      />

      {/* Insights Banner */}
      {insights.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-2">Performance Insights</h3>
                <div className="space-y-1">
                  {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Icon className={`h-4 w-4 ${
                          insight.type === 'success' ? 'text-green-600' :
                          insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <span>{insight.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <KPICards metrics={metrics} animateCards={animateCards} />

      {/* Today's Overview */}
      <TodaysOverview
        activities={activities || []}
        opportunities={opportunities || []}
        contacts={contacts || []}
      />

      {/* Charts Section */}
      <ChartsSection
        revenueTrendData={revenueTrendData}
        pipelineData={pipelineData}
        sectorData={sectorData}
      />

      {/* Widgets Section */}
      <WidgetsSection
        opportunities={opportunities || []}
        expenses={expenses || []}
        contacts={contacts || []}
        companies={companies || []}
      />

      {/* Advanced Metrics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sector Chart */}
        <SectorChart sectorData={sectorData} />
        
        {/* Food & Travel Expenses */}
        <FoodTravelExpenses expenses={expenses} />
        
        {/* Pipeline Stage Distribution */}
        <PipelineStageDistribution opportunities={opportunities} />
      </div>

      {/* Schedule Section */}
      <ScheduleSection activities={activities} />

      {/* Quick View Panels */}
      <QuickViewPanels
        contacts={contacts || []}
        opportunities={opportunities || []}
        onNavigateToLeads={handleNavigateToLeads}
        onNavigateToContacts={handleNavigateToContacts}
        onNavigateToOpportunities={handleNavigateToOpportunities}
      />

      {/* Leads Summary */}
      <LeadsSummary opportunities={opportunities || []} />

      {/* Recent Activities & Top Opportunities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="transition-all duration-700 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Recent Activities
              <Badge variant="outline" className="ml-auto">
                {recentActivities.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.updated_at || activity.created_at || Date.now()), 'MMM dd, HH:mm')} • {activity.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="default" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card className="transition-all duration-700 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Top Opportunities
              <Badge variant="outline" className="ml-auto">
                Hot Deals
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities
                .filter(o => !['closed_win', 'lost'].includes(o.status))
                .sort((a, b) => Number(b.amount) - Number(a.amount))
                .slice(0, 5)
                .map((opp, index) => (
                  <div key={opp.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group">
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
                        <p className="truncate">{opp.company?.name}</p>
                        <span>•</span>
                        <p>{opp.probability}% chance</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-green-600">₹{Number(opp.amount).toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-1 bg-blue-500 rounded-full" 
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

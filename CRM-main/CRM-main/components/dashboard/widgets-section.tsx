'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Briefcase, 
  CreditCard, 
  Plane, 
  TrendingUp,
  Star,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category?: string;
  date: string;
}

interface Opportunity {
  id: string;
  title: string;
  amount: number;
  status: 'quality' | 'meet_contact' | 'meet_present' | 'purpose' | 'negotiate' | 'closed_win' | 'lost' | 'not_responding' | 'remarks';
  priority: 'low' | 'medium' | 'high';
  probability: number;
  company?: {
    name: string;
  };
}

interface WidgetsSectionProps {
  opportunities: Opportunity[];
  expenses: Expense[];
  contacts: any[];
  companies: any[];
}

export function WidgetsSection({ opportunities, expenses, contacts, companies }: WidgetsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Opportunities Widget */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{opportunities.length}</div>
          <div className="mt-2">
            <Progress
              value={(opportunities.filter(o => o.status === 'closed_win').length / opportunities.length) * 100}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {opportunities.filter(o => o.status === 'closed_win').length} won
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Widget */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {opportunities.filter(o => ['qualified', 'proposal', 'negotiation'].includes(o.status)).length}
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              In progress
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Avg value: ₹{Math.round(
              opportunities
                .filter(o => ['qualified', 'proposal', 'negotiation'].includes(o.status))
                .reduce((sum, o) => sum + o.amount, 0) / 
              Math.max(opportunities.filter(o => ['qualified', 'proposal', 'negotiation'].includes(o.status)).length, 1)
            ).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Widget */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CreditCard className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
              This month
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {expenses.length} transactions
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Widget */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {opportunities.length > 0
              ? ((opportunities.filter(o => o.status === 'closed_win').length / opportunities.length) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="mt-2">
            <Progress
              value={opportunities.length > 0
                ? (opportunities.filter(o => o.status === 'closed_win').length / opportunities.length) * 100
                : 0}
              className="h-2"
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Win rate this quarter
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FoodTravelExpensesProps {
  expenses: Expense[];
}

export function FoodTravelExpenses({ expenses }: FoodTravelExpensesProps) {
  const foodExpenses = expenses.filter(e => 
    e.category?.toLowerCase().includes('food') || 
    e.category?.toLowerCase().includes('meal') ||
    e.title.toLowerCase().includes('food') ||
    e.title.toLowerCase().includes('meal') ||
    e.title.toLowerCase().includes('restaurant')
  );

  const travelExpenses = expenses.filter(e => 
    e.category?.toLowerCase().includes('travel') || 
    e.category?.toLowerCase().includes('transport') ||
    e.title.toLowerCase().includes('travel') ||
    e.title.toLowerCase().includes('flight') ||
    e.title.toLowerCase().includes('hotel')
  );

  const foodTotal = foodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const travelTotal = travelExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFoodTravel = foodTotal + travelTotal;

  return (
    <Card className="transition-all duration-700 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-blue-600" />
          Food & Travel Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Food & Dining</span>
            </div>
            <div className="text-right">
              <div className="font-bold">₹{foodTotal.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{foodExpenses.length} items</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Travel & Transport</span>
            </div>
            <div className="text-right">
              <div className="font-bold">₹{travelTotal.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{travelExpenses.length} items</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
            <span className="font-medium">Total</span>
            <span className="font-bold">₹{totalFoodTravel.toLocaleString()}</span>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PipelineStageDistributionProps {
  opportunities: Opportunity[];
}

export function PipelineStageDistribution({ opportunities }: PipelineStageDistributionProps) {
  const stageDistribution = [
    { stage: 'quality', name: 'Quality', color: '#6366f1', count: 0 },
    { stage: 'meet_contact', name: 'Meet Contact', color: '#3b82f6', count: 0 },
    { stage: 'meet_present', name: 'Meet & Present', color: '#06b6d4', count: 0 },
    { stage: 'purpose', name: 'Purpose', color: '#10b981', count: 0 },
    { stage: 'negotiate', name: 'Negotiate', color: '#f59e0b', count: 0 },
    { stage: 'closed_win', name: 'Won', color: '#22c55e', count: 0 },
    { stage: 'lost', name: 'Lost', color: '#ef4444', count: 0 },
  ].map(stage => ({
    ...stage,
    count: opportunities.filter(o => o.status === stage.stage).length,
    percentage: opportunities.length > 0
      ? (opportunities.filter(o => o.status === stage.stage).length / opportunities.length) * 100
      : 0
  }));

  return (
    <Card className="transition-all duration-700 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          Pipeline Stage Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stageDistribution.map((stage) => (
            <div key={stage.stage} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-sm">{stage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.count}</span>
                <span className="text-xs text-muted-foreground">
                  ({stage.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <div className="text-center">
            <div className="text-lg font-bold">{opportunities.length}</div>
            <div className="text-xs text-muted-foreground">Total Opportunities</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

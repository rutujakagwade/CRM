'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Target, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';

interface Metrics {
  totalRevenue: number;
  forecastRevenue: number;
  winRate: number;
  conversionRate: number;
  wonOpportunities: number;
  totalOpportunities: number;
  qualifiedOpportunities: number;
  avgDealSize: number;
}

interface KPICardsProps {
  metrics: Metrics;
  animateCards: boolean;
}

export function KPICards({ metrics, animateCards }: KPICardsProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className={`transition-all duration-700 hover:shadow-lg hover:scale-[1.02] ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {metrics.wonOpportunities} deals won
          </div>
        </CardContent>
      </Card>

      <Card className={`transition-all duration-700 hover:shadow-lg hover:scale-[1.02] ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full">
            <Target className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {metrics.winRate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress value={metrics.winRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.wonOpportunities} of {metrics.totalOpportunities} deals won
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={`transition-all duration-700 hover:shadow-lg hover:scale-[1.02] ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            ₹{metrics.forecastRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              {metrics.qualifiedOpportunities} active deals
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Avg: ₹{(metrics.forecastRevenue / Math.max(metrics.qualifiedOpportunities, 1)).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className={`transition-all duration-700 hover:shadow-lg hover:scale-[1.02] ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full">
            <Zap className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress value={metrics.conversionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Qualified to won</p>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Avg deal: ₹{metrics.avgDealSize.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface PipelineData {
  name: string;
  value: number;
  color: string;
  amount: number;
}

interface RevenueTrendData {
  month: string;
  revenue: number;
  target: number;
  actual: number;
}

interface SectorData {
  name: string;
  value: number;
  count: number;
  won: number;
  winRate: number;
}

interface ChartsSectionProps {
  revenueTrendData: RevenueTrendData[];
  pipelineData: PipelineData[];
  sectorData: SectorData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export function ChartsSection({ revenueTrendData, pipelineData, sectorData }: ChartsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Trend Chart */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Revenue Trend & Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
                labelStyle={{ color: '#374151' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline Chart */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData} layout="horizontal">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'value' ? 'Opportunities' : 'Value']}
                labelFormatter={(label) => `Stage: ${label}`}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {pipelineData.map((stage, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-muted-foreground">{stage.name}: {stage.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SectorChartProps {
  sectorData: SectorData[];
}

export function SectorChart({ sectorData }: SectorChartProps) {
  return (
    <Card className="transition-all duration-700 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-yellow-600" />
          Revenue by Sector
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry.name.length > 8 ? entry.name.substring(0, 8) + '...' : entry.name}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {sectorData.slice(0, 3).map((sector, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{sector.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">₹{sector.value.toLocaleString()}</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">
                  {sector.winRate.toFixed(0)}% win
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

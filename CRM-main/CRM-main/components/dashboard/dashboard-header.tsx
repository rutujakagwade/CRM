'use client';

import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  lastUpdated: Date;
  refreshing: boolean;
  notifications: number;
  onRefresh: () => void;
}

export function DashboardHeader({
  lastUpdated,
  refreshing,
  notifications,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live updates active</span>
              <span>•</span>
              <span>Last updated: {format(lastUpdated, 'MMM dd, HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span>{notifications} notifications</span>
        </div>
        <Button 
          onClick={onRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, isToday, isPast, addDays } from 'date-fns';

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
  opportunity?: {
    title: string;
  };
}

interface ScheduleSectionProps {
  activities: Activity[];
}

export function ScheduleSection({ activities }: ScheduleSectionProps) {
  // Today's activities
  const todaysActivities = activities
    .filter(a => isToday(new Date(a.start_time)))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Upcoming follow-ups
  const upcomingFollowups = activities
    .filter(a => 
      a.status === 'scheduled' && 
      new Date(a.start_time) > new Date() &&
      a.type.toLowerCase().includes('follow')
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  // Overdue activities
  const overdueActivities = activities
    .filter(a => 
      a.status === 'scheduled' && 
      isPast(new Date(a.start_time))
    )
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Today's Schedule */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {`Today's Schedule`}
            <Badge variant="outline" className="ml-auto">
              {todaysActivities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todaysActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activities scheduled for today</p>
              </div>
            ) : (
              todaysActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300 hover:shadow-sm hover:bg-muted/50"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.start_time), 'HH:mm')} • {activity.type}
                    </p>
                    {activity.contact && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.contact.first_name} {activity.contact.last_name}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Follow-ups */}
      <Card className="transition-all duration-700 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Upcoming Follow-ups
            <Badge variant="outline" className="ml-auto">
              {upcomingFollowups.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingFollowups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming follow-ups</p>
              </div>
            ) : (
              upcomingFollowups.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.start_time), 'MMM dd, HH:mm')} • {activity.type}
                    </p>
                    {activity.contact && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.contact.first_name} {activity.contact.last_name}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    Scheduled
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Activities Alert */}
      {overdueActivities.length > 0 && (
        <Card className="lg:col-span-2 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Overdue Activities ({overdueActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 rounded bg-red-100 dark:bg-red-900/30">
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(activity.start_time), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

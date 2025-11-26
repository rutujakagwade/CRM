'use client';

import { useState, useEffect } from 'react';
import { useCRMStore } from '@/lib/store';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Phone, 
  Mail, 
  User,
  Building2,
  Target,
  CheckCircle,
  Circle,
  RefreshCw,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { ActivityDialog } from '@/components/activities/activity-dialog';
import { Activity } from '@/types';

const localizer = momentLocalizer(moment);

type MainView = 'calendar' | 'list';
type CalendarView = 'month' | 'week' | 'day';
type ListView = 'grid' | 'table';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Activity;
}

export default function CalendarPage() {
  const [mainView, setMainView] = useState<MainView>('calendar');
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [listView, setListView] = useState<ListView>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const activities = useCRMStore((state) => state.activities);
  const contacts = useCRMStore((state) => state.contacts);
  const companies = useCRMStore((state) => state.companies);
  const opportunities = useCRMStore((state) => state.opportunities);
  const fetchActivities = useCRMStore((state) => state.fetchActivities);
  const updateActivity = useCRMStore((state) => state.updateActivity);
  const deleteActivity = useCRMStore((state) => state.deleteActivity);

  // Fetch activities and set up real-time subscriptions
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchActivities();
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    initializeData();

    return () => {};
  }, [fetchActivities]);

  // Filter and sort activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchQuery === '' || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.contact?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.contact?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;

    let matchesDateRange = true;
    const activityDate = new Date(activity.start_time);
    const now = new Date();
    
    switch (filterDateRange) {
      case 'today':
        matchesDateRange = moment(activityDate).isSame(moment(), 'day');
        break;
      case 'thisWeek':
        matchesDateRange = moment(activityDate).isBetween(moment().startOf('week'), moment().endOf('week'), 'day', '[]');
        break;
      case 'thisMonth':
        matchesDateRange = moment(activityDate).isSame(moment(), 'month');
        break;
      case 'overdue':
        matchesDateRange = activityDate < now && activity.status !== 'completed';
        break;
      case 'upcoming':
        matchesDateRange = activityDate >= now;
        break;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'start_time':
        aValue = new Date(a.start_time);
        bValue = new Date(b.start_time);
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = new Date(a.start_time);
        bValue = new Date(b.start_time);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Convert activities to calendar events
  const events: CalendarEvent[] = filteredActivities.map(activity => ({
    id: activity.id,
    title: activity.title,
    start: new Date(activity.start_time),
    end: activity.end_time ? new Date(activity.end_time) : new Date(new Date(activity.start_time).getTime() + 60 * 60 * 1000),
    resource: activity,
  }));

  // Event styling based on status and type
  const eventStyleGetter = (event: CalendarEvent) => {
    const activity = event.resource;
    let backgroundColor = '#3174ad'; // Default blue
    
    switch (activity.type.toLowerCase()) {
      case 'call':
        backgroundColor = '#10b981'; // Green
        break;
      case 'email':
        backgroundColor = '#3b82f6'; // Blue
        break;
      case 'visit':
        backgroundColor = '#f59e0b'; // Orange
        break;
      case 'meeting':
        backgroundColor = '#8b5cf6'; // Purple
        break;
      default:
        backgroundColor = '#6b7280'; // Gray
    }

    if (activity.status === 'completed') {
      backgroundColor = '#22c55e'; // Green for completed
    } else if (activity.status === 'cancelled') {
      backgroundColor = '#ef4444'; // Red for cancelled
    } else {
      // Add visual indicator for overdue activities
      const now = new Date();
      const activityDate = new Date(activity.start_time);
      if (activityDate < now && activity.status === 'scheduled') {
        backgroundColor = '#dc2626'; // Red for overdue
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: activity.status === 'completed' ? 0.8 : 1,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    };
  };

  // Handle event click
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setActivityToEdit(event.resource);
    setShowEventDialog(true);
  };

  // Handle slot click (create new activity)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedEvent(null);
    setActivityToEdit(null);
    setShowNewActivityDialog(true);
  };

  // Navigate calendar
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    switch (action) {
      case 'PREV':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else if (currentView === 'day') {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else if (currentView === 'day') {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'TODAY':
        newDate.setTime(new Date().getTime());
        break;
    }
    setCurrentDate(newDate);
  };

  // Quick action functions
  const createQuickActivity = (type: string) => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    const defaultTitles = {
      call: 'Quick Call',
      email: 'Quick Email',
      visit: 'Quick Visit',
      meeting: 'Quick Meeting'
    };

    const newActivity = {
      type,
      title: defaultTitles[type as keyof typeof defaultTitles] || 'New Activity',
      start_time: now.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16),
      status: 'scheduled' as const
    };

    setActivityToEdit(newActivity as any);
    setShowNewActivityDialog(true);
  };

  // Mark activity as completed
  const markAsCompleted = async (activity: Activity) => {
    try {
      await updateActivity(activity.id, { status: 'completed' });
    } catch (error) {
      console.error('Error marking activity as completed:', error);
    }
  };

  // Get activity statistics
  const todayActivities = activities.filter(activity => 
    moment(activity.start_time).isSame(moment(), 'day')
  );

  const completedToday = todayActivities.filter(activity => activity.status === 'completed').length;
  const overdueActivities = activities.filter(activity => 
    new Date(activity.start_time) < new Date() && activity.status === 'scheduled'
  ).length;

  const upcomingThisWeek = activities.filter(activity => {
    const activityDate = moment(activity.start_time);
    return activityDate.isBetween(moment(), moment().add(7, 'days'), 'day', '[]') && activity.status !== 'completed';
  }).length;

  // Activity templates
  const activityTemplates = [
    { type: 'call', title: 'Follow-up Call', description: 'Follow up on previous conversation' },
    { type: 'email', title: 'Send Proposal', description: 'Send project proposal via email' },
    { type: 'visit', title: 'Client Meeting', description: 'In-person client meeting' },
    { type: 'meeting', title: 'Team Standup', description: 'Daily team standup meeting' },
  ];

  // Handle view switching
  const handleViewChange = (view: MainView) => {
    setMainView(view);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {filteredActivities.length} activities scheduled
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createQuickActivity('call')}
              className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 text-xs sm:text-sm"
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline ml-1 sm:ml-2">Call</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createQuickActivity('email')}
              className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 text-xs sm:text-sm"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline ml-1 sm:ml-2">Email</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createQuickActivity('visit')}
              className="hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-400 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline ml-1 sm:ml-2">Visit</span>
            </Button>
          </div>
          <Button
            onClick={() => setShowNewActivityDialog(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline font-semibold">New Activity</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todayActivities.length}</div>
            <p className="text-xs text-muted-foreground">{completedToday} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overdueActivities}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              {todayActivities.length > 0 ? Math.round((completedToday / todayActivities.length) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarRange className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{upcomingThisWeek}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={mainView} onValueChange={(value) => handleViewChange(value as MainView)}>
              <TabsList className="grid w-full grid-cols-2 lg:w-auto">
                <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Cal</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">List</span>
                  <span className="sm:hidden">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {mainView === 'calendar' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as CalendarView)}>
                <TabsList>
                  <TabsTrigger value="month" className="text-xs sm:text-sm">
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="week" className="text-xs sm:text-sm">
                    <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="day" className="text-xs sm:text-sm">
                    <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Day
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('TODAY')} className="text-xs sm:text-sm">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('PREV')} className="text-xs sm:text-sm">
                  ←
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('NEXT')} className="text-xs sm:text-sm">
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view={currentView}
                onView={(view) => setCurrentView(view as CalendarView)}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                eventPropGetter={eventStyleGetter}
                step={30}
                timeslots={2}
                popup
                popupOffset={30}
                formats={{
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture),
                }}
                components={{
                  event: ({ event }) => (
                    <div className="p-1 cursor-pointer text-xs">
                      <div className="font-medium truncate mb-1">{event.title}</div>
                      <div className="text-xs opacity-80">
                        {moment(event.start).format('HH:mm')}
                      </div>
                    </div>
                  ),
                }}
                className="rbc-calendar-modern"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity List View */}
      {mainView === 'list' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Activity List</h2>
                <p className="text-muted-foreground text-sm">Manage and track all your scheduled activities</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border bg-muted p-1">
                  <Button
                    variant={listView === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setListView('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={listView === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setListView('table')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="text-xs sm:text-sm"
                >
                  <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {listView === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group cursor-pointer bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-border overflow-hidden"
                    onClick={() => {
                      setActivityToEdit(activity);
                      setSelectedEvent({
                        id: activity.id,
                        title: activity.title,
                        start: new Date(activity.start_time),
                        end: activity.end_time ? new Date(activity.end_time) : new Date(),
                        resource: activity,
                      });
                      setShowEventDialog(true);
                    }}
                  >
                    <div className="h-1" style={{ backgroundColor: eventStyleGetter({ id: activity.id, title: activity.title, start: new Date(activity.start_time), end: activity.end_time ? new Date(activity.end_time) : new Date(), resource: activity }).style.backgroundColor }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getActivityIcon(activity.type)}
                          <h3 className="font-semibold text-sm truncate text-foreground">{activity.title}</h3>
                        </div>
                        <Badge
                          variant={activity.status === 'completed' ? 'default' : activity.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className="text-xs shrink-0 ml-2"
                        >
                          {activity.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>{moment(activity.start_time).format('MMM DD, HH:mm')}</span>
                        </div>

                        {activity.contact && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-green-500" />
                            <span className="truncate">{activity.contact.first_name} {activity.contact.last_name}</span>
                          </div>
                        )}

                        {activity.company && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-purple-500" />
                            <span className="truncate">{activity.company.name}</span>
                          </div>
                        )}
                      </div>

                      {activity.description && (
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 bg-muted/50 p-2 rounded">
                          {activity.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            {activity.type}
                          </Badge>
                        </div>
                        {activity.status === 'scheduled' && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white shadow-sm h-7 px-2 text-xs rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsCompleted(activity);
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border overflow-hidden"
                    onClick={() => {
                      setActivityToEdit(activity);
                      setSelectedEvent({
                        id: activity.id,
                        title: activity.title,
                        start: new Date(activity.start_time),
                        end: activity.end_time ? new Date(activity.end_time) : new Date(),
                        resource: activity,
                      });
                      setShowEventDialog(true);
                    }}
                  >
                    <div className="h-1" style={{ backgroundColor: eventStyleGetter({ id: activity.id, title: activity.title, start: new Date(activity.start_time), end: activity.end_time ? new Date(activity.end_time) : new Date(), resource: activity }).style.backgroundColor }} />
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: eventStyleGetter({ id: activity.id, title: activity.title, start: new Date(activity.start_time), end: activity.end_time ? new Date(activity.end_time) : new Date(), resource: activity }).style.backgroundColor }} />

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate mb-1 text-foreground">{activity.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {moment(activity.start_time).format('MMM DD, YYYY HH:mm')}
                                {activity.end_time && ` - ${moment(activity.end_time).format('HH:mm')}`}
                              </span>
                              {activity.contact && (
                                <span className="flex items-center gap-1 truncate">
                                  <User className="h-3 w-3" />
                                  {activity.contact.first_name} {activity.contact.last_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            {activity.type}
                          </Badge>
                          <Badge variant={activity.status === 'completed' ? 'default' : activity.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
                            {activity.status}
                          </Badge>
                          {activity.status === 'scheduled' && (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white shadow-sm h-7 px-2 text-xs rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsCompleted(activity);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredActivities.length === 0 && (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activities found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterDateRange !== 'all'
                    ? 'Try adjusting your filters or search query to see more activities'
                    : 'Create your first activity to get started with your CRM'
                  }
                </p>
                <Button onClick={() => setShowNewActivityDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Templates */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-2xl font-bold">Quick Templates</h2>
          <p className="text-muted-foreground text-sm">Start with common activity templates to save time</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activityTemplates.map((template, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors border border-border hover:border-primary/50"
                onClick={() => {
                  setActivityToEdit({
                    ...template,
                    start_time: new Date().toISOString().slice(0, 16),
                    end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
                    status: 'scheduled'
                  } as any);
                  setShowNewActivityDialog(true);
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary p-2 rounded-lg">
                    {getActivityIcon(template.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{template.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Dialog */}
      {(showEventDialog || showNewActivityDialog) && (
        <ActivityDialog
          open={showEventDialog || showNewActivityDialog}
          onOpenChange={(open) => {
            setShowEventDialog(open);
            setShowNewActivityDialog(open);
            if (!open) {
              setSelectedEvent(null);
              setActivityToEdit(null);
            }
          }}
          activity={activityToEdit}
          selectedDate={selectedEvent?.start || null}
        />
      )}
    </div>
  );
}

// Helper function to get activity icons
function getActivityIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'call':
      return <Phone className="h-4 w-4 text-green-500" />;
    case 'email':
      return <Mail className="h-4 w-4 text-blue-500" />;
    case 'visit':
      return <User className="h-4 w-4 text-orange-500" />;
    case 'meeting':
      return <Target className="h-4 w-4 text-purple-500" />;
    default:
      return <CalendarIcon className="h-4 w-4 text-gray-500" />;
  }
}

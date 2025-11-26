'use client';

import { Search, Bell, Menu, Plus, LogOut, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useCRMStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const settings = useCRMStore((state) => state.settings);
  const contacts = useCRMStore((state) => state.contacts);
  const companies = useCRMStore((state) => state.companies);
  const opportunities = useCRMStore((state) => state.opportunities);
  const activities = useCRMStore((state) => state.activities);
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
      setIsUserMenuOpen(false);
    }
  };

  // Calculate notification count based on today's activities and high-priority opportunities
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(activity =>
      activity.start_time?.startsWith(today) && activity.status === 'scheduled'
    );
    
    const highPriorityOpps = opportunities.filter(opp =>
      opp.priority === 'high' && opp.status !== 'closed_win' && opp.status !== 'lost'
    );

    const notifications = [
      ...todayActivities.map(a => ({ type: 'activity', title: a.title, time: a.start_time })),
      ...highPriorityOpps.slice(0, 3).map(o => ({ type: 'opportunity', title: o.title, amount: o.amount }))
    ];

    setNotificationCount(notifications.length);
  }, [activities, opportunities]);

  // Real-time search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{
      type: string;
      title: string;
      subtitle: string;
      id: string;
      icon: string;
    }> = [];

    // Search contacts
    contacts
      .filter(contact =>
        contact.first_name?.toLowerCase().includes(query) ||
        contact.last_name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query)
      )
      .slice(0, 3)
      .forEach(contact => {
        results.push({
          type: 'contact',
          title: `${contact.first_name} ${contact.last_name}`,
          subtitle: contact.email || contact.phone || 'No contact info',
          id: contact.id,
          icon: '👤'
        });
      });

    // Search companies
    companies
      .filter(company =>
        company.name?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach(company => {
        results.push({
          type: 'company',
          title: company.name,
          subtitle: company.industry || 'No industry',
          id: company.id,
          icon: '🏢'
        });
      });

    // Search opportunities
    opportunities
      .filter(opportunity =>
        opportunity.title?.toLowerCase().includes(query) ||
        opportunity.status?.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach(opportunity => {
        results.push({
          type: 'opportunity',
          title: opportunity.title,
          subtitle: `₹${opportunity.amount?.toLocaleString()} • ${opportunity.status}`,
          id: opportunity.id,
          icon: '🎯'
        });
      });

    setSearchResults(results.slice(0, 8));
  }, [searchQuery, contacts, companies, opportunities]);

  const handleSearchSelect = (result: any) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    
    switch (result.type) {
      case 'contact':
        router.push(`/contacts/${result.id}`);
        break;
      case 'company':
        router.push(`/companies`);
        break;
      case 'opportunity':
        router.push(`/opportunities`);
        break;
      default:
        break;
    }
  };

  const quickActions = [
    { name: 'Add Contact', icon: '👤', href: '/contacts/add' },
    { name: 'Add Company', icon: '🏢', href: '/companies' },
    { name: 'New Opportunity', icon: '🎯', href: '/opportunities' },
    { name: 'Add Activity', icon: '📅', href: '/calendar' },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-1 max-w-sm sm:max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts, companies, opportunities..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors"
                  onClick={() => handleSearchSelect(result)}
                >
                  <span className="text-lg">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {result.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Actions Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-accent transition-colors"
                  onClick={() => router.push(action.href)}
                >
                  <span>{action.icon}</span>
                  {action.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">{notificationCount} new notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationCount === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="p-2">
                  {/* Today's Activities */}
                  {activities.filter(a => a.start_time?.startsWith(new Date().toISOString().split('T')[0]) && a.status === 'scheduled').map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer">
                      <span className="text-lg">📅</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.start_time ? new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* High Priority Opportunities */}
                  {opportunities.filter(o => o.priority === 'high' && o.status !== 'closed_win' && o.status !== 'lost').slice(0, 3).map((opportunity) => (
                    <div key={opportunity.id} className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer">
                      <span className="text-lg">🎯</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{opportunity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{opportunity.amount?.toLocaleString()} • {opportunity.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={settings?.user_avatar} />
                <AvatarFallback>{user?.email?.[0]?.toUpperCase() || settings?.user_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={settings?.user_avatar} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || settings?.user_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-8 px-2"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  router.push('/settings');
                }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

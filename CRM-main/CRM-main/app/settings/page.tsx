'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCRMStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Settings as SettingsIcon,
  Tag,
  Plus,
  X,
  Download,
  Bell,
  Save,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const settings = useCRMStore((state) => state.settings);
  const fetchSettings = useCRMStore((state) => state.fetchSettings);
  const updateSettings = useCRMStore((state) => state.updateSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [newActivityType, setNewActivityType] = useState('');
  const { toast } = useToast();

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      user_name: settings?.user_name || '',
      user_email: settings?.user_email || '',
      user_avatar: settings?.user_avatar || '',
    },
  });

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      reset({
        user_name: settings.user_name || '',
        user_email: settings.user_email || '',
        user_avatar: settings.user_avatar || '',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updateSettings(data);
      toast({
        title: 'Success',
        description: 'Profile settings updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSector = async () => {
    if (!newSector.trim() || !settings) return;
    
    const updatedSectors = [...(settings.sectors || []), newSector.trim()];
    try {
      await updateSettings({ sectors: updatedSectors });
      setNewSector('');
      toast({
        title: 'Success',
        description: 'Sector added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add sector. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSector = async (sectorToRemove: string) => {
    if (!settings) return;
    
    const updatedSectors = settings.sectors.filter(s => s !== sectorToRemove);
    try {
      await updateSettings({ sectors: updatedSectors });
      toast({
        title: 'Success',
        description: 'Sector removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove sector. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddActivityType = async () => {
    if (!newActivityType.trim() || !settings) return;
    
    const updatedTypes = [...(settings.activity_types || []), newActivityType.trim()];
    try {
      await updateSettings({ activity_types: updatedTypes });
      setNewActivityType('');
      toast({
        title: 'Success',
        description: 'Activity type added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add activity type. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveActivityType = async (typeToRemove: string) => {
    if (!settings) return;
    
    const updatedTypes = settings.activity_types.filter(t => t !== typeToRemove);
    try {
      await updateSettings({ activity_types: updatedTypes });
      toast({
        title: 'Success',
        description: 'Activity type removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove activity type. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = async (format: 'csv' | 'json' | 'excel') => {
    setIsLoading(true);
    try {
      const contacts = useCRMStore.getState().contacts;
      const companies = useCRMStore.getState().companies;
      const activities = useCRMStore.getState().activities;
      const opportunities = useCRMStore.getState().opportunities;

      if (format === 'excel') {
        // Create Excel workbook with multiple sheets
        const workbook = {
          Contacts: contacts.map(contact => ({
            'ID': contact.id,
            'First Name': contact.first_name,
            'Last Name': contact.last_name,
            'Email': contact.email || '',
            'Phone': contact.phone || '',
            'Position': contact.position || '',
            'Company': contact.company?.name || '',
            'Created At': contact.created_at,
            'Updated At': contact.updated_at
          })),
          Companies: companies.map(company => ({
            'ID': company.id,
            'Name': company.name,
            'Industry': company.industry || '',
            'Website': company.website || '',
            'Phone': company.phone || '',
            'Address': company.address || '',
            'City': company.city || '',
            'Country': company.country || '',
            'Created At': company.created_at,
            'Updated At': company.updated_at
          })),
          Activities: activities.map(activity => ({
            'ID': activity.id,
            'Title': activity.title,
            'Type': activity.type,
            'Description': activity.description || '',
            'Start Time': activity.start_time,
            'End Time': activity.end_time || '',
            'Status': activity.status,
            'Contact': activity.contact ? `${activity.contact.first_name} ${activity.contact.last_name}` : '',
            'Company': activity.company?.name || '',
            'Created At': activity.created_at,
            'Updated At': activity.updated_at
          })),
          Opportunities: opportunities.map(opp => ({
            'ID': opp.id,
            'Title': opp.title,
            'Company': opp.company?.name || '',
            'Contact': opp.contact ? `${opp.contact.first_name} ${opp.contact.last_name}` : '',
            'Amount': opp.amount,
            'Forecast Amount': opp.forecast_amount,
            'Status': opp.status,
            'Sector': opp.sector || '',
            'Priority': opp.priority,
            'Probability': opp.probability,
            'Close Date': opp.close_date || '',
            'Owner': opp.owner || '',
            'Description': opp.description || '',
            'Created At': opp.created_at,
            'Updated At': opp.updated_at
          }))
        };

        // Convert to CSV string (simplified Excel alternative)
        let csvContent = '';
        Object.entries(workbook).forEach(([sheetName, data]) => {
          csvContent += `\n\n${sheetName.toUpperCase()}\n`;
          
          if (data.length > 0) {
            // Headers
            csvContent += Object.keys(data[0]).join(',') + '\n';
            
            // Data rows
            data.forEach(row => {
              csvContent += Object.values(row).map(value =>
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
              ).join(',') + '\n';
            });
          }
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `crm-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Complete',
          description: 'Excel-compatible CSV file has been downloaded successfully.',
        });
      } else {
        const data = {
          contacts: contacts.map(c => ({ ...c, company: undefined })),
          companies,
          activities: activities.map(a => ({ ...a, contact: undefined, company: undefined, opportunity: undefined })),
          opportunities: opportunities.map(o => ({ ...o, contact: undefined, company: undefined }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `crm-export-${new Date().toISOString().split('T')[0]}.${format}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Complete',
          description: `Data exported in ${format.toUpperCase()} format successfully.`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your account and system preferences</p>
        </div>
        <Button
          onClick={() => fetchSettings(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription className="text-sm">Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-24 sm:w-24 self-center sm:self-start">
                <AvatarImage src={watch('user_avatar')} />
                <AvatarFallback className="text-lg font-semibold">
                  {watch('user_name')?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="user_avatar">Avatar URL</Label>
                  <Input
                    id="user_avatar"
                    {...register('user_avatar')}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user_name">Full Name</Label>
                <Input
                  id="user_name"
                  {...register('user_name', { required: 'Name is required' })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_email">Email Address</Label>
                <Input
                  id="user_email"
                  type="email"
                  {...register('user_email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            System Preferences
          </CardTitle>
          <CardDescription className="text-sm">Configure system-wide settings and data management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Email Notifications</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive email notifications for important activities and updates
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 self-start sm:self-center">
                Enabled
              </Badge>
            </div>

            {/* Data Export */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Download className="h-4 w-4" />
                Data Export
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Export your CRM data in various formats for backup or migration purposes
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleExportData('excel')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Excel Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData('csv')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData('json')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  JSON Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            Sector Management
          </CardTitle>
          <CardDescription className="text-sm">Manage available business sectors for opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings?.sectors?.map((sector: string) => (
                <Badge
                  key={sector}
                  variant="secondary"
                  className="px-3 py-1 hover:bg-secondary/80 cursor-pointer group"
                >
                  {sector}
                  <X
                    className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    onClick={() => handleRemoveSector(sector)}
                  />
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">No sectors configured yet.</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Add new sector..."
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSector())}
                className="flex-1"
              />
              <Button
                onClick={handleAddSector}
                disabled={!newSector.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Types Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Activity Types</CardTitle>
          <CardDescription className="text-sm">Manage available activity types for your CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings?.activity_types?.map((type: string) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="px-3 py-1 hover:bg-secondary/80 cursor-pointer group"
                >
                  {type}
                  <X
                    className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    onClick={() => handleRemoveActivityType(type)}
                  />
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">No activity types configured yet.</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Add new activity type..."
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActivityType())}
                className="flex-1"
              />
              <Button
                onClick={handleAddActivityType}
                disabled={!newActivityType.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

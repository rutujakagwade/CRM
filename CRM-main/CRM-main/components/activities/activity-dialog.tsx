'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, Contact } from '@/types';
import { useCRMStore } from '@/lib/store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import ContactDropdown from '@/components/ui/contact-dropdown';
import CompanyDropdown from '@/components/ui/company-dropdown';
import AddCompanyModal from '@/app/companies/AddCompanyModel';
import { Phone, Mail, User, Building2, Target, Clock } from 'lucide-react';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  selectedDate?: Date | null;
}

interface ActivityFormData {
  type: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  contact_id?: string;
  company_id?: string;
  opportunity_id?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function ActivityDialog({ open, onOpenChange, activity, selectedDate }: ActivityDialogProps) {
  const contacts = useCRMStore((state) => state.contacts);
  const companies = useCRMStore((state) => state.companies);
  const opportunities = useCRMStore((state) => state.opportunities);
  const addActivity = useCRMStore((state) => state.addActivity);
  const updateActivity = useCRMStore((state) => state.updateActivity);
  const deleteActivity = useCRMStore((state) => state.deleteActivity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEndTime, setHasEndTime] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const { toast } = useToast();

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors, isValid } 
  } = useForm<ActivityFormData>({
    defaultValues: {
      type: '',
      title: '',
      description: '',
      start_time: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
      end_time: '',
      contact_id: '',
      company_id: '',
      opportunity_id: '',
      status: 'scheduled',
    },
    mode: 'onChange'
  });

  const watchedType = watch('type');
  const watchedContactId = watch('contact_id');
  const watchedCompanyId = watch('company_id');

  useEffect(() => {
    if (activity) {
      const startTime = new Date(activity.start_time);
      const endTime = activity.end_time ? new Date(activity.end_time) : null;
      
      reset({
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        start_time: startTime.toISOString().slice(0, 16),
        end_time: endTime ? endTime.toISOString().slice(0, 16) : '',
        contact_id: activity.contact_id || '',
        company_id: activity.company_id || '',
        opportunity_id: activity.opportunity_id || '',
        status: activity.status,
      });
      
      setHasEndTime(!!endTime);
    } else if (selectedDate) {
      // Set default end time to 1 hour after start
      const endTime = new Date(selectedDate.getTime() + 60 * 60 * 1000);
      reset({
        type: '',
        title: '',
        description: '',
        start_time: selectedDate.toISOString().slice(0, 16),
        end_time: endTime.toISOString().slice(0, 16),
        contact_id: '',
        company_id: '',
        opportunity_id: '',
        status: 'scheduled',
      });
      setHasEndTime(true);
    } else {
      // Set default times for new activity
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000);
      reset({
        type: '',
        title: '',
        description: '',
        start_time: now.toISOString().slice(0, 16),
        end_time: endTime.toISOString().slice(0, 16),
        contact_id: '',
        company_id: '',
        opportunity_id: '',
        status: 'scheduled',
      });
      setHasEndTime(true);
    }
  }, [activity, selectedDate, reset]);

  // Auto-populate title based on type and contact
  useEffect(() => {
    if (!activity && watchedType && watchedContactId) {
      const contact = contacts.find(c => c.id === watchedContactId);
      if (contact) {
        let title = '';
        switch (watchedType.toLowerCase()) {
          case 'call':
            title = `Call with ${contact.first_name} ${contact.last_name}`;
            break;
          case 'email':
            title = `Email ${contact.first_name} ${contact.last_name}`;
            break;
          case 'visit':
            title = `Visit ${contact.first_name} ${contact.last_name}`;
            break;
          case 'meeting':
            title = `Meeting with ${contact.first_name} ${contact.last_name}`;
            break;
          default:
            title = `${watchedType} with ${contact.first_name} ${contact.last_name}`;
        }
        setValue('title', title);
      }
    }
  }, [watchedType, watchedContactId, contacts, activity]);

  // Auto-populate company when contact is selected
  useEffect(() => {
    if (!activity && watchedContactId && !watchedCompanyId) {
      const contact = contacts.find(c => c.id === watchedContactId);
      if (contact && contact.company_id) {
        setValue('company_id', contact.company_id);
      }
    }
  }, [watchedContactId, watchedCompanyId, contacts, activity, setValue]);

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      // Clean the data
      const cleanedData = {
        type: data.type,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        start_time: data.start_time,
        end_time: hasEndTime ? data.end_time : undefined,
        contact_id: data.contact_id && data.contact_id !== 'none' ? data.contact_id : undefined,
        company_id: data.company_id && data.company_id !== 'none' ? data.company_id : undefined,
        opportunity_id: data.opportunity_id && data.opportunity_id !== 'none' ? data.opportunity_id : undefined,
        status: data.status,
      };

      if (activity) {
        await updateActivity(activity.id, cleanedData);
        toast({
          title: 'Success',
          description: 'Activity has been updated successfully.',
        });
      } else {
        await addActivity(cleanedData);
        toast({
          title: 'Success',
          description: 'Activity has been created successfully.',
        });
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Error',
        description: activity ? 'Failed to update activity. Please try again.' : 'Failed to create activity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleDeleteActivity = async () => {
    if (!activity) return;
    
    setIsSubmitting(true);
    try {
      await deleteActivity(activity.id);
      toast({
        title: 'Success',
        description: 'Activity has been deleted successfully.',
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete activity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'visit':
        return <User className="h-4 w-4" />;
      case 'meeting':
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activity ? 'Edit Activity' : 'Add Activity'}
              {watchedType && (
                <div className="flex items-center gap-1 text-sm">
                  {getActivityIcon(watchedType)}
                  {watchedType}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {activity ? 'Update the activity details below.' : 'Fill in the details to create a new activity.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type *</Label>
                <Select value={watchedType} onValueChange={(value) => setValue('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Call
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="visit">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Visit
                      </div>
                    </SelectItem>
                    <SelectItem value="meeting">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Meeting
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Activity title"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  }
                })}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Activity description (optional)"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Date & Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  {...register('start_time', { required: 'Start time is required' })}
                  className={errors.start_time ? 'border-destructive' : ''}
                />
                {errors.start_time && (
                  <p className="text-sm text-destructive">{errors.start_time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_end_time"
                    checked={hasEndTime}
                    onCheckedChange={(checked) => {
                      setHasEndTime(!!checked);
                      if (!checked) {
                        setValue('end_time', '');
                      }
                    }}
                  />
                  <Label htmlFor="has_end_time" className="text-sm">
                    Has end time
                  </Label>
                </div>
                {hasEndTime && (
                  <Input
                    id="end_time"
                    type="datetime-local"
                    {...register('end_time')}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_id">Related Contact</Label>
              <ContactDropdown
                value={watchedContactId || ''}
                onChange={(contactId, contact) => {
                  setValue('contact_id', contactId);
                  // Auto-populate company if contact has one
                  if (contact && contact.company_id && !watchedCompanyId) {
                    setValue('company_id', contact.company_id);
                  }
                }}
                placeholder="Select contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Related Company</Label>
              <CompanyDropdown
                value={watchedCompanyId || ''}
                onChange={(companyId) => setValue('company_id', companyId)}
                placeholder="Select company"
                showCreateOption={true}
                onCreateClick={() => setShowCompanyModal(true)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunity_id">Related Opportunity</Label>
              <Select value={watch('opportunity_id') || 'none'} onValueChange={(value) => setValue('opportunity_id', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No opportunity</SelectItem>
                  {opportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      {opportunity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <div>
                {activity && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteActivity}
                    disabled={isSubmitting}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete Activity'}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    activity ? 'Updating...' : 'Creating...'
                  ) : (
                    activity ? 'Update Activity' : 'Create Activity'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Company Creation Modal */}
      <AddCompanyModal
        open={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />
    </>
  );
}

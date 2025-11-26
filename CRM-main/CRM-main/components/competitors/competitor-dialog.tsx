'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Competitor } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface CompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor?: Competitor | null;
  onSuccess?: () => void;
}

interface CompetitorFormData {
  name: string;
  status: 'Equal' | 'Superior' | 'Inferior';
  marketShare?: string;
  strength?: string;
  weakness?: string;
  positionVsYou: 'Leader' | 'Challenger' | 'Follower' | 'Niche Player';
  pricingModel?: string;
  keyFeatures?: string;
  customerBase?: string;
  recentDevelopment?: string;
}

export function CompetitorDialog({ open, onOpenChange, competitor, onSuccess }: CompetitorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<CompetitorFormData>({
    defaultValues: {
      name: '',
      status: 'Equal',
      marketShare: '',
      strength: '',
      weakness: '',
      positionVsYou: 'Challenger',
      pricingModel: '',
      keyFeatures: '',
      customerBase: '',
      recentDevelopment: '',
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (competitor) {
      reset({
        name: competitor.name,
        status: competitor.status,
        marketShare: competitor.marketShare || '',
        strength: competitor.strength || '',
        weakness: competitor.weakness || '',
        positionVsYou: competitor.positionVsYou,
        pricingModel: competitor.pricingModel || '',
        keyFeatures: competitor.keyFeatures || '',
        customerBase: competitor.customerBase || '',
        recentDevelopment: competitor.recentDevelopment || '',
      });
    } else {
      reset({
        name: '',
        status: 'Equal',
        marketShare: '',
        strength: '',
        weakness: '',
        positionVsYou: 'Challenger',
        pricingModel: '',
        keyFeatures: '',
        customerBase: '',
        recentDevelopment: '',
      });
    }
  }, [competitor, reset]);

  const onSubmit = async (data: CompetitorFormData) => {
    setIsSubmitting(true);
    try {
      // Clean the data
      const cleanedData = {
        ...data,
        marketShare: data.marketShare?.trim() || undefined,
        strength: data.strength?.trim() || undefined,
        weakness: data.weakness?.trim() || undefined,
        pricingModel: data.pricingModel?.trim() || undefined,
        keyFeatures: data.keyFeatures?.trim() || undefined,
        customerBase: data.customerBase?.trim() || undefined,
        recentDevelopment: data.recentDevelopment?.trim() || undefined,
      };

      if (competitor) {
        await apiClient.updateCompetitor(competitor.id, cleanedData);
        toast({
          title: 'Success',
          description: 'Competitor has been updated successfully.',
        });
      } else {
        await apiClient.createCompetitor(cleanedData);
        toast({
          title: 'Success',
          description: 'Competitor has been created successfully.',
        });
      }

      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving competitor:', error);
      toast({
        title: 'Error',
        description: competitor ? 'Failed to update competitor. Please try again.' : 'Failed to create competitor. Please try again.',
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

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{competitor ? 'Edit Competitor' : 'Add Competitor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competitor Name *</Label>
              <Input
                id="name"
                {...register('name', {
                  required: 'Competitor name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'Equal' | 'Superior' | 'Inferior') => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equal">Equal</SelectItem>
                  <SelectItem value="Superior">Superior</SelectItem>
                  <SelectItem value="Inferior">Inferior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketShare">Market Share</Label>
            <Input
              id="marketShare"
              placeholder="e.g., 15% of SMB market"
              {...register('marketShare')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strength">Strength</Label>
              <Input
                id="strength"
                placeholder="e.g., Strong brand recognition"
                {...register('strength')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weakness">Weakness</Label>
              <Input
                id="weakness"
                placeholder="e.g., Higher pricing"
                {...register('weakness')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="positionVsYou">Position vs You</Label>
            <Select
              value={watch('positionVsYou')}
              onValueChange={(value: 'Leader' | 'Challenger' | 'Follower' | 'Niche Player') => setValue('positionVsYou', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leader">Leader</SelectItem>
                <SelectItem value="Challenger">Challenger</SelectItem>
                <SelectItem value="Follower">Follower</SelectItem>
                <SelectItem value="Niche Player">Niche Player</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricingModel">Pricing Model</Label>
            <Input
              id="pricingModel"
              placeholder="e.g., Subscription-based"
              {...register('pricingModel')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyFeatures">Key Features</Label>
            <Textarea
              id="keyFeatures"
              placeholder="Describe their main features..."
              {...register('keyFeatures')}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerBase">Customer Base</Label>
            <Textarea
              id="customerBase"
              placeholder="Describe their target customers..."
              {...register('customerBase')}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recentDevelopment">Recent Development</Label>
            <Textarea
              id="recentDevelopment"
              placeholder="Recent news or developments..."
              {...register('recentDevelopment')}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
                competitor ? 'Updating...' : 'Creating...'
              ) : (
                competitor ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
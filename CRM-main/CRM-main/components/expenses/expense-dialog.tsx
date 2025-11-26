'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Expense } from '@/types';
import { useCRMStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  opportunity_id: string;
  description: string;
}

const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Marketing',
  'Training',
  'Equipment',
  'Miscellaneous'
];

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const opportunities = useCRMStore((state) => state.opportunities);
  const fetchOpportunities = useCRMStore((state) => state.fetchOpportunities);
  const addExpense = useCRMStore((state) => state.addExpense);
  const updateExpense = useCRMStore((state) => state.updateExpense);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<ExpenseFormData>({
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      opportunity_id: '',
      description: '',
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        amount: expense.amount,
        category: expense.category || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        opportunity_id: expense.opportunity_id || 'none',
        description: expense.description || '',
      });
    } else {
      reset({
        title: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        opportunity_id: 'none',
        description: '',
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        title: data.title.trim(),
        amount: Number(data.amount),
        category: data.category || undefined,
        date: data.date,
        opportunity_id: data.opportunity_id === 'none' ? undefined : data.opportunity_id || undefined,
        description: data.description?.trim() || undefined,
      };

      if (expense) {
        await updateExpense(expense.id, cleanedData);
        toast({
          title: 'Success',
          description: 'Expense has been updated successfully.',
        });
      } else {
        await addExpense(cleanedData);
        toast({
          title: 'Success',
          description: 'Expense has been created successfully.',
        });
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: expense ? 'Failed to update expense. Please try again.' : 'Failed to create expense. Please try again.',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter expense title"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 2,
                  message: 'Title must be at least 2 characters'
                }
              })}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', {
                  required: 'Amount is required',
                  min: {
                    value: 0.01,
                    message: 'Amount must be greater than 0'
                  }
                })}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)} defaultValue={watch('category')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity_id">Related Opportunity</Label>
            <Select onValueChange={(value) => setValue('opportunity_id', value)} defaultValue={watch('opportunity_id') || 'none'}>
              <SelectTrigger>
                <SelectValue placeholder="Select opportunity (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {opportunities.map((opportunity) => (
                  <SelectItem key={opportunity.id} value={opportunity.id}>
                    {opportunity.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter expense description (optional)"
              {...register('description')}
              rows={3}
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
                expense ? 'Updating...' : 'Creating...'
              ) : (
                expense ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

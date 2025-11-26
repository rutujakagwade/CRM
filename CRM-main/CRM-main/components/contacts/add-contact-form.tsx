'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompanyDropdown from '@/components/ui/company-dropdown';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Phone, MapPin, Briefcase, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContactFormData {
  name: string;
  title: string;
  current_company: string;
  current_company_id?: string;
  past_companies: string;
  reporting_manager: string;
  phone: string;
  email: string;
  address_block: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_country: string;
  address_postal_code: string;
}

interface AddContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  managerSearchQuery: string;
  showManagerDropdown: boolean;
  onManagerSearchChange: (query: string) => void;
  setShowManagerDropdown: (show: boolean) => void;
}

export function AddContactForm({
  onSubmit,
  onCancel,
  isSubmitting,
  managerSearchQuery,
  showManagerDropdown,
  onManagerSearchChange,
  setShowManagerDropdown,
}: AddContactFormProps) {
  const companies = useCRMStore((state) => state.companies);
  const contacts = useCRMStore((state) => state.contacts);
  const { toast } = useToast();

  const {
    register,
    handleSubmit: createHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      title: '',
      current_company: '',
      current_company_id: '',
      past_companies: '',
      reporting_manager: '',
      phone: '',
      email: '',
      address_block: '',
      address_street: '',
      address_city: '',
      address_state: '',
      address_country: '',
      address_postal_code: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = createHandleSubmit(onSubmit);

  const handleManagerSelect = (contact: any) => {
    const name = `${contact.first_name} ${contact.last_name}`;
    setValue('reporting_manager', name);
    onManagerSearchChange(name);
    setShowManagerDropdown(false);
  };

  // Watch all form values for the preview
  const formValues = watch();

  // Filter contacts for manager search
  const filteredManagers = contacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name}`
      .toLowerCase()
      .includes(managerSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">CRM</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Contact</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Add New Contact</h1>
        <p className="text-muted-foreground mt-1">
          Create a new contact record with complete information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Enter the contact personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Software Engineer"
                      {...register('title')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Manage company associations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_company">Current Company</Label>
                  <CompanyDropdown
                    value={watch('current_company_id') || ''}
                    onChange={(companyId, company) => {
                      setValue('current_company_id', companyId);
                      setValue('current_company', company?.name || '');
                      // Auto-fill address if company has address
                      if (company?.address && typeof company.address === 'object') {
                        const address = company.address as { street?: string; city?: string; state?: string; country?: string; zipCode?: string };
                        setValue('address_street', address.street || '');
                        setValue('address_city', address.city || '');
                        setValue('address_state', address.state || '');
                        setValue('address_country', address.country || '');
                        setValue('address_postal_code', address.zipCode || '');
                      }
                    }}
                    placeholder="Select or enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="past_companies">Past Companies</Label>
                  <Input
                    id="past_companies"
                    placeholder="Enter past companies (comma-separated)"
                    {...register('past_companies')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reporting Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reporting Structure
                </CardTitle>
                <CardDescription>Define reporting relationships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="reporting_manager">Reporting Manager</Label>
                  <Input
                    id="reporting_manager"
                    placeholder="Type name or search contacts..."
                    value={managerSearchQuery}
                    onChange={(e) => {
                      onManagerSearchChange(e.target.value);
                      setShowManagerDropdown(true);
                      setValue('reporting_manager', e.target.value);
                    }}
                    onFocus={() => setShowManagerDropdown(true)}
                  />
                  {showManagerDropdown && managerSearchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredManagers.length > 0 ? (
                        filteredManagers.map((contact) => (
                          <div
                            key={contact.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            onClick={() => handleManagerSelect(contact)}
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {contact.first_name} {contact.last_name}
                              </p>
                              {contact.position && (
                                <p className="text-xs text-muted-foreground">
                                  {contact.position}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          No contacts found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Phone and email details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register('phone', {
                        pattern: {
                          value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Postal Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Postal Address
                </CardTitle>
                <CardDescription>Complete mailing address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_block">Block/Building</Label>
                    <Input
                      id="address_block"
                      placeholder="Building A"
                      {...register('address_block')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_street">Street</Label>
                    <Input
                      id="address_street"
                      placeholder="123 Main Street"
                      {...register('address_street')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      placeholder="New York"
                      {...register('address_city')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state">State/Province</Label>
                    <Input
                      id="address_state"
                      placeholder="NY"
                      {...register('address_state')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_country">Country</Label>
                    <Input
                      id="address_country"
                      placeholder="United States"
                      {...register('address_country')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_postal_code">Postal Code</Label>
                    <Input
                      id="address_postal_code"
                      placeholder="10001"
                      {...register('address_postal_code')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <ContactPreviewCard
              formValues={formValues}
              companies={companies}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pb-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ContactPreviewCardProps {
  formValues: ContactFormData;
  companies: any[];
}

function getCompanyDisplayName(formValues: ContactFormData, companies: any[]): string {
  if (formValues.current_company_id) {
    const company = companies.find(c => c.id === formValues.current_company_id);
    return company?.name || formValues.current_company;
  }
  return formValues.current_company;
}

function ContactPreviewCard({ formValues, companies }: ContactPreviewCardProps) {
  return (
    <div className="sticky top-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Summary of entered data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
            <p className="text-sm font-semibold">
              {formValues.name || <span className="text-muted-foreground">Not entered</span>}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
            <p className="text-sm">
              {formValues.title || <span className="text-muted-foreground">Not entered</span>}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Company</h3>
            <p className="text-sm">
              {getCompanyDisplayName(formValues, companies) || <span className="text-muted-foreground">Not entered</span>}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
            <p className="text-sm break-all">
              {formValues.email || <span className="text-muted-foreground">Not entered</span>}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
            <p className="text-sm">
              {formValues.phone || <span className="text-muted-foreground">Not entered</span>}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Manager</h3>
            <p className="text-sm">
              {formValues.reporting_manager || (
                <span className="text-muted-foreground">Not assigned</span>
              )}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
            <p className="text-sm">
              {formValues.address_block ||
              formValues.address_street ||
              formValues.address_city ||
              formValues.address_state ||
              formValues.address_country ||
              formValues.address_postal_code ? (
                <>
                  {formValues.address_block && <>{formValues.address_block}<br /></>}
                  {formValues.address_street && <>{formValues.address_street}<br /></>}
                  {formValues.address_city && <>{formValues.address_city}, </>}
                  {formValues.address_state && <>{formValues.address_state} </>}
                  {formValues.address_postal_code && <>{formValues.address_postal_code}<br /></>}
                  {formValues.address_country}
                </>
              ) : (
                <span className="text-muted-foreground">Not entered</span>
              )}
            </p>
          </div>

          {formValues.past_companies && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Past Companies
                </h3>
                <div className="flex flex-wrap gap-1">
                  {formValues.past_companies.split(',').map((companyName, index) => (
                    <span
                      key={index}
                      className="text-xs bg-secondary px-2 py-1 rounded"
                    >
                      {companyName.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

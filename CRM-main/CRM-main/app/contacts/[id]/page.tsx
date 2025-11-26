'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Calendar,
  Edit,
  Trash,
  User,
  Briefcase,
  Activity,
  DollarSign
} from 'lucide-react';
import { Contact } from '@/types';
import { ContactDialog } from '@/components/contacts/contact-dialog';

export default function ContactDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  const contacts = useCRMStore((state) => state.contacts);
  const opportunities = useCRMStore((state) => state.opportunities);
  const activities = useCRMStore((state) => state.activities);

  useEffect(() => {
    const foundContact = contacts.find(c => c.id === contactId);
    setContact(foundContact || null);
  }, [contactId, contacts]);

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Contact not found</h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">The contact you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/contacts')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Filter related data
  const contactOpportunities = opportunities.filter(opp => opp.contact_id === contactId);
  const contactActivities = activities.filter(activity => 
    activity.contact_id === contactId || activity.company_id === contact.company_id
  );

  // Group activities by type
  const activitiesByType = contactActivities.reduce((acc, activity) => {
    const type = activity.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(activity);
    return acc;
  }, {} as Record<string, typeof contactActivities>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/contacts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={contact.avatar_url || ''} />
              <AvatarFallback className="text-xs sm:text-sm">
                {getInitials(contact.first_name, contact.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold truncate">
                {contact.first_name} {contact.last_name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {contact.position || 'No position'} {contact.company && `at ${contact.company.name}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Contact
          </Button>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-sm hover:underline text-blue-600 truncate"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a 
                  href={`tel:${contact.phone}`}
                  className="text-sm hover:underline text-blue-600"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.position && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{contact.position}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">
                Added {new Date(contact.created_at || '').toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Information</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.company ? (
              <>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{contact.company.name}</span>
                </div>
                {contact.company.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{contact.company.industry}</span>
                  </div>
                )}
                {contact.company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={`tel:${contact.company.phone}`}
                      className="text-sm hover:underline text-blue-600"
                    >
                      {contact.company.phone}
                    </a>
                  </div>
                )}
                {contact.company.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{contact.company.city}, {contact.company.country}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">No company associated</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Opportunities</span>
              <Badge variant="secondary">{contactOpportunities.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Activities</span>
              <Badge variant="secondary">{contactActivities.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Pipeline</span>
              <span className="text-sm font-medium">
                ₹{contactOpportunities.reduce((sum, opp) => sum + opp.forecast_amount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-2">
          <TabsTrigger value="opportunities" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Opportunities</span>
            <span className="sm:hidden">Opp</span>
            ({contactOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Activities</span>
            <span className="sm:hidden">Act</span>
            ({contactActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4">
            {contactOpportunities.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium">No opportunities yet</h3>
                    <p className="text-sm text-muted-foreground">
                      This contact hasnt been associated with any opportunities yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              contactOpportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-base">{opportunity.title}</CardTitle>
                      <Badge variant={
                        opportunity.status === 'closed_win' ? 'default' :
                        opportunity.status === 'lost' ? 'destructive' :
                        'secondary'
                      }>
                        {opportunity.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{opportunity.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">₹{opportunity.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Forecast:</span>
                        <div className="font-medium">₹{opportunity.forecast_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Probability:</span>
                        <div className="font-medium">{opportunity.probability}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Close Date:</span>
                        <div className="font-medium">
                          {opportunity.close_date ? new Date(opportunity.close_date).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4">
            {contactActivities.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium">No activities yet</h3>
                    <p className="text-sm text-muted-foreground">
                      No activities have been recorded for this contact yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              Object.entries(activitiesByType).map(([type, activities]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {type}
                      <Badge variant="outline">{activities.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2 last:border-b-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{activity.title}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground">{activity.description}</div>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-sm">
                              {new Date(activity.start_time).toLocaleDateString()}
                            </div>
                            <Badge variant={
                              activity.status === 'completed' ? 'default' :
                              activity.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }>
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Contact Dialog */}
      <ContactDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        contact={contact}
      />
    </div>
  );
}
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCRMStore } from "@/lib/store";
import type { Company } from "@/types";
import { Mail, Phone, Building2, Globe, MapPin } from "lucide-react";

export default function CompanyDetailDrawer({
  company,
  open,
  onClose,
}: {
  company: Company | null;
  open: boolean;
  onClose: () => void;
}) {
  const contacts = useCRMStore((state) => state.contacts);
  const opportunities = useCRMStore((state) => state.opportunities);
  const activities = useCRMStore((state) => state.activities);

  if (!company) return null;

  // Filter related data
  const companyContacts = contacts.filter((c) => c.company_id === company.id);
  const companyOpps = opportunities.filter((o) => o.company_id === company.id);
  const activityLog = activities.filter((a) =>
    companyContacts.some((contact) => contact.id === a.contact_id)
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{company.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-8 mt-6">

          {/* ------------------ COMPANY INFO ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>Sector: {company.sector}</span>
              </div>

              {company.placeOfOffice && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Office: {company.placeOfOffice}</span>
                </div>
              )}

              {company.headOffice && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>HQ: {company.headOffice}</span>
                </div>
              )}

              {company.address && typeof company.address === 'object' && (company.address.city || company.address.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{company.address.city}, {company.address.state}, {company.address.country} {company.address.zipCode}</span>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}

              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {company.email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ------------------ POC ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Point of Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{company.poc?.name || 'N/A'}</p>
              <Badge variant="outline">{company.poc?.importance || 'Standard'}</Badge>
            </CardContent>
          </Card>

          {/* ------------------ COMPANY NOTES ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Company Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div>
                  <strong>Company Name:</strong> {company.name}
                </div>

                {company.placeOfOffice && (
                  <div>
                    <strong>Place of Office:</strong> {company.placeOfOffice}
                  </div>
                )}

                {company.headOffice && (
                  <div>
                    <strong>Headquarters:</strong> {company.headOffice}
                  </div>
                )}

                {company.website && (
                  <div>
                    <strong>Website:</strong> {company.website}
                  </div>
                )}

                {company.email && (
                  <div>
                    <strong>Email:</strong> {company.email}
                  </div>
                )}

                {company.sector && (
                  <div>
                    <strong>Sector:</strong> {company.sector}
                  </div>
                )}

                {company.poc?.name && (
                  <div>
                    <strong>POC Name:</strong> {company.poc.name}
                  </div>
                )}

                {company.poc?.importance && (
                  <div>
                    <strong>POC Importance:</strong> {company.poc.importance}
                  </div>
                )}

                {company.address && typeof company.address === 'object' && (company.address.street || company.address.city || company.address.state || company.address.country || company.address.zipCode) && (
                  <div>
                    <strong>Address:</strong>
                    <div className="ml-4 mt-1">
                      {company.address.street && <div>{company.address.street}</div>}
                      {company.address.city && <div>{company.address.city}</div>}
                      {company.address.state && <div>{company.address.state}</div>}
                      {company.address.country && <div>{company.address.country}</div>}
                      {company.address.zipCode && <div>{company.address.zipCode}</div>}
                    </div>
                  </div>
                )}

                {company.contacts && company.contacts.length > 0 && (
                  <div>
                    <strong>Current Contact Persons:</strong>
                    <div className="ml-4 mt-1 space-y-2">
                      {company.contacts.map((contact, index) => (
                        <div key={index} className="border-l-2 border-muted pl-3">
                          <div><strong>Contact {index + 1}:</strong></div>
                          <div>Name: {contact.name}</div>
                          {contact.role && <div>Role: {contact.role}</div>}
                          {contact.phone && <div>Phone: {contact.phone}</div>}
                          {contact.email && <div>Email: {contact.email}</div>}
                          {contact.importance && <div>Importance: {contact.importance}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ------------------ COMPANY CONTACTS ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Company Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!company.contacts || company.contacts.length === 0) && (
                <p className="text-sm text-muted-foreground">No contacts added yet.</p>
              )}

              {company.contacts && company.contacts.map((contact, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      {contact.role && (
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">{contact.importance}</Badge>
                  </div>

                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="text-blue-500 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ------------------ CONTACTS ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyContacts.length === 0 && (
                <p className="text-sm text-muted-foreground">No contacts added yet.</p>
              )}

              {companyContacts.map((contact) => (
                <div key={contact.id} className="p-3 border rounded-lg space-y-1">
                  <p className="font-medium">{contact.first_name} {contact.last_name}</p>

                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                  )}

                </div>
              ))}
            </CardContent>
          </Card>

          {/* ------------------ OPPORTUNITIES ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {companyOpps.length === 0 && (
                <p className="text-sm text-muted-foreground">No opportunities found.</p>
              )}

              {companyOpps.map((opp) => (
                <div key={opp.id} className="p-3 border rounded-lg space-y-1">
                  <p className="font-medium">{opp.title}</p>

                  <p className="text-sm text-muted-foreground">
                    ₹{opp.amount?.toLocaleString()}
                  </p>

                  <Badge variant="outline" className="capitalize">
                    {opp.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ------------------ ACTIVITY LOG ------------------ */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityLog.length === 0 && (
                <p className="text-sm text-muted-foreground">No activities recorded.</p>
              )}

              {activityLog.map((activity) => (
                <div key={activity.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{activity.title}</p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.start_time).toLocaleDateString()} — {new Date(activity.start_time).toLocaleTimeString()}
                  </p>

                  <Badge className="mt-2 capitalize">{activity.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </SheetContent>
    </Sheet>
  );
}

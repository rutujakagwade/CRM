"use client";

import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyDropdown from "@/components/ui/company-dropdown";
import ContactDropdown from "@/components/ui/contact-dropdown";
import type { Lead, Company, Contact } from "@/types";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export default function AddLeadModal({ open, onClose, leadToEdit }: AddLeadModalProps) {
  const addLead = useCRMStore((s) => s.addLead);
  const updateLead = useCRMStore((s) => s.updateLead);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [companyMode, setCompanyMode] = useState<'select' | 'create'>('create');

  const [form, setForm] = useState({
    // A. Opportunity Information
    title: "",
    opportunity_type: "Manual",
    lead_status: "Cold",
    forecast: "",
    description: "",
    tat: "",
    remarks: "",

    // B. Company Information
    selectedContactId: "",
    selectedCompanyId: "",
    company_name: "",
    company_website: "",
    company_email: "",
    company_phone: "",
    company_sector: "",
    poc_name: "",
    poc_email: "",
    poc_phone: "",
    poc_importance: "Medium",

    // C. Lead Dates
    open_date: "",
    close_date: "",

    // D. Competitors
    competitors: [] as { name: string; strength: string; weakness: string; positionVsYou: string; status: string }[],
  });

  useEffect(() => {
    if (leadToEdit) {
      setForm({
        title: leadToEdit.title || leadToEdit.name || "",
        opportunity_type: "Manual",
        lead_status: leadToEdit.status || "Cold",
        forecast: leadToEdit.forecast || "",
        description: leadToEdit.notes || "",
        tat: "",
        remarks: "",
        selectedContactId: "",
        selectedCompanyId: "",
        company_name: typeof leadToEdit.company === 'string' ? leadToEdit.company : leadToEdit.company?.name || "",
        company_website: "",
        company_email: "",
        company_phone: "",
        company_sector: "",
        poc_name: "",
        poc_email: "",
        poc_phone: "",
        poc_importance: "Medium",
        open_date: "",
        close_date: "",
        competitors: [],
      });
      setCompanyMode('create');
    } else {
      setForm({
        title: "",
        opportunity_type: "Manual",
        lead_status: "Cold",
        forecast: "",
        description: "",
        tat: "",
        remarks: "",
        selectedContactId: "",
        selectedCompanyId: "",
        company_name: "",
        company_website: "",
        company_email: "",
        company_phone: "",
        company_sector: "",
        poc_name: "",
        poc_email: "",
        poc_phone: "",
        poc_importance: "Medium",
        open_date: "",
        close_date: "",
        competitors: [],
      });
      setCompanyMode('create');
    }
  }, [leadToEdit, open]);

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleContactSelect = (contactId: string, contact?: Contact) => {
    if (contact) {
      setForm(prev => ({
        ...prev,
        selectedContactId: contactId,
        selectedCompanyId: contact.company_id || "",
        company_name: contact.company?.name || "",
        company_website: contact.company?.website || "",
        company_email: contact.company?.email || "",
        company_phone: contact.company?.phone || "",
        company_sector: contact.company?.sector || contact.company?.industry || "",
        poc_name: contact.first_name + " " + contact.last_name,
        poc_email: contact.email || "",
        poc_phone: contact.phone || "",
        poc_importance: "Medium",
      }));
    } else {
      // Clear contact selection
      setForm(prev => ({
        ...prev,
        selectedContactId: "",
      }));
    }
  };

  const handleCompanySelect = (companyId: string, company?: Company) => {
    if (company) {
      setForm(prev => ({
        ...prev,
        selectedCompanyId: companyId,
        company_name: company.name || "",
        company_website: company.website || "",
        company_email: company.email || "",
        company_phone: company.phone || "",
        company_sector: company.sector || "",
        poc_name: company.poc?.name || "",
        poc_email: "",
        poc_phone: "",
        poc_importance: company.poc?.importance || "Medium",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const payload = {
      name: form.title,
      priority: 'medium' as const,
      status: form.lead_status as 'Cold' | 'Warm' | 'Hot' | 'Won' | 'Lost',
      forecast: form.forecast || undefined,
      notes: form.description || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (leadToEdit?.id) {
        await updateLead(leadToEdit.id, payload);
        setSubmitMessage({ type: 'success', text: 'Lead updated successfully!' });
      } else {
        await addLead(payload);
        setSubmitMessage({ type: 'success', text: 'Lead added successfully!' });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save lead. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {leadToEdit ? "Edit Lead" : "Add New Lead"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success/Error Message */}
          {submitMessage && (
            <Alert variant={submitMessage.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{submitMessage.text}</AlertDescription>
            </Alert>
          )}

          {/* A. Opportunity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟦 Opportunity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Opportunity Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    placeholder="Enter opportunity title"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opportunity_type" className="text-sm font-medium">
                    Opportunity Type
                  </Label>
                  <Select value={form.opportunity_type} onValueChange={(v) => handleChange("opportunity_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Import">Import</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select value={form.lead_status} onValueChange={(v) => handleChange("lead_status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cold">Cold</SelectItem>
                      <SelectItem value="Warm">Warm</SelectItem>
                      <SelectItem value="Hot">Hot</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forecast" className="text-sm font-medium">
                    Forecast
                  </Label>
                  <Select value={form.forecast} onValueChange={(v) => handleChange("forecast", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select forecast" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Very High">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tat" className="text-sm font-medium">
                    TAT (Turnaround Time)
                  </Label>
                  <Input
                    id="tat"
                    value={form.tat}
                    onChange={(e) => handleChange("tat", e.target.value)}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the opportunity in detail"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  rows={2}
                  value={form.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  placeholder="Additional notes or remarks"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* B. Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟦 Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Selection */}
              <div className="space-y-2">
                <Label htmlFor="selectedContact" className="text-sm font-medium">
                  Associated Contact (Optional)
                </Label>
                <ContactDropdown
                  value={form.selectedContactId}
                  onChange={handleContactSelect}
                  placeholder="Select a contact to auto-populate company info"
                  showCreateOption={false}
                />
                <p className="text-xs text-muted-foreground">
                  Selecting a contact will automatically fill in company information from their profile.
                </p>
              </div>

              <Tabs value={companyMode} onValueChange={(v) => setCompanyMode(v as 'select' | 'create')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Select Existing Company</TabsTrigger>
                  <TabsTrigger value="create">Add New Company</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedCompany" className="text-sm font-medium">
                      Select Company
                    </Label>
                    <CompanyDropdown
                      value={form.selectedCompanyId}
                      onChange={(companyId, company) => handleCompanySelect(companyId)}
                      placeholder="Choose a company"
                      showCreateOption={true}
                      onCreateClick={() => setCompanyMode('create')}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-sm font-medium">
                        Company Name
                      </Label>
                      <Input
                        id="company_name"
                        value={form.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_website" className="text-sm font-medium">
                        Website
                      </Label>
                      <Input
                        id="company_website"
                        value={form.company_website}
                        onChange={(e) => handleChange("company_website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={form.company_email}
                        onChange={(e) => handleChange("company_email", e.target.value)}
                        placeholder="company@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_phone" className="text-sm font-medium">
                        Phone
                      </Label>
                      <Input
                        id="company_phone"
                        value={form.company_phone}
                        onChange={(e) => handleChange("company_phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_sector" className="text-sm font-medium">
                        Sector
                      </Label>
                      <Input
                        id="company_sector"
                        value={form.company_sector}
                        onChange={(e) => handleChange("company_sector", e.target.value)}
                        placeholder="Technology, Healthcare, etc."
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold mb-4">Point of Contact (POC)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="poc_name" className="text-sm font-medium">
                          POC Name
                        </Label>
                        <Input
                          id="poc_name"
                          value={form.poc_name}
                          onChange={(e) => handleChange("poc_name", e.target.value)}
                          placeholder="Contact person name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="poc_email" className="text-sm font-medium">
                          POC Email
                        </Label>
                        <Input
                          id="poc_email"
                          type="email"
                          value={form.poc_email}
                          onChange={(e) => handleChange("poc_email", e.target.value)}
                          placeholder="poc@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="poc_phone" className="text-sm font-medium">
                          POC Phone
                        </Label>
                        <Input
                          id="poc_phone"
                          value={form.poc_phone}
                          onChange={(e) => handleChange("poc_phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="poc_importance" className="text-sm font-medium">
                        POC Importance
                      </Label>
                      <Select value={form.poc_importance} onValueChange={(v) => handleChange("poc_importance", v)}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* C. Lead Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟦 Lead Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open_date" className="text-sm font-medium">
                    Open Date
                  </Label>
                  <Input
                    id="open_date"
                    type="date"
                    value={form.open_date}
                    onChange={(e) => handleChange("open_date", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">dd-mm-yyyy</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close_date" className="text-sm font-medium">
                    Close Date
                  </Label>
                  <Input
                    id="close_date"
                    type="date"
                    value={form.close_date}
                    onChange={(e) => handleChange("close_date", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Auto-set when marked won/lost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* D. Competitors Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟦 Competitors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.competitors.map((comp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Competitor {index + 1}</h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newComp = form.competitors.filter((_, i) => i !== index);
                        handleChange("competitors", newComp);
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Competitor Name</Label>
                      <Input
                        value={comp.name}
                        onChange={(e) => {
                          const newComp = [...form.competitors];
                          newComp[index].name = e.target.value;
                          handleChange("competitors", newComp);
                        }}
                        placeholder="Enter competitor name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Competitor Strength</Label>
                      <Input
                        value={comp.strength}
                        onChange={(e) => {
                          const newComp = [...form.competitors];
                          newComp[index].strength = e.target.value;
                          handleChange("competitors", newComp);
                        }}
                        placeholder="What are they good at?"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Competitor Weakness</Label>
                      <Input
                        value={comp.weakness}
                        onChange={(e) => {
                          const newComp = [...form.competitors];
                          newComp[index].weakness = e.target.value;
                          handleChange("competitors", newComp);
                        }}
                        placeholder="What are they weak at?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Position vs You</Label>
                      <Input
                        value={comp.positionVsYou}
                        onChange={(e) => {
                          const newComp = [...form.competitors];
                          newComp[index].positionVsYou = e.target.value;
                          handleChange("competitors", newComp);
                        }}
                        placeholder="How do you compare?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select
                        value={comp.status}
                        onValueChange={(v) => {
                          const newComp = [...form.competitors];
                          newComp[index].status = v;
                          handleChange("competitors", newComp);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Winning">Winning</SelectItem>
                          <SelectItem value="Losing">Losing</SelectItem>
                          <SelectItem value="Equal">Equal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleChange("competitors", [...form.competitors, {
                    name: "",
                    strength: "",
                    weakness: "",
                    positionVsYou: "",
                    status: "Equal"
                  }]);
                }}
                className="w-full"
              >
                + Add Competitor
              </Button>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.title.trim()}>
              {isSubmitting ? "Saving..." : (leadToEdit ? "Save Changes" : "Add Lead")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

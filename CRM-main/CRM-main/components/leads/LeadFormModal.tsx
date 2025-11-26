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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type { Lead } from "@/types";

export default function LeadFormModal({
  open,
  onClose,
  leadToEdit,
}: {
  open: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}) {
  const addLead = useCRMStore((s) => s.addLead);
  const updateLead = useCRMStore((s) => s.updateLead);
  const companies = useCRMStore((s) => s.companies);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    opportunity_type: "Manual",
    company_id: "",
    amount: "",
    forecast: "",
    description: "",
    tat: "",
    remarks: "",
    lead_status: "Cold",
    close_date: "",
    // Company inline
    company_name: "",
    company_website: "",
    company_email: "",
    company_phone: "",
    company_sector: "",
    poc_name: "",
    poc_email: "",
    poc_phone: "",
    poc_importance: "Medium",
    // Competitors
    competitors: [] as { name: string; strength: string; weakness: string; positionVsYou: string; status: string }[],
  });

  useEffect(() => {
    if (leadToEdit) {
      setForm({
        title: leadToEdit.name || "",
        opportunity_type: "Manual",
        company_id: "",
        amount: leadToEdit.value ? String(leadToEdit.value) : "",
        forecast: leadToEdit.forecast || "",
        description: leadToEdit.notes || "",
        tat: "",
        remarks: "",
        lead_status: leadToEdit.status || "Cold",
        close_date: "",
        company_name: "",
        company_website: "",
        company_email: "",
        company_phone: "",
        company_sector: "",
        poc_name: "",
        poc_email: "",
        poc_phone: "",
        poc_importance: "Medium",
        competitors: [],
      });
    } else {
      setForm({
        title: "",
        opportunity_type: "Manual",
        company_id: "",
        amount: "",
        forecast: "",
        description: "",
        tat: "",
        remarks: "",
        lead_status: "Cold",
        close_date: "",
        company_name: "",
        company_website: "",
        company_email: "",
        company_phone: "",
        company_sector: "",
        poc_name: "",
        poc_email: "",
        poc_phone: "",
        poc_importance: "Medium",
        competitors: [],
      });
    }
  }, [leadToEdit, open]);

  const handleChange = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const payload = {
      name: form.title,
      value: form.amount ? Number(form.amount) : undefined,
      forecast: (form.forecast as 'Low' | 'Medium' | 'High' | 'Very High') || undefined,
      notes: form.description || undefined,
      status: form.lead_status as 'Cold' | 'Warm' | 'Hot' | 'Won' | 'Lost',
      priority: 'medium' as const,
      source: 'Manual' as const,
      email: '',
      phone: '',
      tags: [],
    };

    try {
      if (leadToEdit?.id) {
        await updateLead(leadToEdit.id, payload);
        setSubmitMessage({ type: 'success', text: 'Lead updated successfully!' });
      } else {
        await addLead(payload);
        setSubmitMessage({ type: 'success', text: 'Lead added successfully!' });
      }

      // Close modal after a brief delay to show success message
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{leadToEdit ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success/Error Message */}
          {submitMessage && (
            <Alert variant={submitMessage.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{submitMessage.text}</AlertDescription>
            </Alert>
          )}

          {/* A. Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Lead Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  placeholder="Enter lead title"
                />
              </div>
              <div>
                <Label>Lead Status</Label>
                <Select value={form.lead_status} onValueChange={(v) => handleChange("lead_status", v)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Forecast</Label>
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
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the lead opportunity"
              />
            </div>
          </div>

          {/* B. Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.company_website}
                  onChange={(e) => handleChange("company_website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.company_email}
                  onChange={(e) => handleChange("company_email", e.target.value)}
                  placeholder="company@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.company_phone}
                  onChange={(e) => handleChange("company_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label>Sector</Label>
                <Input
                  value={form.company_sector}
                  onChange={(e) => handleChange("company_sector", e.target.value)}
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>POC Name</Label>
                <Input
                  value={form.poc_name}
                  onChange={(e) => handleChange("poc_name", e.target.value)}
                  placeholder="Point of contact name"
                />
              </div>
              <div>
                <Label>POC Email</Label>
                <Input
                  type="email"
                  value={form.poc_email}
                  onChange={(e) => handleChange("poc_email", e.target.value)}
                  placeholder="poc@example.com"
                />
              </div>
              <div>
                <Label>POC Phone</Label>
                <Input
                  value={form.poc_phone}
                  onChange={(e) => handleChange("poc_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label>POC Importance</Label>
              <Select value={form.poc_importance} onValueChange={(v) => handleChange("poc_importance", v)}>
                <SelectTrigger>
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

          {/* C. Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>TAT (Turnaround Time)</Label>
                <Input
                  value={form.tat}
                  onChange={(e) => handleChange("tat", e.target.value)}
                  placeholder="e.g., 2 weeks"
                />
              </div>
              <div>
                <Label>Open Date</Label>
                <Input
                  type="date"
                  value={leadToEdit?.created_at ? new Date(leadToEdit.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  disabled
                />
              </div>
              <div>
                <Label>Close Date</Label>
                <Input
                  type="date"
                  value={form.close_date || ""}
                  onChange={(e) => handleChange("close_date", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea
                rows={2}
                value={form.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                placeholder="Additional notes or remarks"
              />
            </div>
          </div>

          {/* D. Competitors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Competitors</h3>
            {form.competitors.map((comp, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Competitor Name" value={comp.name} onChange={(e) => {
                    const newComp = [...form.competitors];
                    newComp[index].name = e.target.value;
                    handleChange("competitors", newComp);
                  }} />
                  <Input placeholder="Strength" value={comp.strength} onChange={(e) => {
                    const newComp = [...form.competitors];
                    newComp[index].strength = e.target.value;
                    handleChange("competitors", newComp);
                  }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Weakness" value={comp.weakness} onChange={(e) => {
                    const newComp = [...form.competitors];
                    newComp[index].weakness = e.target.value;
                    handleChange("competitors", newComp);
                  }} />
                  <Input placeholder="Position vs You" value={comp.positionVsYou} onChange={(e) => {
                    const newComp = [...form.competitors];
                    newComp[index].positionVsYou = e.target.value;
                    handleChange("competitors", newComp);
                  }} />
                  <Select value={comp.status} onValueChange={(v) => {
                    const newComp = [...form.competitors];
                    newComp[index].status = v;
                    handleChange("competitors", newComp);
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Winning">Winning</SelectItem>
                      <SelectItem value="Losing">Losing</SelectItem>
                      <SelectItem value="Equal">Equal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => {
                  const newComp = form.competitors.filter((_, i) => i !== index);
                  handleChange("competitors", newComp);
                }}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => {
              handleChange("competitors", [...form.competitors, { name: "", strength: "", weakness: "", positionVsYou: "", status: "Equal" }]);
            }}>Add Competitor</Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (leadToEdit ? "Save changes" : "Add lead")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

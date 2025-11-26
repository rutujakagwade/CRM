"use client";

import { useEffect, useState } from "react";
import { useCRMStore } from "@/lib/store";
import type { Company } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function EditCompanyModal({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) {
  const updateCompany = useCRMStore((state) => state.updateCompany);
  const open = !!company;

  const sectors = ["IT", "Finance", "Real Estate", "Manufacturing", "Retail", "Healthcare", "Education", "Other"];
  const importanceLevels = ["Highly Important", "Decision Maker", "Influencer", "Standard"];

  const [form, setForm] = useState<{
    name: string;
    placeOfOffice: string;
    headOffice: string;
    website: string;
    email: string;
    poc: { name: string; importance: string };
    sector: string;
    address: { street: string; city: string; state: string; country: string; zipCode: string };
    contacts: { name: string; role?: string; phone?: string; email?: string; importance?: string }[];
  }>({
    name: "",
    placeOfOffice: "",
    headOffice: "",
    website: "",
    email: "",
    poc: { name: "", importance: "" },
    sector: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    contacts: [],
  });

  // Pre-fill form when company changes
  useEffect(() => {
    if (company) {
      // Handle address conversion from string/object to object
      let addressObj = { street: "", city: "", state: "", country: "", zipCode: "" };
      if (typeof company.address === 'object' && company.address) {
        addressObj = {
          street: company.address.street || "",
          city: company.address.city || "",
          state: company.address.state || "",
          country: company.address.country || "",
          zipCode: company.address.zipCode || ""
        };
      }

      setForm({
        name: company.name || "",
        placeOfOffice: company.placeOfOffice || "",
        headOffice: company.headOffice || "",
        website: company.website || "",
        email: company.email || "",
        poc: company.poc || { name: "", importance: "" },
        sector: company.sector || "",
        address: addressObj,
        contacts: company.contacts || [],
      });
    }
  }, [company]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof typeof prev] as any, [child]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePocChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      poc: { ...prev.poc, [field]: value }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const addContact = () => {
    setForm(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", role: "", phone: "", email: "", importance: "" }]
    }));
  };

  const updateContact = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (index: number) => {
    setForm(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!company) return;
    if (!form.name.trim()) return alert("Company name is required!");

    updateCompany(company.id, form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>

        {!company ? (
          <p className="text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label>Place of Office</Label>
                  <Input
                    name="placeOfOffice"
                    value={form.placeOfOffice}
                    onChange={handleChange}
                    placeholder="Office location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Headquarters</Label>
                  <Input
                    name="headOffice"
                    value={form.headOffice}
                    onChange={handleChange}
                    placeholder="HQ address"
                  />
                </div>

                <div>
                  <Label>Sector</Label>
                  <Select value={form.sector} onValueChange={(value) => setForm({ ...form, sector: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Website</Label>
                  <Input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="info@company.com"
                  />
                </div>
              </div>
            </div>

            {/* POC */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Point of Contact (POC)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>POC Name</Label>
                  <Input
                    value={form.poc.name}
                    onChange={(e) => handlePocChange('name', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <Label>Importance</Label>
                  <Select value={form.poc.importance} onValueChange={(value) => handlePocChange('importance', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      {importanceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>

              <div>
                <Label>Street</Label>
                <Input
                  value={form.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={form.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label>State</Label>
                  <Input
                    value={form.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>

                <div>
                  <Label>Zip Code</Label>
                  <Input
                    value={form.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="Zip code"
                  />
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Contact Persons</h3>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {form.contacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Contact {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        placeholder="Contact name"
                      />
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Input
                        value={contact.role}
                        onChange={(e) => updateContact(index, 'role', e.target.value)}
                        placeholder="Position/Role"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        value={contact.email}
                        onChange={(e) => updateContact(index, 'email', e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Importance</Label>
                    <Select
                      value={contact.importance}
                      onValueChange={(value) => updateContact(index, 'importance', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent>
                        {importanceLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!company}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

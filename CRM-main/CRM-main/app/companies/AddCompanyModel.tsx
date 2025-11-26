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
import { toast } from "sonner";

// Constants for dropdown options
const IMPORTANCE_LEVELS = [
  { value: "Highly Important", label: "Highly Important" },
  { value: "Decision Maker", label: "Decision Maker" },
  { value: "Standard", label: "Standard" },
  { value: "Influencer", label: "Influencer" },
];

const sectors = ["IT", "Finance", "Real Estate", "Manufacturing", "Retail", "Healthcare", "Education", "Other"];

export default function AddCompanyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addCompany = useCRMStore((state) => state.addCompany);
  const settings = useCRMStore((state) => state.settings);
  const fetchSettings = useCRMStore((state) => state.fetchSettings);

  const [form, setForm] = useState({
    name: "",
    placeOfOffice: "",
    headOffice: "",
    website: "",
    email: "",
    poc: {
      name: "",
      importance: "",
    },
    sector: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    contacts: [] as { name: string; role: string; phone: string; email: string; importance: string }[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && !settings) {
      fetchSettings();
    }
  }, [open, settings, fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith('poc.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        poc: { ...prev.poc, [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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

  const handleClear = () => {
    setForm({
      name: "",
      placeOfOffice: "",
      headOffice: "",
      website: "",
      email: "",
      poc: {
        name: "",
        importance: "",
      },
      sector: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      contacts: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Form data:", form);

    if (!form.name.trim()) {
      toast.error("Company name is required!", {
        description: "Please enter a company name to continue.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare company data - match the Company interface
      const companyData = {
        name: form.name.trim(),
        placeOfOffice: form.placeOfOffice.trim() || undefined,
        headOffice: form.headOffice.trim() || undefined,
        website: form.website.trim() || undefined,
        email: form.email.trim() || undefined,
        poc: (form.poc.name.trim() || form.poc.importance.trim()) ? {
          name: form.poc.name.trim(),
          importance: form.poc.importance.trim(),
        } : undefined,
        sector: form.sector.trim() || undefined,
        addressObj: (form.address.street.trim() || form.address.city.trim() || form.address.state.trim() || form.address.country.trim() || form.address.pincode.trim()) ? {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          country: form.address.country.trim(),
          pincode: form.address.pincode.trim(),
        } : undefined,
        contacts: form.contacts.filter(contact => contact.name.trim()).map(contact => ({
          name: contact.name.trim(),
          role: contact.role.trim() || undefined,
          phone: contact.phone.trim() || undefined,
          email: contact.email.trim() || undefined,
          importance: contact.importance.trim() || undefined,
        })),
        // Also set legacy fields for database compatibility
        industry: form.sector.trim() || undefined,
        address: [form.address.street.trim(), form.address.city.trim()].filter(Boolean).join(', '),
        city: form.address.city.trim() || undefined,
        country: form.address.country.trim() || undefined,
      };

      console.log("Inserting company:", companyData);
      await addCompany(companyData);
      console.log("Company added successfully");

      toast.success("Company added successfully!", {
        description: `"${companyData.name}" has been added to your companies list.`,
      });
      
      handleClear();
      onClose();
    } catch (error: any) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company", {
        description: error?.message || 'Unknown error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">Add New Company</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">Fill in the company details below. Fields marked with * are required.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Company Information */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-900">Basic Company Information</h3>
                <p className="text-sm text-gray-600 mt-1">Enter the fundamental details about the company</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Company Name *</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sector / Category</Label>
                  <Select
                    value={form.sector}
                    onValueChange={(value) => setForm(prev => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select sector/category" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Place of Office</Label>
                  <Input
                    name="placeOfOffice"
                    value={form.placeOfOffice}
                    onChange={handleChange}
                    placeholder="Company's physical presence location"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">HQ (Headquarters)</Label>
                  <Input
                    name="headOffice"
                    value={form.headOffice}
                    onChange={handleChange}
                    placeholder="City or address of company head office"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Website</Label>
                  <Input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Official company email"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

           {/* POC (Point of Contact) */}
           <div className="space-y-6">
             <div className="border-b pb-2">
               <h3 className="text-xl font-semibold text-gray-900">Point of Contact (POC)</h3>
               <p className="text-sm text-gray-600 mt-1">Primary contact person for this company</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="text-sm font-medium">POC Name</Label>
                 <Input
                   name="poc.name"
                   value={form.poc.name}
                   onChange={handleChange}
                   placeholder="Name of the main contact person"
                   className="h-11"
                 />
               </div>

               <div className="space-y-2">
                 <Label className="text-sm font-medium">POC Importance</Label>
                 <Select
                   value={form.poc.importance}
                   onValueChange={(value) => setForm(prev => ({
                     ...prev,
                     poc: { ...prev.poc, importance: value }
                   }))}
                 >
                   <SelectTrigger className="h-11">
                     <SelectValue placeholder="Select importance level" />
                   </SelectTrigger>
                   <SelectContent>
                     {IMPORTANCE_LEVELS.map((level) => (
                       <SelectItem key={level.value} value={level.value}>
                         {level.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
           </div>

          {/* Postal Address (Full Address) */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-xl font-semibold text-gray-900">Company Address</h3>
              <p className="text-sm text-gray-600 mt-1">Complete postal address information</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Street Address</Label>
              <Input
                name="address.street"
                value={form.address.street}
                onChange={handleChange}
                placeholder="Street address"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Input
                  name="address.state"
                  value={form.address.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Input
                  name="address.country"
                  value={form.address.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Pin Code</Label>
                <Input
                  name="address.pincode"
                  value={form.address.pincode}
                  onChange={handleChange}
                  placeholder="Pin code"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Additional Contacts</h3>
                <p className="text-sm text-gray-600 mt-1">Add multiple contact persons for this company</p>
              </div>
              <Button type="button" variant="default" size="sm" onClick={addContact} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {form.contacts.map((contact, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Contact {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Input
                      value={contact.role}
                      onChange={(e) => updateContact(index, 'role', e.target.value)}
                      placeholder="Job role"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Phone number"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="Email address"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Importance</Label>
                  <Select
                    value={contact.importance}
                    onValueChange={(value) => updateContact(index, 'importance', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select importance level" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          </div>

          <DialogFooter className="flex justify-between pt-6 border-t">
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClear} disabled={isSubmitting} className="px-6">
                Clear Form
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="px-6">
                Cancel
              </Button>
            </div>
            <Button type="submit" disabled={isSubmitting} className="px-8 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Adding Company..." : "Add Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

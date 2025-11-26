"use client";

import { useEffect } from "react";
import { useCRMStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contact } from "@/types";

interface ContactDropdownProps {
  value?: string;
  onChange: (contactId: string, contact?: Contact) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCreateOption?: boolean;
  onCreateClick?: () => void;
}

export default function ContactDropdown({
  value,
  onChange,
  placeholder = "Select a contact",
  disabled = false,
  className,
  showCreateOption = false,
  onCreateClick,
}: ContactDropdownProps) {
  const { contacts, contactsLoaded, fetchContacts } = useCRMStore();

  // Ensure contacts are loaded
  useEffect(() => {
    if (!contactsLoaded) {
      fetchContacts();
    }
  }, [contactsLoaded, fetchContacts]);

  const handleValueChange = (contactId: string) => {
    if (contactId === "create-new" && onCreateClick) {
      onCreateClick();
      return;
    }

    const selectedContact = contacts.find(c => c.id === contactId);
    onChange(contactId, selectedContact);
  };

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((contact) => (
          <SelectItem key={contact.id} value={contact.id}>
            <div className="flex flex-col">
              <span className="font-medium">
                {contact.first_name} {contact.last_name}
              </span>
              {contact.position && (
                <span className="text-xs text-muted-foreground">
                  {contact.position}
                </span>
              )}
              {contact.company && (
                <span className="text-xs text-muted-foreground">
                  {typeof contact.company === 'string' ? contact.company : contact.company.name}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        {contacts.length === 0 && !contactsLoaded && (
          <SelectItem value="loading" disabled>
            Loading contacts...
          </SelectItem>
        )}
        {contacts.length === 0 && contactsLoaded && (
          <SelectItem value="no-contacts" disabled>
            No contacts found
          </SelectItem>
        )}
        {showCreateOption && (
          <>
            <div className="border-t my-1" />
            <SelectItem value="create-new" className="text-primary">
              + Create New Contact
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
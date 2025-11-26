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
import type { Company } from "@/types";

interface CompanyDropdownProps {
  value?: string;
  onChange: (companyId: string, company?: Company) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCreateOption?: boolean;
  onCreateClick?: () => void;
}

export default function CompanyDropdown({
  value,
  onChange,
  placeholder = "Select a company",
  disabled = false,
  className,
  showCreateOption = false,
  onCreateClick,
}: CompanyDropdownProps) {
  const { companies, companiesLoaded, fetchCompanies } = useCRMStore();

  // Ensure companies are loaded
  useEffect(() => {
    if (!companiesLoaded) {
      fetchCompanies();
    }
  }, [companiesLoaded, fetchCompanies]);

  const handleValueChange = (companyId: string) => {
    if (companyId === "create-new" && onCreateClick) {
      onCreateClick();
      return;
    }

    const selectedCompany = companies.find(c => c.id === companyId);
    onChange(companyId, selectedCompany);
  };

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex flex-col">
              <span className="font-medium">{company.name}</span>
              {company.industry && (
                <span className="text-xs text-muted-foreground">
                  {company.industry}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        {companies.length === 0 && !companiesLoaded && (
          <SelectItem value="loading" disabled>
            Loading companies...
          </SelectItem>
        )}
        {companies.length === 0 && companiesLoaded && (
          <SelectItem value="no-companies" disabled>
            No companies found
          </SelectItem>
        )}
        {showCreateOption && (
          <>
            <div className="border-t my-1" />
            <SelectItem value="create-new" className="text-primary">
              + Create New Company
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
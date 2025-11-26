"use client";

import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Building2, Users, MapPin, Briefcase, User } from "lucide-react";
import type { Company } from "@/types";

import AddCompanyModal from "./AddCompanyModel";
import EditCompanyModal from "./EditCompanyModal";
import CompanyDetailDrawer from "./CompanyDetailDrawer";
import CompaniesList from "./CompaniesList";
import { ContactTable } from "@/components/contacts/contact-table";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const companies = useCRMStore((state) => state.companies);
  const contacts = useCRMStore((state) => state.contacts);
  const fetchCompanies = useCRMStore((state) => state.fetchCompanies);
  const fetchContacts = useCRMStore((state) => state.fetchContacts);
  const deleteCompany = useCRMStore((state) => state.deleteCompany);

  useEffect(() => {
    fetchCompanies();
    fetchContacts();
  }, [fetchCompanies, fetchContacts]);

  // ---------- STATS CALCULATIONS ----------
  const totalCompanies = companies.length;
  const companiesWithContacts = companies.filter(c => c.contacts && c.contacts.length > 0).length;
  const companiesWithAddress = companies.filter(c =>
    (typeof c.address === 'string' && (c.address as string).trim()) ||
    (typeof c.address === 'object' && c.address && (c.address.city || c.address.street || c.address.country))
  ).length;
  const uniqueSectors = new Set(companies.map(c => c.sector || c.industry).filter(Boolean)).size;

  // ---------- FILTER LOGIC ----------
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.sector?.toLowerCase().includes(search.toLowerCase()) ||
      company.poc?.name?.toLowerCase().includes(search.toLowerCase()) ||
      company.industry?.toLowerCase().includes(search.toLowerCase());

    const matchesSector =
      !industryFilter || company.sector === industryFilter || company.industry === industryFilter;

    const matchesCountry =
      !countryFilter ||
      company.country === countryFilter ||
      (typeof company.address === 'object' && company.address && company.address.country === countryFilter);

    return matchesSearch && matchesSector && matchesCountry;
  });

  // ---------- CLICK HANDLERS ----------
  const openCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailDrawer(true);
  };

  const openEditModal = (company: Company) => {
    setEditCompany(company);
  };

  const handleDelete = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      await deleteCompany(company.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Companies & Contacts</h1>
                <p className="text-slate-600 mt-1">Manage your business relationships and partnerships</p>
              </div>
            </div>

            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Companies</p>
                    <p className="text-2xl font-bold text-slate-900">{totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">With Contacts</p>
                    <p className="text-2xl font-bold text-slate-900">{companiesWithContacts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">With Address</p>
                    <p className="text-2xl font-bold text-slate-900">{companiesWithAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Sectors</p>
                    <p className="text-2xl font-bold text-slate-900">{uniqueSectors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for Companies and Contacts */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            {/* Filters Section */}
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Search & Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search companies by name, sector, or contact..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Select value={industryFilter || "all"} onValueChange={(value) => setIndustryFilter(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-48 border-slate-300">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={countryFilter || "all"} onValueChange={(value) => setCountryFilter(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-48 border-slate-300">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Companies List */}
                <div className="pt-4">
                  <CompaniesList
                    companies={filteredCompanies}
                    onSelect={(company) => openCompanyDetails(company)}
                    onEdit={(company) => openEditModal(company)}
                    onDelete={(company) => handleDelete(company)}
                  />
                  {filteredCompanies.length === 0 && (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No companies found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Contacts</CardTitle>
                <p className="text-sm text-muted-foreground">View all contacts and their associated companies</p>
              </CardHeader>
              <CardContent>
                <ContactTable contacts={contacts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODALS + DRAWER */}
        <AddCompanyModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />

        <EditCompanyModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
        />

        <CompanyDetailDrawer
          company={selectedCompany}
          open={showDetailDrawer}
          onClose={() => setShowDetailDrawer(false)}
        />
      </div>
    </div>
  );
}

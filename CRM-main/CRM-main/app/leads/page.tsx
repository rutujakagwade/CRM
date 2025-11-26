"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCRMStore } from "@/lib/store";
import AddLeadModal from "./_components/AddLeadModal";
import LeadCard from "@/components/leads/LeadCard";
import LeadDetailDrawer from "@/components/leads/LeadDetailDrawer";
import LeadKanban from "@/components/leads/LeadKanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, Kanban, Search, Plus, TrendingUp, Users, CheckCircle, XCircle, Target } from "lucide-react";
import type { Lead } from "@/types";

export default function LeadsPage() {
  const router = useRouter();
  const fetchLeads = useCRMStore((s) => s.fetchLeads);
  const fetchCompanies = useCRMStore((s) => s.fetchCompanies);
  const leads = useCRMStore((s) => s.leads);
  const companies = useCRMStore((s) => s.companies);

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<'check' | 'about' | 'closed'>('check');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [forecastFilter, setForecastFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
    fetchCompanies();
  }, [fetchLeads, fetchCompanies]);

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDrawer(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete "${lead.name}"?`)) {
      const deleteLead = useCRMStore.getState().deleteLead;
      deleteLead(lead.id);
    }
  };

  const filtered = leads.filter((l: Lead) => {
    // Search
    const companyName = typeof l.company === 'string' ? l.company : l.company?.name || '';
    const matchesSearch = l.name?.toLowerCase().includes(q.toLowerCase()) ||
      companyName.toLowerCase().includes(q.toLowerCase());

    // Filter
    let matchesFilter = true;
    const leadStatus = l.lead_status || l.status;
    if (filter === 'about') {
      matchesFilter = ['Cold', 'Warm', 'Hot'].includes(leadStatus);
    } else if (filter === 'closed') {
      matchesFilter = ['Won', 'Lost'].includes(leadStatus);
    }
    // 'check' shows all open leads (not Won/Lost)

    // Status filter
    const matchesStatus = statusFilter === 'all' || leadStatus === statusFilter;

    // Forecast filter
    const matchesForecast = forecastFilter === 'all' || l.forecast === forecastFilter;

    // Company filter
    const matchesCompany = companyFilter === 'all' || companyName === companyFilter;

    return matchesSearch && matchesFilter && matchesStatus && matchesForecast && matchesCompany;
  });

  // Stats calculations
  const totalLeads = leads.length;
  const openLeads = leads.filter(l => {
    const status = l.lead_status || l.status;
    return !['Won', 'Lost'].includes(status);
  }).length;
  const wonLeads = leads.filter(l => (l.lead_status || l.status) === 'Won').length;
  const lostLeads = leads.filter(l => (l.lead_status || l.status) === 'Lost').length;
  const hotLeads = leads.filter(l => (l.lead_status || l.status) === 'Hot').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
                <p className="text-slate-600 mt-1">Track and nurture your sales pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search leads or companies..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 w-80 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" onClick={() => router.push('/import')} className="border-slate-300 hover:bg-slate-50">
                Import Lead
              </Button>
              <Button onClick={() => { setEditingLead(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Leads</p>
                    <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Open Leads</p>
                    <p className="text-2xl font-bold text-slate-900">{openLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Target className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Hot Leads</p>
                    <p className="text-2xl font-bold text-slate-900">{hotLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Won</p>
                    <p className="text-2xl font-bold text-slate-900">{wonLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Lost</p>
                    <p className="text-2xl font-bold text-slate-900">{lostLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Filters & Views</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Pipeline Stage:</span>
                <div className="flex gap-2">
                  <Badge
                    variant={filter === 'check' ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setFilter('check')}
                  >
                    Active
                  </Badge>
                  <Badge
                    variant={filter === 'about' ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setFilter('about')}
                  >
                    Nurturing
                  </Badge>
                  <Badge
                    variant={filter === 'closed' ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setFilter('closed')}
                  >
                    Closed
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-300">
                    <SelectValue placeholder="Lead Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Warm">Warm</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={forecastFilter} onValueChange={setForecastFilter}>
                  <SelectTrigger className="w-40 border-slate-300">
                    <SelectValue placeholder="Forecast" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forecast</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-48 border-slate-300">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Toggle */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100">
                <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Grid3X3 className="h-4 w-4" />
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Kanban className="h-4 w-4" />
                  Pipeline View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => openDetail(lead)} onDelete={handleDelete} />
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No leads found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="kanban" className="mt-6">
                <LeadKanban leads={filtered} onOpen={(lead) => openDetail(lead)} onDelete={handleDelete} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AddLeadModal open={showModal} onClose={() => { setShowModal(false); setEditingLead(null); }} leadToEdit={editingLead} />
        <LeadDetailDrawer lead={selectedLead} open={showDrawer} onClose={() => setShowDrawer(false)} onEdit={(l) => { setEditingLead(l); setShowModal(true); setShowDrawer(false); }} />
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useCRMStore } from "@/lib/store";
import LeadDetailDrawer from "@/components/leads/LeadDetailDrawer";
import LeadKanban from "@/components/leads/LeadKanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead } from "@/types";

export default function LeadPipelinePage() {
  const fetchLeads = useCRMStore((s) => s.fetchLeads);
  const fetchCompanies = useCRMStore((s) => s.fetchCompanies);
  const leads = useCRMStore((s) => s.leads);
  const companies = useCRMStore((s) => s.companies);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
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

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete "${lead.title}"?`)) {
      const deleteLead = useCRMStore.getState().deleteLead;
      deleteLead(lead.id);
    }
  };

  const filtered = leads.filter((l: Lead) => {
    // Search
    const companyName = typeof l.company === 'string' ? l.company : l.company?.name || '';
    const matchesSearch = l.title?.toLowerCase().includes(q.toLowerCase()) ||
      companyName.toLowerCase().includes(q.toLowerCase());

    // Filter
    let matchesFilter = true;
    if (filter === 'about') {
      matchesFilter = ['Cold', 'Warm', 'Hot'].includes(l.status || '');
    } else if (filter === 'closed') {
      matchesFilter = ['Won', 'Lost'].includes(l.status || '');
    }
    // 'check' shows all open leads (not Won/Lost)

    // Status filter
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    // Forecast filter
    const matchesForecast = forecastFilter === 'all' || l.forecast === forecastFilter;

    // Company filter
    const matchesCompany = companyFilter === 'all' || companyName === companyFilter;

    return matchesSearch && matchesFilter && matchesStatus && matchesForecast && matchesCompany;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop leads through the pipeline stages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Badge variant={filter === 'check' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('check')}>
            Check
          </Badge>
          <Badge variant={filter === 'about' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('about')}>
            About
          </Badge>
          <Badge variant={filter === 'closed' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('closed')}>
            Closed
          </Badge>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
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
          <SelectTrigger className="w-32">
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
          <SelectTrigger className="w-32">
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

      {/* Pipeline Kanban View */}
      <LeadKanban leads={filtered} onOpen={(lead) => openDetail(lead)} onDelete={handleDelete} />

      <LeadDetailDrawer lead={selectedLead} open={showDrawer} onClose={() => setShowDrawer(false)} onEdit={() => {}} />
    </div>
  );
}

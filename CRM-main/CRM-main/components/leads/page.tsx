"use client";

import { useEffect, useState } from "react";
import { useCRMStore } from "@/lib/store";
import LeadFormModal from "@/components/leads/LeadFormModal";
import LeadKanban from "@/components/leads/LeadKanban";
import LeadDetailDrawer from "@/components/leads/LeadDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LeadsPage() {
  const fetchLeads = useCRMStore((s) => s.fetchLeads);
  const leads = useCRMStore((s) => s.leads);

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openDetail = (lead: any) => {
    setSelectedLead(lead);
    setShowDrawer(true);
  };

  const openEdit = (lead: any) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const filtered = leads.filter((l: any) =>
    l.title?.toLowerCase().includes(q.toLowerCase()) ||
    l.company?.name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage your leads pipeline</p>
        </div>

        <div className="flex items-center gap-3">
          <Input placeholder="Search leads or companies..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
          <Button onClick={() => { setEditingLead(null); setShowModal(true); }}>
            + Add Lead
          </Button>
        </div>
      </div>

      <LeadKanban leads={filtered} onOpen={(l) => openDetail(l)} />

      <LeadFormModal open={showModal} onClose={() => { setShowModal(false); setEditingLead(null);} } leadToEdit={editingLead} />
      <LeadDetailDrawer lead={selectedLead} open={showDrawer} onClose={() => setShowDrawer(false)} onEdit={(l) => { setEditingLead(l); setShowModal(true); setShowDrawer(false); }} />
    </div>
  );
}

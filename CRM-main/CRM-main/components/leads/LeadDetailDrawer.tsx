"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCRMStore } from "@/lib/store";
import type { Lead } from "@/types";

export default function LeadDetailDrawer({
  lead,
  open,
  onClose,
  onEdit,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}) {
  const deleteLead = useCRMStore((s) => s.deleteLead);

  if (!lead) return null;

  const stages = ['Cold', 'Warm', 'Hot', 'Won'];
  const currentIndex = stages.indexOf(lead.status || '');

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead(lead.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {lead.title}
            <Badge variant="outline">{lead.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Name:</strong> {lead.name}</div>
              <div><strong>Email:</strong> {lead.email || '-'}</div>
              <div><strong>Phone:</strong> {lead.phone || '-'}</div>
              <div><strong>Company:</strong> {typeof lead.company === 'string' ? lead.company : lead.company?.name || '-'}</div>
              <div><strong>Position:</strong> {lead.position || '-'}</div>
              <div><strong>Value:</strong> {lead.value ? `₹${Number(lead.value).toLocaleString()}` : '-'}</div>
              <div><strong>Priority:</strong> <Badge>{lead.priority}</Badge></div>
              <div><strong>Status:</strong> <Badge>{lead.status}</Badge></div>
              <div><strong>Forecast:</strong> {lead.forecast || '-'}</div>
              <div><strong>Source:</strong> {lead.source || '-'}</div>
              <div><strong>Created:</strong> {new Date(lead.created_at).toLocaleDateString()}</div>
              <div><strong>Updated:</strong> {new Date(lead.updated_at).toLocaleDateString()}</div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">{lead.notes || 'No notes'}</div>
            </CardContent>
          </Card>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(lead)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

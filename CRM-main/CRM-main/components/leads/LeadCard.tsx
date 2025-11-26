"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Trash2 } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDelete?: (lead: Lead) => void;
  isDragging?: boolean;
}

export default function LeadCard({ lead, onClick, onDelete, isDragging = false }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determine stages based on lead status
  const leadStatus = lead.lead_status || lead.status || 'new';
  const isLost = leadStatus === 'Lost';
  const stages = isLost ? ['Cold', 'Warm', 'Hot', 'Lost'] : ['Cold', 'Warm', 'Hot', 'Won'];
  const currentIndex = stages.indexOf(leadStatus);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-lg transition-shadow relative ${
        sortableIsDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <Edit className="h-4 w-4 text-muted-foreground" />
        {onDelete && (
          <Trash2
            className="h-4 w-4 text-muted-foreground hover:text-red-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead);
            }}
          />
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{lead.title || lead.name}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{leadStatus}</Badge>
            <Badge variant="secondary">{lead.forecast || 'Not Set'}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company + Contact Info */}
        <div className="space-y-2">
          <div>
            <div className="font-medium">
              {typeof lead.company === 'string' ? lead.company : (lead.company?.name || 'No Company')}
            </div>
            {typeof lead.company === 'object' && lead.company?.website && (
              <a href={lead.company.website} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">
                {lead.company.website}
              </a>
            )}
            {lead.website && (
              <a href={lead.website} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">
                {lead.website}
              </a>
            )}
            {lead.email && (
              <div className="text-sm text-muted-foreground">{lead.email}</div>
            )}
            {lead.phone && (
              <div className="text-sm text-muted-foreground">{lead.phone}</div>
            )}
            {lead.position && (
              <div className="text-sm text-muted-foreground">{lead.position}</div>
            )}
          </div>
        </div>

        {/* Lead Details */}
        <div className="space-y-2">
          {lead.value && (
            <div className="text-sm">
              <span className="font-medium">Value:</span> ₹{lead.value.toLocaleString()}
            </div>
          )}
          {lead.priority && (
            <Badge variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'default' : 'secondary'}>
              {lead.priority} priority
            </Badge>
          )}
          {lead.source && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Source:</span> {lead.source}
            </div>
          )}
          {lead.industry && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Industry:</span> {lead.industry}
            </div>
          )}
        </div>

        {/* Pipeline Timeline */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Pipeline</div>
          <div className="flex items-center space-x-2">
            {stages.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index <= currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
                {index < stages.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${
                      index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {stages.map((stage) => (
              <span key={stage}>{stage}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            <span className="font-medium">Notes:</span> {lead.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";
import type { Lead } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCRMStore } from "@/lib/store";
import LeadCard from "./LeadCard";

function DroppableColumn({ id, children, title, count }: { id: string; children: React.ReactNode; title: string; count: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="min-h-[250px]">
      <h4 className="text-sm font-semibold mb-2 bg-muted p-2 rounded">
        {title} ({count})
      </h4>
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] p-2 border rounded bg-background transition-colors ${
          isOver ? 'border-primary bg-primary/5' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function LeadKanban({
  leads = [],
  onOpen,
  onDelete,
}: {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}) {
  const updateLead = useCRMStore((s) => s.updateLead);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const columns = useMemo(() => ([
    { key: "Cold", title: "Cold" },
    { key: "Warm", title: "Warm" },
    { key: "Hot", title: "Hot" },
    { key: "Won", title: "Won" },
    { key: "Lost", title: "Lost" },
  ]), []);

  const grouped = columns.reduce((acc, col) => {
    acc[col.key] = leads.filter(l => l.status === col.key);
    return acc;
  }, {} as Record<string, Lead[]>);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    setActiveLead(lead || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      // Moving to different column
      const activeLead = leads.find((l) => l.id === activeId);
      if (activeLead) {
        updateLead(activeId, { status: overContainer as Lead['status'] });
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
  }

  function findContainer(id: string) {
    if (columns.some((col) => col.key === id)) {
      return id;
    }

    const lead = leads.find((l) => l.id === id);
    return lead ? lead.status : null;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(col => (
          <DroppableColumn
            key={col.key}
            id={col.key}
            title={col.title}
            count={grouped[col.key]?.length || 0}
          >
            <SortableContext
              items={grouped[col.key]?.map(l => l.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {(grouped[col.key] || []).map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => onOpen(lead)}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeLead ? (
          <Card className="p-3 shadow-lg bg-background border-2 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{activeLead.name}</div>
                <div className="text-xs text-muted-foreground">{typeof activeLead.company === 'string' ? activeLead.company : activeLead.company?.name || ""}</div>
                <div className="text-xs text-muted-foreground mt-1">{activeLead.forecast || ""}</div>
              </div>
              <div className="text-sm font-semibold">{activeLead.value ? `₹${Number(activeLead.value).toLocaleString()}` : ""}</div>
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

'use client';

import { Opportunity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign } from 'lucide-react';
import { useCRMStore } from '@/lib/store';

const stages = [
  { key: 'lead', label: 'Lead', color: 'bg-slate-100' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
  { key: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { key: 'won', label: 'Won', color: 'bg-green-100' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100' },
];

export function OpportunityKanban({ opportunities }: { opportunities: Opportunity[] }) {
  const updateOpportunity = useCRMStore((state) => state.updateOpportunity);

  const handleDragStart = (e: React.DragEvent, opportunity: Opportunity) => {
    e.dataTransfer.setData('opportunityId', opportunity.id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const opportunityId = e.dataTransfer.getData('opportunityId');
    await updateOpportunity(opportunityId, { status: status as any });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] lg:min-w-0">
        {/* Desktop Grid - 6 columns */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageOpportunities = opportunities.filter((opp) => opp.status === stage.key);
            const totalValue = stageOpportunities.reduce((sum, opp) => sum + Number(opp.amount), 0);

            return (
              <div
                key={stage.key}
                className="space-y-3"
                onDrop={(e) => handleDrop(e, stage.key)}
                onDragOver={handleDragOver}
              >
                <div className={`rounded-lg p-3 ${stage.color}`}>
                  <h3 className="font-semibold">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stageOpportunities.length} • ${totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  {stageOpportunities.map((opportunity) => (
                    <Card
                      key={opportunity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opportunity)}
                      className="cursor-move hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-medium">{opportunity.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        {opportunity.company && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {opportunity.company.name}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <DollarSign className="h-3 w-3" />
                            {Number(opportunity.amount).toLocaleString()}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.probability}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet - Single column scrollable */}
        <div className="lg:hidden space-y-6">
          {stages.map((stage) => {
            const stageOpportunities = opportunities.filter((opp) => opp.status === stage.key);
            const totalValue = stageOpportunities.reduce((sum, opp) => sum + Number(opp.amount), 0);

            return (
              <div key={stage.key} className="space-y-3">
                <div className={`rounded-lg p-4 ${stage.color} sticky top-0 z-10`}>
                  <h3 className="font-semibold text-base">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stageOpportunities.length} opportunities • ${totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3 px-2">
                  {stageOpportunities.map((opportunity) => (
                    <Card
                      key={opportunity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opportunity)}
                      className="cursor-move hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium leading-tight pr-2">{opportunity.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {opportunity.probability}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        {opportunity.company && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate">{opportunity.company.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>${Number(opportunity.amount).toLocaleString()}</span>
                          </div>
                          <Badge 
                            className={`${stage.color} text-xs`}
                            variant="outline"
                          >
                            {stage.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadCard } from "./lead-card";
import { LEAD_STAGES, STAGE_COLORS, STAGE_BG_COLORS } from "@/lib/mock-leads";
import { CurrencyDisplay } from "@/components/common/currency-display";
import type { LeadCardData, LeadStage } from "@/lib/types";

interface PipelineBoardProps {
  stages: Record<LeadStage, LeadCardData[]>;
  stageValues?: Record<string, number>;
  onMoveCard: (leadId: string, fromStage: string, toStage: string) => void;
  onCardClick: (leadId: string) => void;
  loading?: boolean;
}

function SortableLeadCard({
  lead,
  onClick,
}: {
  lead: LeadCardData;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id, data: { stage: lead.stage } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

export function PipelineBoard({
  stages,
  stageValues,
  onMoveCard,
  onCardClick,
  loading,
}: PipelineBoardProps) {
  const t = useTranslations("leads");
  const locale = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeStage = (active.data.current as { stage?: string })?.stage;
      // "over" could be either a card or a column droppable
      let overStage: string | undefined;

      // Check if dropped over a column container
      if (LEAD_STAGES.includes(over.id as LeadStage)) {
        overStage = over.id as string;
      } else {
        // Dropped on another card – find which stage that card belongs to
        for (const [stage, leads] of Object.entries(stages)) {
          if (leads.some((l) => l.id === over.id)) {
            overStage = stage;
            break;
          }
        }
      }

      if (activeStage && overStage && activeStage !== overStage) {
        onMoveCard(active.id as string, activeStage, overStage);
      }
    },
    [onMoveCard, stages]
  );

  // Find the actively dragged lead
  const activeLead = activeId
    ? Object.values(stages)
        .flat()
        .find((l) => l.id === activeId)
    : null;

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-3">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={stages[stage] || []}
            totalValue={stageValues?.[stage]}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-[264px]">
            <LeadCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  leads,
  totalValue,
  onCardClick,
}: {
  stage: LeadStage;
  leads: LeadCardData[];
  totalValue?: number;
  onCardClick: (id: string) => void;
}) {
  const t = useTranslations("leads");
  const { setNodeRef } = useSortable({
    id: stage,
    data: { type: "column", stage },
    disabled: true,
  });

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] shrink-0 flex flex-col rounded-lg border bg-muted/30"
    >
      {/* Column header */}
      <div className={cn("px-3 py-2 rounded-t-lg border-b", STAGE_BG_COLORS[stage])}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_COLORS[stage])} />
            <span className="text-sm font-semibold">{t(`stages.${stage}`)}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {leads.length}
            </Badge>
          </div>
        </div>
        {totalValue !== undefined && totalValue > 0 && (
          <div className="text-xs text-muted-foreground mt-0.5">
            <CurrencyDisplay amount={totalValue} compact className="text-xs" />
          </div>
        )}
      </div>

      {/* Cards */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="flex-1 max-h-[calc(100vh-320px)]">
          <div className="p-2 space-y-2">
            {leads.map((lead) => (
              <SortableLeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onCardClick(lead.id)}
              />
            ))}
            {leads.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {t("emptyStage")}
              </div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
}

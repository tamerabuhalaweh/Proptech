"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationTable } from "@/components/communications/communication-table";
import { CommunicationFilters } from "@/components/communications/communication-filters";
import { NewCommunicationDialog } from "@/components/communications/new-communication-dialog";
import { CommunicationDetail } from "@/components/communications/communication-detail";
import { useCommunications } from "@/hooks/api/use-communications";
import { mockCommunications } from "@/lib/mock-communications";
import type { Communication } from "@/lib/types";

export default function CommunicationsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedCommId, setSelectedCommId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Build query params based on tab + filters
  const queryType = tab !== "all" ? [tab] : typeFilter !== "all" ? [typeFilter] : undefined;

  const { data, isLoading } = useCommunications({
    type: queryType,
    direction: directionFilter !== "all" ? directionFilter : undefined,
    status: statusFilter !== "all" ? [statusFilter] : undefined,
    search: search || undefined,
  });

  const communications = (data?.data || mockCommunications) as Communication[];

  const handleRowClick = useCallback((id: string) => {
    setSelectedCommId(id);
    setDetailOpen(true);
  }, []);

  const handleCreateCommunication = useCallback((formData: Record<string, unknown>) => {
    console.log("Create communication:", formData);
  }, []);

  const tabs = [
    { value: "all", label: isAr ? "الكل" : "All" },
    { value: "email", label: isAr ? "📧 بريد" : "📧 Email" },
    { value: "sms", label: isAr ? "💬 رسائل" : "💬 SMS" },
    { value: "whatsapp", label: isAr ? "📱 واتساب" : "📱 WhatsApp" },
    { value: "call", label: isAr ? "📞 مكالمات" : "📞 Calls" },
    { value: "note", label: isAr ? "📝 ملاحظات" : "📝 Notes" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? "مركز الاتصالات" : "Communications Center"}
        subtitle={
          isAr
            ? `${communications.length} اتصال`
            : `${communications.length} communications`
        }
        actions={
          <Button onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {isAr ? "اتصال جديد" : "New Communication"}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Filters (below tabs) */}
        <div className="mt-4">
          <CommunicationFilters
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            directionFilter={directionFilter}
            onDirectionFilterChange={setDirectionFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Table content — same for all tabs since filtering is query-based */}
        <div className="mt-4">
          <CommunicationTable
            communications={communications}
            loading={isLoading}
            onRowClick={handleRowClick}
          />
        </div>
      </Tabs>

      <NewCommunicationDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onSubmit={handleCreateCommunication}
      />

      <CommunicationDetail
        communicationId={selectedCommId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

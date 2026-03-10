"use client";

import * as React from "react";

export function useUnitSelection() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const isSelected = React.useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const rangeSelect = React.useCallback(
    (startId: string, endId: string, allIds: string[]) => {
      const startIndex = allIds.indexOf(startId);
      const endIndex = allIds.indexOf(endId);
      if (startIndex === -1 || endIndex === -1) return;

      const from = Math.min(startIndex, endIndex);
      const to = Math.max(startIndex, endIndex);
      const range = allIds.slice(from, to + 1);

      setSelectedIds((prev) => {
        const set = new Set(prev);
        range.forEach((id) => set.add(id));
        return Array.from(set);
      });
    },
    []
  );

  const selectAll = React.useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    isSelected,
    toggleSelect,
    rangeSelect,
    selectAll,
    clearSelection,
    selectedCount: selectedIds.length,
  };
}

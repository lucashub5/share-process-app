import { useState, useRef } from "react";
import { Process, ProcessEditorHandle } from "../../types/types";

export function useTabs() {
  const [openProcess, setOpenProcess] = useState<Process | null>(null);
  const [openTabs, setOpenTabs] = useState<Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const editorRefs = useRef<Record<string, ProcessEditorHandle | null>>({});

  const isEditing = (id: string) => editingStates[id] || false;
  const setIsEditing = (id: string, value: boolean) => {
    setEditingStates((prev) => ({ ...prev, [id]: value }));
  };

  const openTab = (process: Process) => {
    setOpenProcess(process);
    setSelectedProcess(process);
    setOpenTabs((prev) => {
      if (!prev.find((p) => p.id === process.id)) {
        return [...prev, process];
      }
      return prev;
    });
  };

  const closeTab = (id: string) => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((p) => p.id !== id);

      if (openProcess?.id === id) {
        if (newTabs.length > 0) {
          const closedIndex = prev.findIndex((p) => p.id === id);
          const newIndex = closedIndex > 0 ? closedIndex - 1 : 0;
          setOpenProcess(newTabs[newIndex]);
          setSelectedProcess(newTabs[newIndex]);
        } else {
          setOpenProcess(null);
          setSelectedProcess(null);
        }
      }

      return newTabs;
    });

    setEditingStates((prev) => {
      const rest = Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== id)
      );
      return rest;
    });

    const refs = editorRefs.current;
    delete refs[id];
  };

  return {
    openProcess,
    setOpenProcess,
    openTabs,
    setOpenTabs,
    selectedProcess,
    setSelectedProcess,
    isEditing,
    setIsEditing,
    editorRefs,
    openTab,
    closeTab,
  };
}
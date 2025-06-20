import { useCallback } from "react";
import { Process, ProcessEditorHandle } from "../types";

type UseEditingManagerParams = {
    editorRefs: React.RefObject<Record<string, ProcessEditorHandle | null>>;
    setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
    setOpenTabs: React.Dispatch<React.SetStateAction<Process[]>>;
    setOpenProcess: React.Dispatch<React.SetStateAction<Process | null>>;
    setSelectedProcess: React.Dispatch<React.SetStateAction<Process | null>>;
    setIsEditing: (id: string, value: boolean) => void;
    updateProcessContent: (
        tab: Process,
        content: string,
        clientId: string | null
    ) => Promise<Process>;
    selectedClientId: string | null;
};

export function useEditingManager({
  editorRefs,
  setProcesses,
  setOpenTabs,
  setOpenProcess,
  setSelectedProcess,
  setIsEditing,
  updateProcessContent,
  selectedClientId,
}: UseEditingManagerParams) {
  const saveAndExit = useCallback(
        async (tab: Process) => {
            const editor = editorRefs.current[tab.id];
            const content = editor?.getContent?.() ?? "";
            const updated = { ...tab, content };

            setProcesses((prev) => prev.map((p) => (p.id === tab.id ? updated : p)));
            setOpenTabs((prev) => prev.map((p) => (p.id === tab.id ? updated : p)));
            setOpenProcess((prev) => (prev?.id === tab.id ? updated : prev));
            setSelectedProcess((prev) => (prev?.id === tab.id ? updated : prev));
            setIsEditing(tab.id, false);

            try {
                const savedProcess = await updateProcessContent(tab, content, selectedClientId);
                setProcesses((prev) =>
                prev.map((p) => (p.id === savedProcess.id ? savedProcess : p))
                );
                setOpenTabs((prev) =>
                prev.map((p) => (p.id === savedProcess.id ? savedProcess : p))
                );
                setOpenProcess((prev) => (prev?.id === savedProcess.id ? savedProcess : prev));
                setSelectedProcess((prev) =>
                prev?.id === savedProcess.id ? savedProcess : prev
                );
            } catch {
                alert("Error guardando proceso");
            }
        },
        [
        editorRefs,
        setProcesses,
        setOpenTabs,
        setOpenProcess,
        setSelectedProcess,
        setIsEditing,
        updateProcessContent,
        selectedClientId,
        ]
  );

  const cancelEdit = useCallback(
        (tab: Process) => {
            setIsEditing(tab.id, false);
        },
        [setIsEditing]
  );

  return { saveAndExit, cancelEdit };
}
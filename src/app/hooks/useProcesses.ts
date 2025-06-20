import { useState, useEffect } from "react";
import { Process } from "../types";

export function useProcesses(clientId: string | null) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchProcesses(clientId);
    } else {
      setProcesses([]);
    }
  }, [clientId]);

  const fetchProcesses = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/processes?clientId=${clientId}`);
      const data: Process[] = await response.json();
      setProcesses(data);
    } catch (error) {
      console.error("Error fetching processes:", error);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProcessContent = async (
    tab: Process,
    content: string,
    selectedClientId: string | null
  ) => {
    if (!selectedClientId) throw new Error("No client selected");

    try {
      const response = await fetch(`/api/processes/${tab.id}?clientId=${selectedClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Error saving process");
      }

      const savedProcess = await response.json();

      setProcesses((prev) =>
        prev.map((p) => (p.id === savedProcess.id ? savedProcess : p))
      );

      return savedProcess;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    processes,
    setProcesses,
    loading,
    updateProcessContent,
  };
}
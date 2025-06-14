import { useState, useEffect } from "react";

type Client = {
  id: string;
  name: string;
};

export function useClients(status: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClients();
    }
  }, [status]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await fetch("/api/clients");
      const data: Client[] = await response.json();
      setClients(data);
      if (data.length > 0) setSelectedClientId(data[0].id);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const createClient = async (name: string) => {
    if (!name.trim()) {
      throw new Error("Nombre inválido");
    }
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error creando cliente");
      }

      const newClient: Client = await response.json();
      setClients((prev) => [...prev, newClient]);
      setSelectedClientId(newClient.id);
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw error;
    }
  };

  return {
    clients,
    selectedClientId,
    setSelectedClientId,
    loadingClients,
    createClient,
  };
}
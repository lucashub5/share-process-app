import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Client } from "@/types/types";

export function useClients() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClients();
    }
  }, [status]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      
      if (!response.ok) {
        throw new Error("Error al obtener clientes");
      }
      
      const data: Client[] = await response.json();
      setClients(data);
      if (data.length > 0) setSelectedClient(data[0]);
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
    
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
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
      setSelectedClient(newClient);
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw error;
    }
  };

  const getClientPermissions = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !session?.user?.id) {
      return { canEdit: false, canDelete: false, canCreate: false };
    }

    // Si es el creador, tiene todos los permisos
    if (client.creatorId === session.user.id) {
      return { canEdit: true, canDelete: true, canCreate: true };
    }

    // Si no, buscar en los accesos específicos
    const access = client.accesses.find(a => a.userId === session.user.id);
    return access || { canEdit: false, canDelete: false, canCreate: false };
  };

  const canEditClient = (clientId: string) => {
    return getClientPermissions(clientId).canEdit;
  };

  const canDeleteClient = (clientId: string) => {
    return getClientPermissions(clientId).canDelete;
  };

  const canCreateInClient = (clientId: string) => {
    return getClientPermissions(clientId).canCreate;
  };

  return {
    clients,
    selectedClient,
    setSelectedClient,
    loadingClients,
    createClient,
    getClientPermissions,
    canEditClient,
    canDeleteClient,
    canCreateInClient,
  };
}
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Client, Access, Permission } from "@/types/types";

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
      return newClient;
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw error;
    }
  };

  const updatePermission = async (accessId: string, scope: Permission['scope'], action: Permission['action'], allowed: boolean) => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId, scope, action, allowed }),
      });

      if (!response.ok) {
        throw new Error("Error actualizando permiso");
      }

      // Actualizar el estado local
      setClients(prev => prev.map(client => {
        if (client.id === selectedClient.id) {
          return {
            ...client,
            accesses: client.accesses.map(access => {
              if (access.userId === accessId) {
                return {
                  ...access,
                  permissions: access.permissions.map(permission => {
                    if (permission.scope === scope && permission.action === action) {
                      return { ...permission, allowed };
                    }
                    return permission;
                  })
                };
              }
              return access;
            })
          };
        }
        return client;
      }));

      // Actualizar selectedClient también
      if (selectedClient.id === selectedClient.id) {
        setSelectedClient(prev => prev ? {
          ...prev,
          accesses: prev.accesses.map(access => {
            if (access.userId === accessId) {
              return {
                ...access,
                permissions: access.permissions.map(permission => {
                  if (permission.scope === scope && permission.action === action) {
                    return { ...permission, allowed };
                  }
                  return permission;
                })
              };
            }
            return access;
          })
        } : null);
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      throw error;
    }
  };

  const updateAccessState = async (accessId: string, newState: Access['state']) => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}/access-state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId, state: newState }),
      });

      if (!response.ok) {
        throw new Error("Error actualizando estado de acceso");
      }

      // Actualizar el estado local
      setClients(prev => prev.map(client => {
        if (client.id === selectedClient.id) {
          return {
            ...client,
            accesses: client.accesses.map(access => {
              if (access.userId === accessId) {
                return {
                  ...access,
                  state: newState,
                  joinedAt: newState === 'accepted' ? new Date().toISOString() : access.joinedAt
                };
              }
              return access;
            })
          };
        }
        return client;
      }));

      // Actualizar selectedClient también
      if (selectedClient.id === selectedClient.id) {
        setSelectedClient(prev => prev ? {
          ...prev,
          accesses: prev.accesses.map(access => {
            if (access.userId === accessId) {
              return {
                ...access,
                state: newState,
                joinedAt: newState === 'accepted' ? new Date().toISOString() : access.joinedAt
              };
            }
            return access;
          })
        } : null);
      }
    } catch (error) {
      console.error("Error updating access state:", error);
      throw error;
    }
  };

  const getUserAccess = (clientId: string): Access | null => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !session?.user?.id) return null;

    return client.accesses.find(a => a.userId === session.user.id) || null;
  };

  const hasPermission = (clientId: string, scope: Permission['scope'], action: Permission['action']): boolean => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !session?.user?.id) return false;

    // Si es el creador, tiene todos los permisos
    if (client.creatorId === session.user.id) return true;

    // Buscar el acceso del usuario
    const access = client.accesses.find(a => a.userId === session.user.id);
    if (!access || access.state !== 'accepted') return false;

    // Buscar el permiso específico
    const permission = access.permissions.find(p => p.scope === scope && p.action === action);
    return permission?.allowed || false;
  };

  const canEditClient = (clientId: string): boolean => {
    return hasPermission(clientId, 'users', 'edit');
  };

  const canDeleteClient = (clientId: string): boolean => {
    return hasPermission(clientId, 'users', 'delete');
  };

  const canCreateInClient = (clientId: string): boolean => {
    return hasPermission(clientId, 'processes', 'create');
  };

  const canInviteUsers = (clientId: string): boolean => {
    return hasPermission(clientId, 'users', 'invite');
  };

  const canRemoveUsers = (clientId: string): boolean => {
    return hasPermission(clientId, 'users', 'remove');
  };

  const canGrantPermissions = (clientId: string): boolean => {
    return hasPermission(clientId, 'users', 'grant');
  };

  const canEditDocuments = (clientId: string): boolean => {
    return hasPermission(clientId, 'documents', 'edit');
  };

  const canDeleteDocuments = (clientId: string): boolean => {
    return hasPermission(clientId, 'documents', 'delete');
  };

  const canCreateDocuments = (clientId: string): boolean => {
    return hasPermission(clientId, 'documents', 'create');
  };

  const canEditProcesses = (clientId: string): boolean => {
    return hasPermission(clientId, 'processes', 'edit');
  };

  const canDeleteProcesses = (clientId: string): boolean => {
    return hasPermission(clientId, 'processes', 'delete');
  };

  const isClientCreator = (clientId: string): boolean => {
    const client = clients.find(c => c.id === clientId);
    return client?.creatorId === session?.user?.id;
  };

  const getClientStats = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const totalAccesses = client.accesses.length;
    const acceptedAccesses = client.accesses.filter(a => a.state === 'accepted').length;
    const pendingAccesses = client.accesses.filter(a => a.state === 'pending').length;
    const rejectedAccesses = client.accesses.filter(a => a.state === 'rejected').length;

    return {
      totalAccesses,
      acceptedAccesses,
      pendingAccesses,
      rejectedAccesses,
      isCreator: isClientCreator(clientId)
    };
  };

  return {
    // Estado
    clients,
    selectedClient,
    setSelectedClient,
    loadingClients,
    
    // Acciones básicas
    createClient,
    updatePermission,
    updateAccessState,
    
    // Consultas de acceso
    getUserAccess,
    hasPermission,
    isClientCreator,
    getClientStats,
    
    // Helpers de permisos específicos
    canEditClient,
    canDeleteClient,
    canCreateInClient,
    canInviteUsers,
    canRemoveUsers,
    canGrantPermissions,
    canEditDocuments,
    canDeleteDocuments,
    canCreateDocuments,
    canEditProcesses,
    canDeleteProcesses,
  };
}
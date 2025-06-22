import { useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Settings,
  X,
} from "lucide-react";
import { Client } from "@/types/types";

interface Props {
  clients: Client[];
  loading: boolean;
  selectedClientId: string | null;
  onSelect: React.Dispatch<React.SetStateAction<Client | null>>
  onCreate: (name: string) => void;
}

export default function ClientSelector({
  clients,
  loading,
  selectedClientId,
  onSelect,
  onCreate,
}: Props) {
  const [configOpenId, setConfigOpenId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const [emails, setEmails] = useState<string[]>(selectedClient?.emailAccess ?? []);

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    if (emails.includes(newEmail.trim())) return;
    setEmails([...emails, newEmail.trim()]);
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleCreateClick = () => {
    const name = prompt("Ingrese el nombre del cliente:");
    if (name) onCreate(name);
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setConfigOpenId(null);
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto w-full">
        {/* Botón crear cliente */}
        <div className="mb-6">
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            type="button"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Cliente
          </button>
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Clientes</h3>
            <p className="text-sm text-gray-600 mt-1">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} disponible{clients.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No hay clientes disponibles</p>
                <p className="text-sm">Crea tu primer cliente para comenzar</p>
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    client.id === selectedClientId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="cursor-pointer"
                        onClick={() => onSelect(client)}
                      >
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {client.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.emailAccess?.length || 0} email{(client.emailAccess?.length || 0) !== 1 ? 's' : ''} asociado{(client.emailAccess?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {client.id === selectedClientId && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Seleccionado
                        </span>
                      )}
                      
                      <div
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {configOpenId === client.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setConfigOpenId(null)}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar cliente "${client.name}"?`)) {
                                  setConfigOpenId(null);
                                  // Aquí iría la lógica de eliminación
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfigOpenId(client.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Configuración"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandir detalles del cliente seleccionado */}
                  {client.id === selectedClientId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-800">Accesos por email</h5>
                        
                        {emails.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">Sin emails asociados.</p>
                        ) : (
                          <div className="space-y-2">
                            {emails.map((email) => (
                              <div
                                key={email}
                                className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg"
                              >
                                <span className="truncate">{email}</span>
                                <button
                                  className="text-gray-400 hover:text-red-500 ml-2"
                                  onClick={() => handleRemoveEmail(email)}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddEmail();
                              }
                            }}
                            placeholder="Agregar email..."
                            className="flex-1 text-sm border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleAddEmail}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="Agregar email"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
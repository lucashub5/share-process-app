import { useState, useRef } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Settings,
  X,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  emailAccess?: string[]; // suponemos esto por ahora
}

interface Props {
  clients: Client[];
  loading: boolean;
  selectedClientId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [configOpenId, setConfigOpenId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <div className="relative flex flex-col items-center justify-center whitespace-nowrap mx-1">
      <span>{selectedClient ? selectedClient.name : "Sin cliente"}</span>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="text-blue-600 text-xs font-medium flex items-center gap-0.5 hover:underline"
        title="Gestión cliente"
        type="button"
      >
        Gestión cliente
        {isSidebarOpen ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {isSidebarOpen && (
        <div className="absolute top-[120%] right-5 w-80 bg-white shadow-lg border border-gray-200 rounded-md p-4 flex flex-col z-50">
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 z-[-1]" />

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Gestión de Clientes</h2>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition mb-4"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Crear Cliente
          </button>

          {/* Custom Select */}
          <div className="relative mb-3">
            {!isDropdownOpen ? (
              <div
                className="flex justify-between items-center px-2 py-1 rounded-md bg-blue-50 border border-blue-200 cursor-pointer"
                onClick={() => setIsDropdownOpen(true)}
                onMouseEnter={handleMouseEnter}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm text-gray-800">{selectedClient?.name}</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                  onMouseLeave={handleMouseLeave}
                >
                  {configOpenId === selectedClient?.id ? (
                    <>
                      <button
                        onClick={() => {
                          if (selectedClient) onEdit(selectedClient);
                          setConfigOpenId(null);
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            selectedClient &&
                            confirm(`¿Eliminar cliente "${selectedClient.name}"?`)
                          ) {
                            onDelete(selectedClient.id);
                            setConfigOpenId(null);
                          }
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedClient) setConfigOpenId(selectedClient.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Configuración"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm cursor-pointer flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="truncate">{selectedClient?.name || "Seleccionar cliente..."}</span>
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </div>
                <div className="absolute mt-1 left-0 right-0 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow z-10">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        onSelect(client.id);
                        setIsDropdownOpen(false);
                        setConfigOpenId(null);
                        setEmails(client.emailAccess ?? []);
                      }}
                      className={`px-2 py-1 text-sm cursor-pointer hover:bg-blue-50 ${
                        client.id === selectedClientId ? "bg-blue-100 font-medium" : ""
                      }`}
                    >
                      {client.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emails asociados */}
          {selectedClient && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-800 mb-1">Accesos por email</h3>
              {emails.length === 0 && (
                <p className="text-xs text-gray-500 italic">Sin emails asociados.</p>
              )}
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 px-2 py-1 rounded"
                >
                  <span className="truncate">{email}</span>
                  <button
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center mt-2 gap-1">
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
                  className="w-full text-sm border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button
                  onClick={handleAddEmail}
                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  title="Agregar email"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

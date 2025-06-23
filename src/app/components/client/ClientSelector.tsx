import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  FileText,
  Check,
  Clock,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { Client } from "@/types/types";

interface Props {
  clients: Client[];
  loading: boolean;
  selectedClientId: string | null;
  onSelect: (client: Client | null) => void;
  onCreate: (name: string) => void;
  onUpdatePermission?: (accessId: string, scope: string, action: string, allowed: boolean) => void;
  onUpdateAccessState?: (accessId: string, state: 'accepted' | 'rejected') => void;
}

const SCOPE_LABELS = {
  users: 'Usuarios',
  processes: 'Procesos', 
  documents: 'Documentos'
};

const ACTION_LABELS = {
  invite: 'Invitar',
  remove: 'Remover',
  edit: 'Editar',
  delete: 'Eliminar',
  create: 'Crear',
  grant: 'Otorgar'
};

const STATE_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado'
};

export default function ClientSelector({
  clients,
  loading,
  selectedClientId,
  onSelect,
  onCreate,
  onUpdatePermission,
  onUpdateAccessState,
}: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedAccess, setExpandedAccess] = useState<string | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleCreateClick = () => {
    const name = prompt("Ingrese el nombre del cliente:");
    if (name) onCreate(name);
  };

  const handlePermissionToggle = (accessId: string, scope: string, action: string, currentAllowed: boolean) => {
    if (onUpdatePermission) {
      onUpdatePermission(accessId, scope, action, !currentAllowed);
    }
  };

  const handleAccessStateChange = (accessId: string, newState: 'accepted' | 'rejected') => {
    if (onUpdateAccessState) {
      onUpdateAccessState(accessId, newState);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'accepted': return <Check className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'processes': return <Settings className="w-4 h-4" />;
      case 'documents': return <FileText className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-gray-50">
      {/* Sidebar - Lista de clientes */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Clientes</h2>
              <p className="text-sm text-gray-600">
                {clients.length} cliente{clients.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Botón crear cliente */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleCreateClick}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Crear Cliente
            </button>
          </div>
        )}

        {/* Lista de clientes con scroll */}
        <div className="flex-1 overflow-y-auto">
          {clients.length === 0 ? (
            !sidebarCollapsed && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No hay clientes</p>
              </div>
            )
          ) : (
            <div className="divide-y divide-gray-200">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    client.id === selectedClientId ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                  }`}
                  onClick={() => onSelect(client)}
                >
                  {sidebarCollapsed ? (
                    <div className="flex justify-center" title={client.name}>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {client.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.accesses?.length || 0} acceso{(client.accesses?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {client.id === selectedClientId && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full ml-2">
                          Activo
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área principal - Detalles del cliente */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedClient ? (
          <>
            {/* Header del cliente */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Creado el {new Date(selectedClient.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar cliente"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar cliente"
                    onClick={() => {
                      if (confirm(`¿Eliminar cliente "${selectedClient.name}"?`)) {
                        // Lógica de eliminación
                      }
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido - Accesos y permisos */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Accesos y Permisos
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestiona los usuarios y sus permisos para este cliente
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {selectedClient.accesses?.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg mb-2">Sin accesos configurados</p>
                        <p className="text-sm">Invita usuarios para comenzar</p>
                      </div>
                    ) : (
                      selectedClient.accesses?.map((access) => (
                        <div key={access.id} className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {(access.user.imageUrl || access.user.imageId) ? (
                                  <Image
                                    src={access.user.imageUrl || access.user.imageId} 
                                    alt={access.user.name || 'Usuario'} 
                                    width={25}
                                    height={25}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-gray-600">
                                    {(access.user.name || access.user.email || 'U').charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {access.user.name || 'Usuario sin nombre'}
                                </h4>
                                <p className="text-sm text-gray-600">{access.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                access.state === 'accepted' ? 'bg-green-100 text-green-800' :
                                access.state === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {getStateIcon(access.state)}
                                {STATE_LABELS[access.state]}
                              </div>
                              
                              {access.state === 'pending' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleAccessStateChange(access.id, 'accepted')}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Aceptar"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAccessStateChange(access.id, 'rejected')}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Rechazar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              
                              <button
                                onClick={() => setExpandedAccess(
                                  expandedAccess === access.id ? null : access.id
                                )}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Permisos expandidos */}
                          {expandedAccess === access.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-medium text-gray-800 mb-3">Permisos detallados</h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(SCOPE_LABELS).map(([scope, label]) => (
                                  <div key={scope} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      {getScopeIcon(scope)}
                                      <h6 className="text-sm font-medium text-gray-700">{label}</h6>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {Object.entries(ACTION_LABELS).map(([action, actionLabel]) => {
                                        const permission = access.permissions.find(
                                          p => p.scope === scope && p.action === action
                                        );
                                        const isAllowed = permission?.allowed || false;
                                        
                                        return (
                                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isAllowed}
                                              onChange={() => handlePermissionToggle(access.id, scope, action, isAllowed)}
                                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-xs text-gray-600">{actionLabel}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-700 px-6 text-center max-w-md mx-auto">
            <p className="text-xl font-semibold">Selecciona un cliente.</p>
            <Users/>

            <p className="text-sm text-gray-500 mt-2">
            Elige un cliente de la lista para ver sus detalles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
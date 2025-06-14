import { Plus } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clients: Client[];
  loading: boolean;
  selectedClientId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
}

export default function ClientSelector({
  clients,
  loading,
  selectedClientId,
  onSelect,
  onCreate,
}: Props) {
  const handleCreateClick = () => {
    const name = prompt("Ingrese el nombre del cliente:");
    if (name) {
      onCreate(name);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCreateClick}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
        title="Crear nuevo cliente"
      >
        <Plus className="w-4 h-4" />
        Crear Cliente
      </button>
      <select
        disabled={loading}
        value={selectedClientId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
      >
        <option value="" disabled>
          Seleccionar cliente...
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}
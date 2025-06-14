import { Pencil, Star } from "lucide-react";
import { Process } from "../../types";
import { useContentSterilizer } from "../../hooks/useContentSterilizer"; // ajusta la ruta según tu proyecto
import { useState } from "react";

interface Props {
  openProcess: Process | null;
  onEdit: () => void;
}

export default function ContentViewer({ openProcess, onEdit }: Props) {
  const { sterilizedContent, loading, sterilizeContent } = useContentSterilizer();
  const [showSterilized, setShowSterilized] = useState(false);

  if (!openProcess) return null;

  const handleSterilizeClick = () => {
    sterilizeContent(openProcess.content || "");
    setShowSterilized(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{openProcess.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSterilizeClick}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-md transition disabled:opacity-50"
            title="Esterilizar con IA"
          >
            <Star className="w-4 h-4" />
            Esterilizar con IA
          </button>
          <button
            onClick={() => {
              setShowSterilized(false);
              onEdit();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="prose prose-gray max-w-none">
            {showSterilized ? (
              sterilizedContent ? (
                <div
                  className="font-mono text-sm leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sterilizedContent }}
                />
              ) : loading ? (
                <p className="text-center py-12 text-gray-500">Esterilizando contenido...</p>
              ) : (
                <p className="text-center py-12 text-red-500">No se pudo esterilizar el contenido.</p>
              )
            ) : openProcess.content ? (
              <div
                className="font-mono text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: openProcess.content }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Este proceso no tiene contenido disponible.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Pencil, Star } from "lucide-react";
import { Process } from "../../types";
import { useContentSterilizer } from "../../hooks/useContentSterilizer";
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
    <div className="h-full flex flex-col relative">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 truncate">{openProcess.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
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

      {/* Botones fijos con estética gris */}
      <div className="absolute bottom-4 right-4 flex gap-3">
        <button
          onClick={handleSterilizeClick}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-2 bg-white rounded-md shadow transition-opacity opacity-60 hover:opacity-100 text-gray-800 text-sm font-medium disabled:opacity-40"
          title="Esterilizar con IA"
        >
          <Star className="w-4 h-4" />
          Esterilizar
        </button>

        <button
          onClick={() => {
            setShowSterilized(false);
            onEdit();
          }}
          className="flex items-center gap-1 px-3 py-2 bg-white rounded-md shadow transition-opacity opacity-60 hover:opacity-100 text-gray-800 text-sm font-medium"
          title="Editar"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import { Save, X } from "lucide-react";
import React from "react";
import dynamic from "next/dynamic";
import { Process, ProcessEditorHandle } from "../../types";

interface Props {
  tab: Process;
  onSave: (tab: Process) => void;
  onCancel: (tab: Process) => void;
  editorRefs: React.RefObject<Record<string, ProcessEditorHandle | null>>;
}

const ProcessEditor = dynamic(() => import("../process/ProcessEditor"), { ssr: false });

export default function ContentEditor({ tab, onSave, onCancel, editorRefs }: Props) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <span className="text-xl font-semibold text-gray-900">Editando: {tab.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <ProcessEditor
          ref={(ref) => {
            editorRefs.current[tab.id] = ref;
          }}
          initialContent={tab.content || ""}
        />
      </div>

      {/* Botones fijos abajo a la derecha */}
      <div className="absolute bottom-4 right-4 flex gap-3 z-50">
        <button
          onClick={() => onSave(tab)}
          className="flex items-center gap-1 px-3 py-2 bg-white rounded-md shadow transition-opacity opacity-60 hover:opacity-100 text-gray-800 text-sm font-medium"
          title="Guardar y salir"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={() => onCancel(tab)}
          className="flex items-center gap-1 px-3 py-2 bg-white rounded-md shadow transition-opacity opacity-60 hover:opacity-100 text-gray-800 text-sm font-medium"
          title="Cancelar edición"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

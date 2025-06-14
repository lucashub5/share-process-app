import { Save } from "lucide-react";
import React from "react";
import dynamic from "next/dynamic";
import { Process, ProcessEditorHandle } from "../../types";

interface Props {
  tab: Process;
  onSave: (tab: Process) => void;
  onCancel: (tab: Process) => void;
  editorRefs: React.RefObject<Record<number, ProcessEditorHandle | null>>;
}

const ProcessEditor = dynamic(() => import("../process/ProcessEditor"), { ssr: false });

export default function ContentEditor({ tab, onSave, onCancel, editorRefs }: Props) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xl font-semibold">Editando: {tab.title}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(tab)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition"
          >
            <Save className="w-4 h-4" /> Guardar y salir
          </button>
          <button
            onClick={() => onCancel(tab)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition"
          >
            Cancelar
          </button>
        </div>
      </div>

      <ProcessEditor
        ref={(ref) => {
          editorRefs.current[tab.id] = ref;
        }}
        initialContent={tab.content || ""}
      />
    </div>
  );
}
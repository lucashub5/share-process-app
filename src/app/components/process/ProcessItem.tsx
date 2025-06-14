"use client";

import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { Process } from "@/app/types";
import { useEffect, useRef } from "react";

interface ProcessItemProps {
  item: Process;
  level?: number;
  expandedItems: Set<string | number>;
  toggleExpanded: (id: string | number) => void;
  editingItem: string | number | null;
  setEditingItem: React.Dispatch<React.SetStateAction<string | number | null>>;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  saveEdit: (id: string | number) => Promise<void>;
  cancelEdit: () => void;
  deleteProcess: (id: string | number) => Promise<void>;
  addSubprocess: (parentId?: string | number | null, document?: boolean) => Promise<void>;
  actionLoading: string | number | null;
  openProcess: Process | null;
  setOpenProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  selectedProcess: Process | null;
  setSelectedProcess: React.Dispatch<React.SetStateAction<Process | null>>;
}

interface EditForm {
  title: string;
  content: string | null;
}

export default function ProcessItem({
  item,
  level = 0,
  expandedItems,
  toggleExpanded,
  editingItem,
  setEditingItem,
  editForm,
  setEditForm,
  saveEdit,
  cancelEdit,
  deleteProcess,
  addSubprocess,
  actionLoading,
  openProcess,
  setOpenProcess,
  selectedProcess,
  setSelectedProcess,
}: ProcessItemProps) {
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.childrens && item.childrens.length > 0;
  const isEditing = editingItem === item.id;
  const isLoading = actionLoading === item.id;
  const hasContent = item.content && item.content.trim() !== "";
  const isSelected = selectedProcess?.id === item.id;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      // Coloca el cursor al final del texto
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [isEditing]);

  const onClickContainer = () => {
    if (hasChildren) toggleExpanded(item.id);
    else if (hasContent) setOpenProcess(item);
    setSelectedProcess(item);
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-1 transition-all duration-200 cursor-pointer
          ${isSelected ? "bg-blue-200" : "hover:bg-gray-50 border-transparent"}
        `}
        style={{ paddingLeft: `${20 * level}px` }}
        onClick={onClickContainer}
      >
        <div className={`flex ${level > 0 ? "border-l-1" : ""} border-neutral-400 `}>
        {hasChildren ? (
          <div className="flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </div>
        ) : (
          <span className="w-4" />
        )}

        <div className="flex-1 min-w-0 select-text" >
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2 py-1 rounded text-xs outline-none ring-0 focus:outline-none focus:ring-0"
                placeholder="Título"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-medium truncate select-none ${
                    hasContent ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isEditing && (
            <>
              <button
                onClick={() => saveEdit(item.id)}
                disabled={isLoading || !editForm.title.trim()}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={cancelEdit}
                disabled={isLoading}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {item.childrens!.map((child) => (
            <ProcessItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              editForm={editForm}
              setEditForm={setEditForm}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              deleteProcess={deleteProcess}
              addSubprocess={addSubprocess}
              actionLoading={actionLoading}
              openProcess={openProcess}
              setOpenProcess={setOpenProcess}
              selectedProcess={selectedProcess}
              setSelectedProcess={setSelectedProcess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
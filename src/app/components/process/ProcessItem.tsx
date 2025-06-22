"use client";

import {
  ChevronDown,
  ChevronRight,
  X,
  AlignLeft,
} from "lucide-react";
import { DocumentType, Process } from "@/types/types";
import { useEffect, useRef } from "react";

interface ProcessItemProps {
  item: Process;
  level?: number;
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  editForm: Process | null;
  setEditForm: React.Dispatch<React.SetStateAction<Process | null>>;
  saveEdit: (id: string) => Promise<void>;
  cancelEdit: () => void;
  deleteProcess: (id: string) => Promise<void>;
  addSubprocess: (parentId: string | null, type: DocumentType) => Promise<void>;
  actionLoading: string | number | null;
  openProcess: Process | null;
  setOpenProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  selectedProcess: Process | null;
  setSelectedProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  configOpenId: string | number | null;
  setConfigOpenId: React.Dispatch<React.SetStateAction<string | number | null>>;
}

export default function ProcessItem({
  item,
  level = 0,
  expandedItems,
  toggleExpanded,
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
  configOpenId,
  setConfigOpenId,
}: ProcessItemProps) {
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.childrens?.length > 0;
  const isEditing = editForm?.id === item.id;
  const isLoading = actionLoading === item.id;
  const isDocument = item.type === "file";
  const isSelected = selectedProcess?.id === item.id;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [isEditing]);

  const onClickContainer = () => {
    if (hasChildren) toggleExpanded(item.id);
    else if (isDocument) setOpenProcess(item);
    setSelectedProcess(item);
  };

  return (
    <div className="w-full relative">
      <div
        className={`flex items-center gap-1 transition-all duration-200 cursor-pointer rounded-lg mx-3
          ${isSelected && !editForm ? "bg-gray-200" : "hover:bg-gray-100"}
        `}
        style={{ paddingLeft: `${21 * level}px` }}
        onClick={onClickContainer}
      >
        <div className={`pl-3 py-1.5 gap-1 w-full flex items-center ${level > 0 ? "border-l-1" : ""} border-neutral-200 p-0.25`}>
          <div className="flex justify-center items-center">
            {(item.type === "file" && isEditing) ? (
              <div className="flex items-center justify-center w-4 h-4">
                <AlignLeft className="w-3 h-3 text-gray-500" />
              </div>
            ) : hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )
            ) : <div className="w-4 h-4"/>}
          </div>

          <div className="flex-1 min-w-0 select-text" data-ignore-blur-id={item.id}>
            {isEditing ? (
              <div className="space-y-2 bg-blue-200 outline-1 outline-blue-500 rounded-sm" onClick={(e) => e.stopPropagation()}>
                <input
                  data-temp-id={item.id.startsWith("temp") ? item.id : undefined}
                  ref={inputRef}
                  type="text"
                  value={editForm!.title}
                  onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                  className="w-full p-1 text-sm font-medium outline-none z-12"
                />
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <h3
                  className={`p-0.5 text-sm font-medium truncate select-none ${
                    isDocument ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h3>
              </div>
            )}
          </div>

          {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  cancelEdit()
                }}
                disabled={isLoading}
                className="cursor-grab p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
          )}
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
              configOpenId={configOpenId}
              setConfigOpenId={setConfigOpenId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
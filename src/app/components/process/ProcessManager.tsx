"use client";

import React, { useState } from "react";
import { Edit2, Loader2, Trash2, FilePlus, FolderPlus, Info } from "lucide-react";
import { Process } from "../../types";
import ProcessItem from "./ProcessItem";

interface Props {
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  openProcess: Process | null;
  setOpenProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  selectedProcess: Process | null;
  setSelectedProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  setOpenTabs: React.Dispatch<React.SetStateAction<Process[]>>;
  loading: boolean;
  clientId: string;
}

interface EditForm {
  title: string;
  content: string | null;
}

type NewProcessData = {
  title: string;
  content: string | null;
  parentId: string | number | null;
  clientId: string;
};

type TempProcess = Process & { 
  isTemp?: boolean, 
  parentId: string | number | null,
  clientId: string;
};

export default function ProcessManager({
  processes,
  setProcesses,
  openProcess,
  setOpenProcess,
  selectedProcess,
  setSelectedProcess,
  setOpenTabs,
  loading,
  clientId,
}: Props) {
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(new Set());
  const [editingItem, setEditingItem] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: "", content: "" });
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [tempProcessId, setTempProcessId] = useState<string | number | null>(null);

  const isLoading = selectedProcess ? actionLoading === selectedProcess.id : undefined;

  const toggleExpanded = (id: string | number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Función para remover proceso temporal por id
  const removeTempProcess = (id: string | number) => {
    const remove = (items: Process[]): Process[] =>
      items.filter((item) => {
        if (item.id === id) return false;
        if (item.childrens) item.childrens = remove(item.childrens);
        return true;
      });
    setProcesses(remove(processes));
    setTempProcessId(null);
  };

  // Función para encontrar parentId del proceso temporal
  const findParentId = (tempId: string | number): string | number | null => {
    // Recorremos procesos para buscar parentId de tempId
    let parentId: string | number | null = null;

    const search = (items: Process[], parent: string | number | null) => {
      for (const item of items) {
        if (item.id === tempId) {
          parentId = parent;
          return true;
        }
        if (item.childrens) {
          if (search(item.childrens, item.id)) return true;
        }
      }
      return false;
    };

    search(processes, null);
    return parentId;
  };

  // Guardar edición o creación
  const saveEdit = async (id: string | number) => {
    // Si es proceso temporal (nuevo)
    if (tempProcessId === id) {
      try {
        setActionLoading(id);

        const newData: NewProcessData = {
          title: editForm.title,
          content: editForm.content,
          parentId: findParentId(id),
          clientId,
        };

        const response = await fetch("/api/processes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        if (response.ok) {
          const createdProcess: Process = await response.json();

          // Reemplazar proceso temporal por creado real
          const replaceTempWithReal = (items: Process[]): Process[] =>
            items.map((item) => {
              if (item.id === id) {
                return { ...createdProcess, childrens: [] };
              }
              if (item.childrens) {
                return { ...item, childrens: replaceTempWithReal(item.childrens) };
              }
              return item;
            });

          setProcesses(replaceTempWithReal(processes));
          setTempProcessId(null);
          setEditingItem(null);

          if (createdProcess.content !== null) {
            setOpenTabs((prev) => [...prev, createdProcess]);
            setOpenProcess(createdProcess);
            setSelectedProcess(createdProcess);
          } else {
            setSelectedProcess(createdProcess);
          }
        }
      } catch (error) {
        console.error("Error creating process:", error);
      } finally {
        setActionLoading(null);
      }
    } else {
      // Edición normal (PUT)
      try {
        setActionLoading(id);
        const response = await fetch(`/api/processes/${id}?clientId=${clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });

        if (response.ok) {
          const updateProcesses = (items: Process[]): Process[] => {
            return items.map((item) => {
              if (item.id === id) {
                const updated = { ...item, ...editForm };
                if (openProcess && openProcess.id === id) setOpenProcess(updated);
                return updated;
              }
              if (item.childrens) {
                return { ...item, childrens: updateProcesses(item.childrens) };
              }
              return item;
            });
          };

          const updatedProcesses = updateProcesses(processes);
          setProcesses(updatedProcesses);

          setOpenTabs((prev) =>
            prev.map((tab) => (tab.id === id ? { ...tab, ...editForm } : tab))
          );

          setEditingItem(null);
          setEditForm({ title: "", content: "" });
        }
      } catch (error) {
        console.error("Error updating process:", error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const cancelEdit = () => {
    if (tempProcessId) {
      removeTempProcess(tempProcessId);
    }
    setEditingItem(null);
    setEditForm({ title: "", content: "" });
  };

  const deleteProcess = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proceso?")) return;
  
    try {
      setActionLoading(id);
      const response = await fetch(`/api/processes/${id}?clientId=${clientId}`, { method: "DELETE" });
  
      if (response.ok) {
        // Recolectar todos los IDs del proceso eliminado y sus hijos
        const collectIds = (items: Process[]): (string | number)[] => {
          return items.flatMap((item) => {
            const childIds = item.childrens ? collectIds(item.childrens) : [];
            return [item.id, ...childIds];
          });
        };
  
        const findDeletedProcess = (items: Process[]): Process | null => {
          for (const item of items) {
            if (item.id === id) return item;
            if (item.childrens) {
              const result = findDeletedProcess(item.childrens);
              if (result) return result;
            }
          }
          return null;
        };
  
        const deleted = findDeletedProcess(processes);
        const deletedIds = deleted ? collectIds([deleted]) : [id];
  
        // Cerrar procesos abiertos si están en openTabs
        setOpenTabs((prev) => prev.filter((tab) => !deletedIds.includes(tab.id)));
  
        // Cerrar proceso abierto si es uno de los eliminados
        if (openProcess && deletedIds.includes(openProcess.id)) {
          setOpenProcess(null);
        }
  
        // Quitar del árbol de procesos
        const removeProcess = (items: Process[]): Process[] =>
          items.filter((item) => {
            if (item.id === id) return false;
            if (item.childrens) item.childrens = removeProcess(item.childrens);
            return true;
          });
  
        setProcesses(removeProcess(processes));
      }
    } catch (error) {
      console.error("Error deleting process:", error);
    } finally {
      setActionLoading(null);
    }
  };  

  const addSubprocess = async (parentId: string | number | null = null, document?: boolean) => {
    // Si hay proceso temporal cargado, eliminarlo antes de crear uno nuevo
    if (tempProcessId) {
      removeTempProcess(tempProcessId);
    }
  
    const tempId = -Date.now();
    setTempProcessId(tempId);
  
    const newProcess: TempProcess = {
      id: tempId,
      title: "",
      content: document ? "Descripción del nuevo documento" : null,
      parentId,
      childrens: [],
      isTemp: true,
      clientId,
    };
  
    if (parentId) {
      const addToParent = (items: Process[]): Process[] =>
        items.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              childrens: [...(item.childrens || []), newProcess],
            };
          }
          if (item.childrens) return { ...item, childrens: addToParent(item.childrens) };
          return item;
        });
      setProcesses(addToParent(processes));
      setExpandedItems((prev) => new Set([...prev, parentId]));
    } else {
      setProcesses([...processes, newProcess]);
    }
  
    setEditingItem(tempId);
    setEditForm({
      title: newProcess.title,
      content: newProcess.content,
    });
    setSelectedProcess(newProcess);
  };  

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-600">Cargando...</span>
      </div>
    );
  }

  const startEdit = (item: Process) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title,
      content: item.content,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between w-full h-17 px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-gray-900 select-none">SP APP</h2>
          <div className="flex">
            {(selectedProcess === null || selectedProcess.content === null) && (
              <>
                <button
                  onClick={() => addSubprocess(selectedProcess ? selectedProcess.id : null, true)}
                  disabled={isLoading}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Agregar archivo"
                >
                  <FilePlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addSubprocess(selectedProcess ? selectedProcess.id : null, false)}
                  disabled={isLoading}
                  className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                  title="Agregar carpeta"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </>
            )}
            {selectedProcess && (
              <>
                <button
                  onClick={() => startEdit(selectedProcess)}
                  disabled={isLoading}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProcess(selectedProcess.id)}
                  disabled={isLoading}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  disabled={isLoading}
                  className="p-1 text-neutral-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Información"
                >
                  <Info className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto p-2">
        <div>
          {processes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">No hay procesos</p>
              <button
                onClick={() => addSubprocess(null, false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Crear Primer Proceso
              </button>
            </div>
          ) : (
            processes.map((process) => (
              <ProcessItem
                key={process.id}
                item={process}
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
            ))
          )}
        </div>
        <div className="h-full w-full" onClick={() => setSelectedProcess(null)}></div>
      </div>
    </div>
  );
}

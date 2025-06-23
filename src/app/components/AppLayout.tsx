"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Login from "./auth/Login";
import ContentViewer from "./content/ContentViewer";
import ContentEditor from "./content/ContentEditor";
import ProcessManager from "./process/ProcessManager";
import ProcessTabs from "./process/ProcessTabs";
import SidebarToggleButton from "./ui/SidebarToggleButton";
import ClientSelector from "./client/ClientSelector";

import { useClients } from "../hooks/useClients";
import { useProcesses } from "../hooks/useProcesses";
import { useTabs } from "../hooks/useTabs";
import { useEditingManager } from "../hooks/useEditingManager";
import { DocumentType, Process } from "@/types/types";
import { BookOpenText, LoaderPinwheel, SquareStack } from "lucide-react";
import { SkeletonLoaderContent } from "@/app/misc/SkeletonLoader";
import UserDropdown from "./auth/UserDropdown";

export default function AppLayout() {
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<Process | null>(null);
  const [configOpenId, setConfigOpenId] = useState<string | number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'processes' | 'clients'>('processes');

  const {
    clients,
    loadingClients,
    selectedClient,
    setSelectedClient,
    createClient,
  } = useClients();

  const selectedClientId = selectedClient ? selectedClient.id : null

  const {
    processes,
    setProcesses,
    loading,
    updateProcessContent,
  } = useProcesses(selectedClientId);

  const {
    openProcess,
    setOpenProcess,
    openTabs,
    setOpenTabs,
    selectedProcess,
    setSelectedProcess,
    isEditing,
    setIsEditing,
    editorRefs,
    openTab,
    closeTab,
  } = useTabs();

  const { saveAndExit, cancelEdit } = useEditingManager({
    editorRefs,
    setProcesses,
    setOpenTabs,
    setOpenProcess,
    setSelectedProcess,
    setIsEditing,
    updateProcessContent,
    selectedClientId,
  });

  useEffect(() => {
    if (openProcess && !openTabs.find((tab) => tab.id === openProcess.id)) {
      setOpenTabs((prev) => [...prev, openProcess]);
    }
  }, [openProcess, openTabs, setOpenTabs]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const removeTempProcess = (id: string | number) => {
    const remove = (items: Process[]): Process[] =>
      items
        .map((item) => {
          if (item.id === id) return null;
          const updatedChildren = item.childrens ? remove(item.childrens) : [];
          return { ...item, childrens: updatedChildren };
        })
        .filter(Boolean) as Process[];
    setProcesses((prev) => remove(prev));
  };

  const cancelEditTitle = () => {
    if (editForm?.id?.toString().startsWith("temp-")) {
      removeTempProcess(editForm.id);
    }
    setEditForm(null);
    setSelectedProcess(null);
  };

  const addSubprocess = async (selectedId: string | null, type: DocumentType) => {
    if (editForm?.id?.toString().startsWith("temp-")) {
        if (editForm.type !== type) {
        setEditForm({ ...editForm, type });

        const updateTypeInProcesses = (items: Process[]): Process[] =>
            items.map((item) => {
                if (item.id === editForm.id) {
                    return { ...item, type };
                }
                if (item.childrens) {
                    return { ...item, childrens: updateTypeInProcesses(item.childrens) };
                }
                return item;
            });

            setProcesses(updateTypeInProcesses);
        }

        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>(
                `input[data-temp-id="${editForm.id}"]`
            );
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }, 0);
        
        return;
    }

    const tempId = `temp-${-Date.now()}`;
    let parentId: string | null = selectedId;

    if (selectedProcess) {
        parentId = selectedProcess.type === "file"
            ? selectedProcess.parentId ?? null
            : selectedProcess.id;
    }

    const newProcess: Process = {
        id: tempId,
        title: "",
        content: type === "file" ? "Descripción del nuevo archivo" : null,
        type,
        parentId,
        childrens: [],
    };

    const insertProcess = (items: Process[]): Process[] =>
        items.map((item) => {
            if (item.id === parentId) {
                return { ...item, childrens: [...(item.childrens || []), newProcess] };
            }
            if (item.childrens) {
                return { ...item, childrens: insertProcess(item.childrens) };
            }
            return item;
        });

    if (parentId) {
        setProcesses(insertProcess(processes));
        setExpandedItems((prev) => new Set([...prev, parentId!])); 
    } else {
        setProcesses([...processes, newProcess]);
    }
    
    setEditForm(newProcess);
    setSelectedProcess(newProcess);
  };

  const saveEdit = async (id: string) => {
    if (!editForm?.title?.trim() || selectedProcess?.title === editForm.title) {
      cancelEditTitle();
      return;
    }

    const isTemp = editForm.id.toString().startsWith("temp-");

    try {
      setActionLoading(id);

      if (isTemp) {
        const response = await fetch(`/api/processes?clientId=${selectedClientId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });

        if (response.ok) {
          const createdProcess: Process = await response.json();

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
          setSelectedProcess(createdProcess);
          if (createdProcess.type === "file") {
            setOpenTabs((prev) => [...prev, createdProcess]);
            setOpenProcess(createdProcess);
          }
        }
      } else {
        const response = await fetch(`/api/processes/${id}?clientId=${selectedClientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });

        if (response.ok) {
          const updateProcesses = (items: Process[]): Process[] =>
            items.map((item) => {
              if (item.id === id) {
                const updated = { ...item, title: editForm!.title };
                if (openProcess?.id === id) setOpenProcess(updated);
                return updated;
              }
              if (item.childrens) {
                return { ...item, childrens: updateProcesses(item.childrens) };
              }
              return item;
            });

          setProcesses(updateProcesses);
          setOpenTabs((prev) =>
            prev.map((tab) => (tab.id === id ? { ...tab, ...editForm } : tab))
          );
        }
      }
    } catch (error) {
      console.error("Error saving process:", error);
    } finally {
      setEditForm(null);
      setActionLoading(null);
    }
  };

  const deleteProcess = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proceso?")) return;

    try {
      setActionLoading(id);
      const response = await fetch(`/api/processes/${id}?clientId=${selectedClientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
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

        setOpenTabs((prev) => prev.filter((tab) => !deletedIds.includes(tab.id)));

        if (openProcess && deletedIds.includes(openProcess.id)) {
          setOpenProcess(null);
        }

        const removeProcess = (items: Process[]): Process[] =>
          items.filter((item) => {
            if (item.id === id) return false;
            if (item.childrens) item.childrens = removeProcess(item.childrens);
            return true;
          });

        setProcesses(removeProcess(processes));
        setSelectedProcess(null);
      }
    } catch (error) {
      console.error("Error deleting process:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "unauthenticated") {
    return <main className="h-screen"><Login /></main>;
  }

  if (loadingClients) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <LoaderPinwheel className="animate-pulse w-10 h-10 text-gray-600 mb-4" />
      </div>
    );
  }

  const NoClientSelected = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-700 px-6 text-center max-w-md mx-auto">
      <p className="text-xl font-semibold">No tienes clientes asociados.</p>
      <SquareStack/>
      <p className="text-sm text-gray-500 mt-2">
        Puedes solicitar que te asocien a un cliente ya existente para empezar a trabajar con él, o bien iniciar la gestión de un nuevo cliente por tu cuenta.
      </p>
    </div>
  );  

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full flex items-center justify-between p-2 px-4 border-b-1 border-gray-200">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 mask mask-icon rounded-full p-0.5">
          <LoaderPinwheel className="w-full h-full text-white" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-5 justify-end text-sm text-gray-1000">
          <button
            onClick={() => setCurrentView('processes')}
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              currentView === 'processes' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Procesos"
          >
            <BookOpenText className="w-5 h-5"/>
          </button>
          <button
            onClick={() => setCurrentView('clients')}
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              currentView === 'clients' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Clientes"
          >
            <SquareStack className="w-5 h-5"/>
          </button>
          <div className="flex flex-col w-30 items-center">
            {selectedClientId && (
              <>  
                <span className="text-xs text-blue-600 select-none">Cliente</span>
                <span className="text-sm font-bold text-gray-800">{selectedClient?.name}</span>
              </>
            )}
          </div>
          <UserDropdown/>
        </div>
      </header>
      
      <div className="flex flex-1">
        {currentView === 'clients' ? (
          <ClientSelector
            clients={clients}
            loading={loadingClients}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClient}
            onCreate={createClient}
          />
        ) : (
          // Vista de procesos completa
          <>
            {!selectedClientId ? (
              <NoClientSelected/>
            ) : (
              <>
                <div
                  className={`${
                    sidebarOpen ? "w-80" : "w-0"
                  } transition-all duration-300 overflow-hidden bg-white`}
                >
                  <ProcessManager
                    processes={processes}
                    openProcess={openProcess}
                    setOpenProcess={setOpenProcess}
                    selectedProcess={selectedProcess}
                    setSelectedProcess={setSelectedProcess}
                    loading={loading}
                    actionLoading={actionLoading}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    configOpenId={configOpenId}
                    setConfigOpenId={setConfigOpenId}
                    saveEdit={saveEdit}
                    addSubprocess={addSubprocess}
                    deleteProcess={deleteProcess}
                    cancelEditTitle={cancelEditTitle}
                    expandedItems={expandedItems}
                    toggleExpanded={toggleExpanded}
                  />
                </div>

                <div className="w-full flex flex-col relative">
                  <div className="flex items-center justify-between h-14 bg-white pl-3">
                    <div className="w-full h-full py-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                      <SidebarToggleButton onToggle={() => setSidebarOpen(!sidebarOpen)} />
                      <ProcessTabs
                        tabs={openTabs}
                        activeTabId={openProcess?.id ?? null}
                        onSelect={openTab}
                        onClose={closeTab}
                      />
                    </div>
                  </div>

                  <main className="flex-1 overflow-hidden relative mx-3">
                    {loading ? (
                      <SkeletonLoaderContent />
                    ) : (
                      openTabs.map((tab) => (
                        <div
                          key={tab.id}
                          className={`absolute inset-0 transition-opacity duration-200 ${
                            openProcess?.id === tab.id
                              ? "opacity-100 z-10"
                              : "opacity-0 z-0 pointer-events-none"
                          }`}
                        >
                          {isEditing(tab.id) ? (
                            <ContentEditor
                              tab={tab}
                              onSave={saveAndExit}
                              onCancel={cancelEdit}
                              editorRefs={editorRefs}
                            />
                          ) : (
                            <ContentViewer openProcess={tab} onEdit={() => setIsEditing(tab.id, true)} />
                          )}
                        </div>
                      ))
                    )}
                  </main>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
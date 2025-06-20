"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Login from "../auth/Login";
import ContentViewer from "../content/ContentViewer";
import ContentEditor from "../content/ContentEditor";
import ProcessManager from "../process/ProcessManager";
import ProcessTabs from "../process/ProcessTabs";
import SidebarToggleButton from "./SidebarToggleButton";
import ClientSelector from "../client/ClientSelector";

import { useClients } from "../../hooks/useClients";
import { useProcesses } from "../../hooks/useProcesses";
import { useTabs } from "../../hooks/useTabs";
import { useEditingManager } from "../../hooks/useEditingManager";
import { DocumentType, Process } from "@/app/types";
import { CircleUser, Loader2 } from "lucide-react";
import { SkeletonLoaderContent } from "@/app/misc/SkeletonLoader";

export default function Workspace() {
  const { data: session, status } = useSession();
  const userName = ((session?.user?.name) ?? "Usuario").trim().split(" ")[0];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<Process | null>(null);
  const [configOpenId, setConfigOpenId] = useState<string | number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    loadingClients,
    createClient,
  } = useClients(status);

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

    if (status === "loading") {
        return (
            <main className="h-screen flex items-center justify-center text-gray-600">
                <Loader2 className="animate-spin w-8 h-8 mr-2" />
                Cargando sesión...
            </main>
        );  
    }

  if (status === "unauthenticated") {
    return <main className="h-screen"><Login /></main>;
  }

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

    if (editForm?.id?.toString().startsWith("temp-")) {
        removeTempProcess(editForm.id);
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
        }
      } catch (error) {
        console.error("Error deleting process:", error);
      } finally {
        setActionLoading(null);
      }
    };
      return (
        <div
          className="flex flex-col h-screen"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const ignoreParent = target.closest("[data-ignore-blur-id]");
            const ignoreId = ignoreParent?.getAttribute("data-ignore-blur-id");
    
            if (
              editForm &&
              !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
              ignoreId !== String(editForm.id)
            ) {
              saveEdit(editForm.id.toString());
            }
          }}
        >
          <header className="p-2">
            <div className="flex items-center gap-2 justify-end text-sm">
              <div className="h-6 w-6 flex flex-col items-center text-neutral-700">
                <CircleUser />
              </div>
            </div>
          </header>
          <div className="flex flex-1">
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
              <div className="w-full h-full py-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 ">
                <SidebarToggleButton onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <ProcessTabs
                  tabs={openTabs}
                  activeTabId={openProcess?.id ?? null}
                  onSelect={openTab}
                  onClose={closeTab}
                />
                <ClientSelector
                  clients={clients}
                  loading={loadingClients}
                  selectedClientId={selectedClientId}
                  onSelect={setSelectedClientId}
                  onCreate={createClient}
                />
              </div>
            </div>
    
            <main className="flex-1 overflow-hidden relative mx-3">
                {loading ? (
                    <SkeletonLoaderContent />
                ) : !selectedClientId ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                    Selecciona un cliente para ver sus procesos.
                    </div>
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
          </div>
        </div>
      );
}

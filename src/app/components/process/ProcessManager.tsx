"use client";

import { useState, useMemo, useCallback } from "react";
import { FolderPlus, FilePlus, Info, FileX, FolderX, PenLine, ChevronRight } from "lucide-react";
import { DocumentType, Process } from "@/app/types";
import ProcessItem from "./ProcessItem";
import { SkeletonLoaderProcessList } from "@/app/misc/SkeletonLoader";

interface Props {
  processes: Process[];
  openProcess: Process | null;
  setOpenProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  selectedProcess: Process | null;
  setSelectedProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  loading: boolean;

  actionLoading: string | number | null;

  editForm: Process | null;
  setEditForm: React.Dispatch<React.SetStateAction<Process | null>>;

  configOpenId: string | number | null;
  setConfigOpenId: React.Dispatch<React.SetStateAction<string | number | null>>;

  saveEdit: (id: string) => Promise<void>;
  cancelEditTitle: () => void;
  addSubprocess: (parentId: string | null, type: DocumentType) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;

  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
}

export default function ProcessManager({
  processes,
  openProcess,
  setOpenProcess,
  selectedProcess,
  setSelectedProcess,
  loading,
  actionLoading,
  editForm,
  setEditForm,
  configOpenId,
  setConfigOpenId,
  saveEdit,
  addSubprocess,
  deleteProcess,
  cancelEditTitle,
  expandedItems,
  toggleExpanded,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredInputSearch, setHoveredInputSearch] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);

  // Filtra procesos recursivamente, como árbol
  const filterProcesses = useCallback(
    (procs: Process[], term: string): Process[] => {
      const lowerTerm = term.toLowerCase();

      return procs
        .map((proc) => {
          const filteredChildren = filterProcesses(proc.childrens, term);

          const matchesCurrent =
            proc.title.toLowerCase().includes(lowerTerm) ||
            (proc.content?.toLowerCase().includes(lowerTerm) ?? false);

          if (matchesCurrent || filteredChildren.length > 0) {
            return {
              ...proc,
              childrens: filteredChildren,
            };
          }

          return null;
        })
        .filter((p): p is Process => p !== null);
    },
    []
  );

  // Aplana los procesos en lista plana
  const flattenProcesses = useCallback((procs: Process[]): Process[] => {
    let flatList: Process[] = [];
    for (const proc of procs) {
      flatList.push(proc);
      if (proc.childrens.length > 0) {
        flatList = flatList.concat(flattenProcesses(proc.childrens));
      }
    }
    return flatList;
  }, []);

  // Procesos filtrados como árbol
  const filteredProcesses = useMemo(() => {
    if (!searchTerm.trim()) return processes;
    return filterProcesses(processes, searchTerm.trim());
  }, [filterProcesses, processes, searchTerm]);

  // Lista plana para la búsqueda lateral
  const flatFilteredProcesses = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return flattenProcesses(filteredProcesses);
  }, [filteredProcesses, searchTerm, flattenProcesses]);

  // Busca el path completo (ids) de un proceso por id para expandir padres
  const findPathById = useCallback(
    (
      procs: Process[],
      idToFind: string | number,
      path: (string | number)[] = []
    ): (string | number)[] | null => {
      for (const proc of procs) {
        if (proc.id === idToFind) {
          return [...path, proc.id];
        }
        if (proc.childrens.length > 0) {
          const childPath = findPathById(proc.childrens, idToFind, [...path, proc.id]);
          if (childPath) return childPath;
        }
      }
      return null;
    },
    []
  );

  // Busca path de títulos desde raíz hasta el id dado (para mostrar en búsqueda)
  const findTitlePathById = useCallback(
    (
      procs: Process[],
      idToFind: string | number,
      path: string[] = []
    ): string[] | null => {
      for (const proc of procs) {
        if (proc.id === idToFind) {
          return [...path, proc.title];
        }
        if (proc.childrens.length > 0) {
          const childPath = findTitlePathById(proc.childrens, idToFind, [...path, proc.title]);
          if (childPath) return childPath;
        }
      }
      return null;
    },
    []
  );

  // Al seleccionar un proceso de la lista lateral, setear selected y expandir padres
  const onSelectProcessFromList = (proc: Process) => {
    const path = findPathById(processes, proc.id);
    if (path) {
      path.slice(0, -1).forEach((id) => {
        if (!expandedItems.has(id.toString())) {
          toggleExpanded(id.toString());
        }
      });
    }
    setSelectedProcess(proc);
    setSearchTerm(""); // opcional, limpiar búsqueda al seleccionar
  };

  return (
    <div 
      className="h-full flex flex-col bg-gray-50 border-r-1 border-gray-100"
      onMouseEnter={() => setShowActionButtons(true)}
      onMouseLeave={() => setShowActionButtons(false)}
    >
      <div className="flex gap-1 justify-between items-center h-8 m-3">
        <div className="flex relative h-full">
          <div>
            <div className={`h-full transition-all duration-500 ease-in-out relative
              ${hoveredInputSearch ? "w-45" : "w-20"}`}>
              <input
                type="text"
                placeholder="Buscar"
                className="pl-2 h-full w-full rounded-md border text-sm font-medium border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onMouseEnter={() => setHoveredInputSearch(true)}
                onMouseLeave={() => setHoveredInputSearch(false)}
              />
              <div className="flex pr-1 absolute right-0 top-0 text-gray-500">
                <ChevronRight className="w-4 h-8" strokeWidth={1.5}/>
              </div>
            </div>
            {/* Lista lateral que aparece solo si hay búsqueda */}
            {searchTerm.trim() && (
              <div className="py-1 w-60 text-sm font-medium border border-gray-300 rounded-md bg-white shadow-lg absolute top-[110%] left-0 z-100 max-h-60 overflow-auto">
                {flatFilteredProcesses.length === 0 ? (
                  <p className="p-2 text-center text-gray-600">No hay resultados</p>
                ) : (
                  flatFilteredProcesses.map((proc) => {
                    const titlePath = findTitlePathById(processes, proc.id)?.join(" > ") ?? proc.title;
                    return (
                      <div
                        key={proc.id}
                        onClick={() => onSelectProcessFromList(proc)}
                        className={`px-2 cursor-pointer hover:bg-blue-100 ${
                          selectedProcess?.id === proc.id ? "bg-blue-200 font-semibold" : ""
                        }`}
                      >
                        <div>{proc.title}</div>
                        <div className="text-xs text-gray-500">{titlePath}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
        {(showActionButtons && !hoveredInputSearch) && (
          <div className="flex h-full">
            {selectedProcess && (
              <>
                <button
                  onClick={() => {
                    setEditForm({ ...selectedProcess });
                    setConfigOpenId(null);
                  }}
                  className="flex items-center p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 hover:bg-neutral-200 text-gray-800"
                  title="Editar"
                >
                  <PenLine className="w-4" />
                </button>
                <button
                  onClick={() => {
                    deleteProcess(selectedProcess.id);
                    setConfigOpenId(null);
                  }}
                  className="flex items-center p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 hover:bg-neutral-200 text-gray-800"
                  title="Eliminar"
                >
                  {selectedProcess.type === "file" ? (
                    <FileX className="w-4" />
                  ) : (
                    <FolderX className="w-4" />
                  )}
                </button>
                <button
                  className="flex items-center p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 hover:bg-neutral-200 text-gray-800"
                  title="Información"
                >
                  <Info className="w-4" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                addSubprocess(selectedProcess?.id ?? null, "folder");
              }}
              className="flex items-center p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 hover:bg-neutral-200 text-gray-800"
              title="Agregar Proceso"
            >
              <FolderPlus className="w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addSubprocess(selectedProcess?.id ?? null, "file");
              }}
              className="flex items-center p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 hover:bg-neutral-200 text-gray-800"
              title="Agregar Documento"
            >
              <FilePlus className="w-4" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonLoaderProcessList />
      ) : (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {processes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">No hay procesos</p>
              <button
                onClick={() => addSubprocess(null, "folder")}
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
                editForm={editForm}
                setEditForm={setEditForm}
                saveEdit={saveEdit}
                cancelEdit={cancelEditTitle}
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
            ))
          )}

          <div
            className="h-full w-full"
            onClick={() => setSelectedProcess(null)}
          />
        </div>
      )}
    </div>
  );
}
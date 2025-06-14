"use client";

import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import Login from "../auth/Login";
import ContentViewer from "../content/ContentViewer";
import ContentEditor from "../content/ContentEditor";
import ProcessManager from "../process/ProcessManager";
import ProcessTabs from "../process/ProcessTabs";
import LogoutButton from "../auth/Logout";
import SidebarToggleButton from "./SidebarToggleButton";
import ClientSelector from "../client/ClientSelector";

import { useClients } from "../../hooks/useClients";
import { useProcesses } from "../../hooks/useProcesses";
import { useTabs } from "../../hooks/useTabs";
import { useEditingManager } from "../../hooks/useEditingManager";

export default function Workspace() {
    const { data: session, status } = useSession();
    const userName = ((session?.user?.name) ?? "Usuario").trim().split(" ")[0];
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

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
        updateProcessContent 
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
            Cargando sesión...
        </main>
        );
    }

    if (status === "unauthenticated") {
        return (
        <main className="h-screen">
            <Login />
        </main>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div
            className={`${
            sidebarOpen ? "w-80" : "w-0"
            } transition-all duration-300 overflow-hidden bg-white`}
        >
            <ProcessManager
            processes={processes}
            setProcesses={setProcesses}
            openProcess={openProcess}
            setOpenProcess={setOpenProcess}
            selectedProcess={selectedProcess}
            setSelectedProcess={setSelectedProcess}
            setOpenTabs={setOpenTabs}
            loading={loading}
            clientId={selectedClientId!}
            />
        </div>

        {/* Main content */}
        <div className="w-full flex flex-col relative">
            {/* Header */}
            <header className="flex items-center justify-between h-17 bg-white px-6 py-4">
            <div className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <SidebarToggleButton onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <ProcessTabs
                tabs={openTabs}
                activeTabId={openProcess?.id ?? null}
                onSelect={openTab}
                onClose={closeTab}
                />
                <div className="flex gap-1 justify-end items-center">
                <ClientSelector
                    clients={clients}
                    loading={loadingClients}
                    selectedClientId={selectedClientId}
                    onSelect={setSelectedClientId}
                    onCreate={createClient}
                />
                {userName}
                <LogoutButton />
                </div>
            </div>
            </header>

            {/* Workspace */}
            <main className="flex-1 overflow-hidden relative">
            {!selectedClientId ? (
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
                    <ContentViewer 
                        openProcess={tab} onEdit={() => setIsEditing(tab.id, true)} 
                    />
                    )}
                </div>
                ))
            )}
            </main>
        </div>
        </div>
    );
}
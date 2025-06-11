'use client'

import { useEffect, useState } from 'react'
import { Search, Users, FileText, Sparkles } from 'lucide-react'
import ProcessList from './components/ProcessList'
import { SubProcess } from './data/process'
import { paymentContent } from './data/content'

export default function Home() {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<SubProcess | null>(null)
  const [htmlContent, setHtmlContent] = useState<string>('')

  const clients = ['Sony / MX']

  // useEffect para buscar el contenido html cuando cambia el proceso seleccionado
  useEffect(() => {
    if (selectedProcess) {
      const content = paymentContent.find((item) => item.id === selectedProcess.id)
      setHtmlContent(content?.htmlContent || '')
    } else {
      setHtmlContent('')
    }
  }, [selectedProcess])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-2.5 bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-700/50 shadow-2xl">
        <div className="w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar procesos..."
            className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="pl-10 pr-8 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client} value={client} className="bg-neutral-800">
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Layout: 2 columnas */}
      <main className="flex flex-1 gap-4 max-w-8xl mx-auto w-full min-h-0 p-6">
        {/* Panel izquierdo: Lista de procesos */}
        <aside className="w-80 flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Procesos
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
            <ProcessList onSelectProcess={setSelectedProcess} />
          </div>
        </aside>

        {/* Panel derecho: Vista del proceso */}
        <section className="flex-1 flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {selectedProcess ? selectedProcess.title : 'Vista del proceso'}
            </h2>
            {selectedProcess && (
              <p className="text-sm text-neutral-400 mt-1">Detalles del proceso seleccionado</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
            <div className="text-sm text-neutral-400">
              {selectedProcess ? (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Selecciona un proceso
                  </h3>
                  <p className="text-neutral-400 max-w-md leading-relaxed">
                    Elige un proceso de la lista para ver los detalles completos y métricas de rendimiento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
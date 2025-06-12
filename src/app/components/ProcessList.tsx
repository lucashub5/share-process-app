'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { processesData, SubProcess } from '../data/process'

type Props = {
  onSelectProcess: (subProcess: SubProcess) => void
  searchTerm: string
}

export default function ProcessList({ onSelectProcess, searchTerm }: Props) {
  const [expandedProcessId, setExpandedProcessId] = useState<number | null>(null)

  function toggleProcess(id: number) {
    setExpandedProcessId((prev) => (prev === id ? null : id))
  }

  const filteredProcesses = processesData.filter(({title, shortDescription, subProcesses}) => {
    const lowerSearchTerm = searchTerm.toLowerCase()

    const matchesProcess =
      title.toLowerCase().includes(lowerSearchTerm) || 
      shortDescription.toLowerCase().includes(lowerSearchTerm)

    const matchesSubProcesses = subProcesses.some((sub) => 
      sub.title.toLowerCase().includes(lowerSearchTerm) ||
      sub.shortDescription.toLowerCase().includes(lowerSearchTerm)
    )

    return (
      matchesProcess || matchesSubProcesses
    )
  })

  return (
    <div className="space-y-2">
      {filteredProcesses.map(({ id, title, shortDescription, subProcesses }) => (
        <div key={id} className="bg-gradient-to-r from-neutral-800/40 to-neutral-800/20 rounded-xl border border-neutral-700/50 overflow-hidden">
          <button
            onClick={() => toggleProcess(id)}
            aria-expanded={expandedProcessId === id}
            aria-controls={`subprocess-list-${id}`}
            className="w-full text-left p-2 hover:bg-neutral-800/30 cursor-pointer transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors mb-1">
                {title}
              </h2>
              <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {shortDescription}
              </p>
            </div>
            <div className="ml-3">
              {expandedProcessId === id ? (
                <ChevronDown className="w-4 h-4 text-neutral-400  group-hover:text-blue-400 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
          </button>

          {expandedProcessId === id && (
            <div id={`subprocess-list-${id}`} className="border-t border-neutral-700/50 bg-neutral-800/20">
              {subProcesses.map((sub) => (
                <button
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectProcess(sub)
                  }}
                  className="w-full text-left p-3 px-6 text-neutral-300 cursor-pointer hover:text-white hover:bg-neutral-700/30 transition-all duration-200 border-b border-neutral-700/30 last:border-b-0 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:bg-purple-400 transition-colors"></div>
                    <h3 className="text-xs font-medium">{sub.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
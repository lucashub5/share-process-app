'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Process } from '../../types';

type Props = {
  tabs: Process[];
  activeTabId: number | null;
  onSelect: (process: Process) => void;
  onClose: (id: number) => void;
};

export default function ProcessTabs({ tabs, activeTabId, onSelect, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // Check scroll position to show shadows
  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1); // -1 para evitar parpadeos
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [tabs]);

  // Drag handlers
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    scrollStartX.current = containerRef.current?.scrollLeft ?? 0;
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartX.current - clientX;

    containerRef.current.scrollLeft = scrollStartX.current + deltaX;
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full flex items-center gap-2 select-none overflow-hidden">
      {/* Left shadow */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-100 to-transparent z-10 animate-pulse" />
      )}

      {/* Scroll container */}
      <div
        ref={containerRef}
        className={`flex-1 flex gap-2 overflow-x-auto scrollbar-hide cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-4 py-1 rounded-md border cursor-pointer select-none
                ${tab.id === activeTabId
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => onSelect(tab)}
            >
              <span className="mr-2 truncate max-w-[150px]">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className="hover:text-red-500"
                aria-label={`Close tab ${tab.title}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right shadow */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-100 to-transparent z-10 animation-pulse" />
      )}
    </div>
  );
}

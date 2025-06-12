'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export type ProcessEditorHandle = {
  getContent: () => string;
};

const ProcessEditor = forwardRef<ProcessEditorHandle>((_, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const editorEl = editorRef.current;
  
    if (!editorEl) return;
  
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-toolbar.ql-snow {
        border: none !important;
        background: transparent;
      }
      .ql-container.ql-snow {
        border: none !important;
      }
      .ql-editor::before {
        color: rgb(150,150,150) !important;
      }
    `;
    document.head.appendChild(style);
  
    if (!quillRef.current) {
      quillRef.current = new Quill(editorEl, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
        },
        placeholder: 'Describe el proceso...',
      });
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);  

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return quillRef.current ? quillRef.current.root.innerHTML : '';
    },
  }));

  return <div ref={editorRef} style={{ height: '400px' }} />;
});

ProcessEditor.displayName = 'ProcessEditor';

export default ProcessEditor;
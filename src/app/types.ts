export type DocumentType = "file" | "folder"

export type Process = {
    id: string;
    title: string;
    content: string | null;
    type: DocumentType;
    childrens: Process[];
    parentId: string | null;
};

export type ProcessEditorHandle = {
    getContent: () => string;
};
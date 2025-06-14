export type Process = {
    id: number;
    title: string;
    content: string | null;
    childrens: Process[];
};

export type ProcessEditorHandle = {
    getContent: () => string;
};
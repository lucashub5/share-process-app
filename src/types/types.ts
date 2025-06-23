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

export type Client = {
  id: string;
  name: string;
  imageId?: string;
  creatorId: string;
  createdAt: string;
  accesses: Access[];
};

export type Access = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    imageId: string;
  }
  state: "pending" | "accepted" | "rejected";
  joinedAt: string | null;
  permissions: Permission[];
};

export type Permission = {
  scope: "users" | "processes" | "documents";
  action: "invite" | "remove" | "edit" | "delete" | "create" | "grant";
  allowed: boolean;
};

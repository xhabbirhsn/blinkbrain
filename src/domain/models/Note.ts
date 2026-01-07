export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  attachments: NoteAttachment[];
  codeBlocks: CodeBlock[];
  reminderId?: string; // Link to reminder if set
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'file';
  uri: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  addedAt: number;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  addedAt: number;
}

export interface NoteFilters {
  showPinned?: boolean;
  showActiveReminders?: boolean;
  showDisabledReminders?: boolean;
  showWithAttachments?: boolean;
  searchQuery?: string;
}

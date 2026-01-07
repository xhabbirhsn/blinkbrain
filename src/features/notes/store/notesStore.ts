import { create } from 'zustand';
import { Note, NoteFilters } from '../../../domain/models/Note';
import { storage, STORAGE_KEYS } from '../../../shared/storage';
import { generateUUID } from '../../../shared/utils/uuid';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  filters: NoteFilters;
  
  // Actions
  loadNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  softDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  pinNote: (id: string) => Promise<void>;
  unpinNote: (id: string) => Promise<void>;
  addAttachment: (noteId: string, attachment: Note['attachments'][0]) => Promise<void>;
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>;
  addCodeBlock: (noteId: string, codeBlock: Note['codeBlocks'][0]) => Promise<void>;
  removeCodeBlock: (noteId: string, codeBlockId: string) => Promise<void>;
  setFilters: (filters: Partial<NoteFilters>) => void;
  getFilteredNotes: () => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  filters: {},

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await storage.getItem<Note[]>(STORAGE_KEYS.NOTES);
      set({ notes: notes || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load notes',
        isLoading: false 
      });
    }
  },

  createNote: async (title: string, content: string) => {
    const newNote: Note = {
      id: generateUUID(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isDeleted: false,
      attachments: [],
      codeBlocks: [],
    };

    const notes = [...get().notes, newNote];
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
    
    return newNote;
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    const notes = get().notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  deleteNote: async (id: string) => {
    const notes = get().notes.filter(note => note.id !== id);
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  softDeleteNote: async (id: string) => {
    const notes = get().notes.map(note =>
      note.id === id
        ? { ...note, isDeleted: true, deletedAt: Date.now() }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  restoreNote: async (id: string) => {
    const notes = get().notes.map(note =>
      note.id === id
        ? { ...note, isDeleted: false, deletedAt: undefined }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  pinNote: async (id: string) => {
    const notes = get().notes.map(note =>
      note.id === id
        ? { ...note, isPinned: true, updatedAt: Date.now() }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  unpinNote: async (id: string) => {
    const notes = get().notes.map(note =>
      note.id === id
        ? { ...note, isPinned: false, updatedAt: Date.now() }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  addAttachment: async (noteId: string, attachment) => {
    const notes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            attachments: [...note.attachments, attachment],
            updatedAt: Date.now(),
          }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  removeAttachment: async (noteId: string, attachmentId: string) => {
    const notes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            attachments: note.attachments.filter(a => a.id !== attachmentId),
            updatedAt: Date.now(),
          }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  addCodeBlock: async (noteId: string, codeBlock) => {
    const notes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            codeBlocks: [...note.codeBlocks, codeBlock],
            updatedAt: Date.now(),
          }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  removeCodeBlock: async (noteId: string, codeBlockId: string) => {
    const notes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            codeBlocks: note.codeBlocks.filter(cb => cb.id !== codeBlockId),
            updatedAt: Date.now(),
          }
        : note
    );
    
    await storage.setItem(STORAGE_KEYS.NOTES, notes);
    set({ notes });
  },

  setFilters: (filters: Partial<NoteFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  getFilteredNotes: () => {
    const { notes, filters } = get();
    
    let filtered = notes.filter(note => !note.isDeleted);

    // Apply filters
    if (filters.showPinned) {
      filtered = filtered.filter(note => note.isPinned);
    }

    if (filters.showActiveReminders) {
      filtered = filtered.filter(note => note.reminderId);
    }

    if (filters.showWithAttachments) {
      filtered = filtered.filter(note => note.attachments.length > 0);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },
}));

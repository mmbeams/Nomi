import { Note } from '../types';

const STORAGE_KEY = 'nomi_notes';
const EMPTY_CATEGORIES_KEY = 'nomi_empty_categories';

export const saveNote = async (note: Note): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      notes.unshift(note); // Add to beginning (newest first)
      chrome.storage.local.set({ [STORAGE_KEY]: notes }, () => {
        resolve();
      });
    });
  });
};

export const getNotes = async (): Promise<Note[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      resolve(notes);
    });
  });
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    // Format as MM/DD/YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
};

export const groupNotesByDate = (notes: Note[]): Record<string, Note[]> => {
  const grouped: Record<string, Note[]> = {};
  
  notes.forEach((note) => {
    const dateKey = formatDate(note.created_at);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(note);
  });

  return grouped;
};

export const getEmptyCategories = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([EMPTY_CATEGORIES_KEY], (result) => {
      const categories: string[] = result[EMPTY_CATEGORIES_KEY] || [];
      resolve(categories);
    });
  });
};

export const addEmptyCategory = async (category: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([EMPTY_CATEGORIES_KEY], (result) => {
      const categories: string[] = result[EMPTY_CATEGORIES_KEY] || [];
      if (!categories.includes(category)) {
        categories.push(category);
        chrome.storage.local.set({ [EMPTY_CATEGORIES_KEY]: categories }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

export const removeEmptyCategory = async (category: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([EMPTY_CATEGORIES_KEY], (result) => {
      const categories: string[] = result[EMPTY_CATEGORIES_KEY] || [];
      const filtered = categories.filter(c => c !== category);
      chrome.storage.local.set({ [EMPTY_CATEGORIES_KEY]: filtered }, () => {
        resolve();
      });
    });
  });
};

export const getUniqueCategories = async (notes: Note[]): Promise<string[]> => {
  const categories = new Set<string>();
  notes.forEach((note) => {
    if (note.category) {
      categories.add(note.category);
    }
  });
  
  // Add empty categories
  const emptyCategories = await getEmptyCategories();
  emptyCategories.forEach(cat => categories.add(cat));
  
  return Array.from(categories).sort();
};

export const deleteNote = async (noteId: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      const filteredNotes = notes.filter(note => note.id !== noteId);
      chrome.storage.local.set({ [STORAGE_KEY]: filteredNotes }, () => {
        resolve();
      });
    });
  });
};

export const restoreNote = async (note: Note): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      // Check if note already exists
      const exists = notes.some(n => n.id === note.id);
      if (!exists) {
        notes.unshift(note); // Add to beginning (newest first)
        chrome.storage.local.set({ [STORAGE_KEY]: notes }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

export const updateNote = async (updatedNote: Note): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      const index = notes.findIndex(n => n.id === updatedNote.id);
      if (index !== -1) {
        notes[index] = updatedNote;
        chrome.storage.local.set({ [STORAGE_KEY]: notes }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

export const toggleFavorite = async (noteId: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      const index = notes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], is_favorite: !notes[index].is_favorite };
        chrome.storage.local.set({ [STORAGE_KEY]: notes }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

export const renameCategory = async (oldCategory: string, newCategory: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      const updatedNotes = notes.map(note => 
        note.category === oldCategory ? { ...note, category: newCategory } : note
      );
      chrome.storage.local.set({ [STORAGE_KEY]: updatedNotes }, () => {
        resolve();
      });
    });
  });
};

export const deleteCategory = async (category: string): Promise<Note[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const notes: Note[] = result[STORAGE_KEY] || [];
      const deletedNotes = notes.filter(note => note.category === category);
      const remainingNotes = notes.filter(note => note.category !== category);
      chrome.storage.local.set({ [STORAGE_KEY]: remainingNotes }, () => {
        resolve(deletedNotes);
      });
    });
  });
};

export const restoreCategoryNotes = async (notes: Note[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const existingNotes: Note[] = result[STORAGE_KEY] || [];
      // Add back the deleted notes
      notes.forEach(note => {
        const exists = existingNotes.some(n => n.id === note.id);
        if (!exists) {
          existingNotes.unshift(note);
        }
      });
      chrome.storage.local.set({ [STORAGE_KEY]: existingNotes }, () => {
        resolve();
      });
    });
  });
};





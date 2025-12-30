import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { getNotes, groupNotesByDate, getUniqueCategories, deleteNote, restoreNote, toggleFavorite, renameCategory, deleteCategory, restoreCategoryNotes, addEmptyCategory, removeEmptyCategory, saveNote } from '../utils/storage';
import { getCategoryColor } from '../utils/colorGenerator';
import { BACKEND_URL } from '../types';
import AnimatedLogo from './AnimatedLogo';
import detailIcon from '../assets/detail.svg';
import favIcon from '../assets/fav.svg';
import addIcon from '../assets/add.svg';
import deleteIcon from '../assets/delete.svg';
import editIcon from '../assets/edit.svg';
import moreIcon from '../assets/more.svg';
import enterIcon from '../assets/enter.svg';

interface HistoryProps {
  onBack: () => void;
  onNoteClick: (note: Note) => void;
}

const History: React.FC<HistoryProps> = ({ onBack, onNoteClick }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previousCategory, setPreviousCategory] = useState<string>('All');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const newNoteInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletedNote, setDeletedNote] = useState<Note | null>(null);
  const [showUndoPopup, setShowUndoPopup] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredActionIcon, setHoveredActionIcon] = useState<string | null>(null);
  const [deletedCategoryNotes, setDeletedCategoryNotes] = useState<Note[]>([]);
  const [isHoveringAddIcon, setIsHoveringAddIcon] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const editingCategoryInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categorySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
    // Check for pending undo note from detail page
    chrome.storage.local.get(['pending_undo_note'], (result) => {
      if (result.pending_undo_note) {
        setDeletedNote(result.pending_undo_note);
        setShowUndoPopup(true);
        chrome.storage.local.remove(['pending_undo_note']);
        // Auto-hide after 1.5 seconds
        setTimeout(() => {
          setShowUndoPopup(false);
          setDeletedNote(null);
        }, 1500);
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:79',message:'Click outside dropdown check',data:{isDropdownOpen,hasDropdownRef:!!categoryDropdownRef.current,hasSelectorRef:!!categorySelectorRef.current,target:event.target?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (
        isDropdownOpen &&
        categoryDropdownRef.current &&
        categorySelectorRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        !categorySelectorRef.current.contains(event.target as Node)
      ) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:88',message:'Closing dropdown from outside click',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutsideDropdown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, [isDropdownOpen]);

  const loadNotes = async () => {
    const allNotes = await getNotes();
    setNotes(allNotes);
    const categories = await getUniqueCategories(allNotes);
    setUniqueCategories(categories);
  };

  const isFavView = selectedCategory === 'Fav';
  const filteredNotes = selectedCategory === 'All' 
    ? notes 
    : selectedCategory === 'Fav'
    ? notes.filter(note => note.is_favorite === true)
    : notes.filter(note => note.category === selectedCategory);

  const groupedNotes = groupNotesByDate(filteredNotes);
  const dateKeys = Object.keys(groupedNotes).sort((a, b) => {
    // Sort: Today, Yesterday, then by date (newest first)
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return b.localeCompare(a);
  });

  const isCategoryEmpty = selectedCategory !== 'All' && selectedCategory !== 'Fav' && filteredNotes.length === 0;
  const isFavEmpty = selectedCategory === 'Fav' && filteredNotes.length === 0;

  const handleDelete = async (note: Note) => {
    await deleteNote(note.id);
    setDeletedNote(note);
    setShowUndoPopup(true);
    setOpenMenuId(null);
    loadNotes();
    
    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    
    // Auto-hide after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoPopup(false);
      setDeletedNote(null);
      undoTimeoutRef.current = null;
    }, 5000);
  };

  const handleUndo = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:120',message:'handleUndo called',data:{hasDeletedNote:!!deletedNote,hasDeletedCategoryNotes:deletedCategoryNotes.length > 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Clear timeout immediately
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    
    // Hide popup immediately
    setShowUndoPopup(false);
    
    if (deletedNote) {
      await restoreNote(deletedNote);
      setDeletedNote(null);
      loadNotes();
    } else if (deletedCategoryNotes.length > 0) {
      await handleUndoCategoryDelete();
    }
  };

  const handleAddToFav = async (note: Note) => {
    await toggleFavorite(note.id);
    setOpenMenuId(null);
    loadNotes();
  };

  const handleAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setIsDropdownOpen(true);
    setTimeout(() => {
      newCategoryInputRef.current?.focus();
    }, 0);
  };

  const handleNewCategorySubmit = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:143',message:'handleNewCategorySubmit called',data:{newCategoryName:newCategoryName.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();
      
      // Generate color for the new category to ensure consistency
      const categoryColor = getCategoryColor(categoryName);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:149',message:'Generated color for new category',data:{categoryName,categoryColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Store as empty category so it shows in dropdowns
      await addEmptyCategory(categoryName);
      
      // Just select the new category - don't assign it to any existing notes
      setSelectedCategory(categoryName);
      setIsDropdownOpen(false);
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      // Reload notes to refresh categories list
      loadNotes();
    }
  };

  const handleNewCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewCategorySubmit();
    } else if (e.key === 'Escape') {
      setIsAddingNewCategory(false);
      setNewCategoryName('');
    }
  };

  const handleEditCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryColor = getCategoryColor(category);
    setEditingCategory(category);
    setEditingCategoryName(category);
    setEditingCategoryColor(categoryColor);
    setTimeout(() => {
      editingCategoryInputRef.current?.focus();
    }, 0);
  };

  const handleCategoryRenameSubmit = async () => {
    if (editingCategory && editingCategoryName.trim() && editingCategoryName.trim() !== editingCategory) {
      const oldCategory = editingCategory;
      const newCategory = editingCategoryName.trim();
      await renameCategory(oldCategory, newCategory);
      setEditingCategory(null);
      setEditingCategoryName('');
      setEditingCategoryColor(null);
      loadNotes();
      // Update selected category if it was the one being edited
      if (selectedCategory === oldCategory) {
        setSelectedCategory(newCategory);
      }
    } else {
      setEditingCategory(null);
      setEditingCategoryName('');
      setEditingCategoryColor(null);
    }
  };

  const handleCategoryRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCategoryRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
      setEditingCategoryName('');
    }
  };

  const handleDeleteCategory = async (category: string, e: React.MouseEvent) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:239',message:'handleDeleteCategory called',data:{category,selectedCategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    e.stopPropagation();
    const deletedNotes = await deleteCategory(category);
    // Remove from empty categories if it was there
    await removeEmptyCategory(category);
    setDeletedCategoryNotes(deletedNotes);
    setShowUndoPopup(true);
    setIsDropdownOpen(false);
    
    // If deleting the currently selected category, redirect to "All"
    if (selectedCategory === category) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:252',message:'Redirecting to All after category delete',data:{deletedCategory:category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setSelectedCategory('All');
    }
    
    loadNotes();
    
    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    
    // Auto-hide after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoPopup(false);
      setDeletedCategoryNotes([]);
      undoTimeoutRef.current = null;
    }, 5000);
  };

  const handleUndoCategoryDelete = async () => {
    if (deletedCategoryNotes.length > 0) {
      // Clear timeout immediately
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
      
      // Hide popup immediately
      setShowUndoPopup(false);
      
      await restoreCategoryNotes(deletedCategoryNotes);
      setDeletedCategoryNotes([]);
      loadNotes();
    }
  };

  const categorizeNote = async (note: string): Promise<string> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error(`Failed to categorize: ${response.status}`);
      }

      const data = await response.json();
      if (!data.category) {
        throw new Error('No category in response');
      }
      
      return data.category;
    } catch (error) {
      console.error('Error categorizing note:', error);
      return 'Life'; // Fallback
    }
  };

  const handleNewNoteSave = async () => {
    if (newNoteText.trim()) {
      const content = newNoteText.trim();
      let category: string;
      
      if (selectedCategory === 'All') {
        // AI categorizes the note
        category = await categorizeNote(content);
        // Remove from empty categories if it was there
        await removeEmptyCategory(category);
      } else if (selectedCategory !== 'Fav') {
        // Use the selected category
        category = selectedCategory;
        // Remove from empty categories if it was there
        await removeEmptyCategory(category);
      } else {
        // Fav view - use AI categorization
        category = await categorizeNote(content);
        await removeEmptyCategory(category);
      }

      // Get current URL
      let sourceUrl: string | undefined;
      try {
        const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, resolve);
        });
        if (tabs[0]?.url) {
          sourceUrl = tabs[0].url;
        }
      } catch {
        // Ignore URL errors
      }

      const note: Note = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        category,
        created_at: Date.now(),
        source_url: sourceUrl,
      };

      await saveNote(note);
      setNewNoteText('');
      setIsAddingNote(false);
      loadNotes();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:313',message:'Note saved successfully',data:{noteId:note.id,content:note.content,category:note.category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  };

  const handleNewNoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewNoteSave();
    } else if (e.key === 'Escape') {
      setIsAddingNote(false);
      setNewNoteText('');
    }
  };

  const handleNewNoteBlur = () => {
    if (newNoteText.trim()) {
      handleNewNoteSave();
    } else {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <AnimatedLogo onClick={onBack} />
          <div className="history-header-content">
            <div className="category-header">
              <div 
                ref={categorySelectorRef}
                className="category-selector"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="category-indicator" style={{ backgroundColor: selectedCategory === 'All' ? '#9E9E9E' : selectedCategory === 'Fav' ? '#FFD700' : getCategoryColor(selectedCategory) }}></div>
                <span className="category-name">{selectedCategory === 'All' ? 'All' : selectedCategory === 'Fav' ? 'Fav' : selectedCategory}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {isDropdownOpen && (
                <div ref={categoryDropdownRef} className="category-dropdown">
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory('All');
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="category-indicator" style={{ backgroundColor: '#9E9E9E' }}></div>
                    <span>All</span>
                  </div>
                  {uniqueCategories.map((category) => (
                    <div
                      key={category}
                      className="dropdown-item category-item"
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (!editingCategory) {
                          setSelectedCategory(category);
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      <div className="category-item-content">
                        <div className="category-indicator" style={{ backgroundColor: editingCategory === category && editingCategoryColor ? editingCategoryColor : getCategoryColor(category) }}></div>
                        {editingCategory === category ? (
                          <input
                            ref={editingCategoryInputRef}
                            type="text"
                            className="category-edit-input"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            onKeyDown={handleCategoryRenameKeyDown}
                            onBlur={handleCategoryRenameSubmit}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span>{category}</span>
                        )}
                      </div>
                      {hoveredCategory === category && !editingCategory && (
                        <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                          <img 
                            src={editIcon} 
                            alt="Edit" 
                            className={`category-action-icon ${hoveredActionIcon === `${category}-edit` ? 'hovered' : ''}`}
                            onClick={(e) => handleEditCategory(category, e)}
                            onMouseEnter={() => setHoveredActionIcon(`${category}-edit`)}
                            onMouseLeave={() => setHoveredActionIcon(null)}
                          />
                          <img 
                            src={deleteIcon} 
                            alt="Delete" 
                            className={`category-action-icon ${hoveredActionIcon === `${category}-delete` ? 'hovered' : ''}`}
                            onClick={(e) => handleDeleteCategory(category, e)}
                            onMouseEnter={() => setHoveredActionIcon(`${category}-delete`)}
                            onMouseLeave={() => setHoveredActionIcon(null)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div 
                    className={`dropdown-item add-new-category ${isAddingNewCategory ? 'editing' : ''}`}
                    onClick={!isAddingNewCategory ? handleAddNewCategory : undefined}
                    style={{ minWidth: '200px' }}
                  >
                    {isAddingNewCategory ? (
                      <>
                        <div 
                          className="category-indicator-new" 
                          style={newCategoryName.trim() ? { 
                            border: 'none', 
                            background: getCategoryColor(newCategoryName.trim()) 
                          } : {}}
                        ></div>
                        <input
                          ref={newCategoryInputRef}
                          type="text"
                          className="new-category-input"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={handleNewCategoryKeyDown}
                          onBlur={handleNewCategorySubmit}
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <div className="category-indicator-new"></div>
                        <span>Add new</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="history-header-actions">
              <img 
                src={addIcon} 
                alt="Add" 
                className={`history-add-icon ${isHoveringAddIcon ? 'hovered' : ''} ${isAddingNote ? 'adding' : ''}`}
                onClick={() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:448',message:'Add icon clicked',data:{isAddingNote},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
                  setIsAddingNote(true);
                  setTimeout(() => {
                    newNoteInputRef.current?.focus();
                  }, 0);
                }}
                onMouseEnter={() => setIsHoveringAddIcon(true)}
                onMouseLeave={() => setIsHoveringAddIcon(false)}
                style={{ cursor: 'pointer' }}
              />
              <img 
                src={favIcon} 
                alt="Favorites" 
                className={`history-fav-icon ${isFavView ? 'active' : ''}`}
                onClick={() => {
                  if (isFavView) {
                    setSelectedCategory(previousCategory);
                  } else {
                    setPreviousCategory(selectedCategory);
                    setSelectedCategory('Fav');
                  }
                  setIsDropdownOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="history-content">
        {isAddingNote && (
          <div className="date-section">
            <div className="notes-list">
              <div className={`note-card adding-note-card ${newNoteText.trim() ? 'typing' : ''}`}>
                <div 
                  className="note-category-indicator adding-note-indicator" 
                  style={{ 
                    border: '1.4px solid #000000',
                    background: 'transparent'
                  }}
                ></div>
                <input
                  ref={newNoteInputRef}
                  type="text"
                  className={`note-content adding-note-input ${newNoteText.trim() ? 'typing' : ''}`}
                  placeholder="add new"
                  value={newNoteText}
                  onChange={(e) => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:485',message:'Note input changed',data:{value:e.target.value,hasValue:!!e.target.value.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    setNewNoteText(e.target.value);
                  }}
                  onKeyDown={handleNewNoteKeyDown}
                  onBlur={handleNewNoteBlur}
                  autoFocus
                />
                <img src={detailIcon} alt="Detail" className="note-detail-icon" style={{ opacity: 0 }} />
              </div>
            </div>
          </div>
        )}
        {isCategoryEmpty && !isAddingNote && (
          <div className="date-section">
            <div className="empty-category-message">
              <p>Start creating notes :)</p>
            </div>
          </div>
        )}
        {isFavEmpty && !isAddingNote && (
          <div className="date-section">
            <div className="empty-category-message">
              <p>Your favourite notes will show in here.</p>
            </div>
          </div>
        )}
        {dateKeys.length === 0 && !isCategoryEmpty && !isFavEmpty && !isAddingNote ? (
          <div className="empty-history">
            <p>No notes yet. Start capturing your thoughts!</p>
          </div>
        ) : (
          dateKeys.map((dateKey) => (
            <div key={dateKey} className="date-section">
              <h3 className="date-header">{dateKey}</h3>
              <div className="notes-list">
                {groupedNotes[dateKey].map((note) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:528',message:'Rendering note card',data:{noteId:note.id,noteCategory:note.category,isFavorite:note.is_favorite,hoveredNoteId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                  return (
                  <div 
                    key={note.id} 
                    className="note-card"
                    onClick={() => onNoteClick(note)}
                    onMouseEnter={() => setHoveredNoteId(note.id)}
                    onMouseLeave={() => {
                      if (!openMenuId) {
                        setHoveredNoteId(null);
                      }
                    }}
                  >
                    {hoveredNoteId === note.id ? (
                      <div 
                        className="more-icon-wrapper-outside"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === note.id ? null : note.id);
                        }}
                      >
                        <img src={moreIcon} alt="More" className="more-icon" />
                        {openMenuId === note.id && (
                          <div className="more-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); handleAddToFav(note); }}>
                              <img src={favIcon} alt="Favorite" className="menu-icon" />
                              <span>{note.is_favorite ? 'Remove from Fav' : 'Add to Fav'}</span>
                            </div>
                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); handleDelete(note); }}>
                              <img src={deleteIcon} alt="Delete" className="menu-icon" />
                              <span>Delete</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : note.is_favorite ? (
                      <img src={favIcon} alt="Favorite" className="note-fav-indicator-outside" />
                    ) : null}
                    <div 
                      className="note-category-indicator" 
                      style={{ backgroundColor: (() => {
                        const color = getCategoryColor(note.category);
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:567',message:'Setting note category color',data:{noteId:note.id,category:note.category,color},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        // #endregion
                        return color;
                      })() }}
                    ></div>
                    <span className="note-content">{note.content}</span>
                    <img src={detailIcon} alt="Detail" className="note-detail-icon" onClick={(e) => { e.stopPropagation(); onNoteClick(note); }} />
                  </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      {showUndoPopup && (
        <div className="undo-popup">
          <span className="undo-text">Deleted</span>
          <button className="undo-button" onClick={handleUndo}>Undo</button>
        </div>
      )}
    </div>
  );
};

export default History;




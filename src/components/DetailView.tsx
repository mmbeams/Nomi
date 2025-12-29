import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { updateNote, deleteNote, getNotes, toggleFavorite, renameCategory, deleteCategory, restoreCategoryNotes, getUniqueCategories as getUniqueCategoriesUtil, addEmptyCategory } from '../utils/storage';
import { getCategoryColor } from '../utils/colorGenerator';
import logoIcon from '../assets/logo.svg';
import backIcon from '../assets/back.svg';
import tagIcon from '../assets/tag.svg';
import dateIcon from '../assets/date.svg';
import calendarIcon from '../assets/calendar.svg';
import urlIcon from '../assets/url.svg';
import favIcon from '../assets/fav.svg';
import deleteIcon from '../assets/delete.svg';
import editIcon from '../assets/edit.svg';
import dropdownIcon from '../assets/dropdown.svg';
import enterIcon from '../assets/enter.svg';

interface DetailViewProps {
  note: Note;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ note, onBack }) => {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:20',message:'DetailView component mounted',data:{noteId:note.id,noteContent:note.content?.substring(0,20),hasCategory:!!note.category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [note.id]);
  // #endregion

  const [currentNote, setCurrentNote] = useState<Note>(note);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [description, setDescription] = useState<string>(note.description || '');
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredActionIcon, setHoveredActionIcon] = useState<string | null>(null);
  const [deletedCategoryNotes, setDeletedCategoryNotes] = useState<Note[]>([]);
  const [showUndoPopup, setShowUndoPopup] = useState(false);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const editingCategoryInputRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllNotes();
  }, []);

  const loadAllNotes = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:35',message:'loadAllNotes called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const notes = await getNotes();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:38',message:'getNotes completed',data:{notesCount:notes.length,hasError:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setAllNotes(notes);
      const categories = await getUniqueCategoriesUtil(notes);
      setUniqueCategories(categories);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:42',message:'getNotes error',data:{errorMessage:error instanceof Error ? error.message : String(error),hasError:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Error loading notes:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);


  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${month}/${day} ${displayHours}:${minutes} ${ampm}`;
  };

  const handleTagChange = async (newCategory: string) => {
    const updatedNote = { ...currentNote, category: newCategory };
    await updateNote(updatedNote);
    setCurrentNote(updatedNote);
    setIsTagDropdownOpen(false);
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    loadAllNotes(); // Reload to get updated categories
  };

  const handleAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setTimeout(() => {
      newCategoryInputRef.current?.focus();
    }, 0);
  };

  const handleNewCategorySubmit = async () => {
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();
      // Store as empty category - don't assign to current note
      await addEmptyCategory(categoryName);
      setIsTagDropdownOpen(false);
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      // Reload to get updated categories
      await loadAllNotes();
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
      loadAllNotes();
      // Update current note if it was the one being edited
      if (currentNote.category === oldCategory) {
        const updatedNote = { ...currentNote, category: newCategory };
        setCurrentNote(updatedNote);
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
    e.stopPropagation();
    const deletedNotes = await deleteCategory(category);
    setDeletedCategoryNotes(deletedNotes);
    setShowUndoPopup(true);
    setIsTagDropdownOpen(false);
    loadAllNotes();
    
    // Update current note if it was deleted
    if (currentNote.category === category) {
      onBack();
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowUndoPopup(false);
      setDeletedCategoryNotes([]);
    }, 5000);
  };

  const handleUndoCategoryDelete = async () => {
    if (deletedCategoryNotes.length > 0) {
      await restoreCategoryNotes(deletedCategoryNotes);
      setShowUndoPopup(false);
      setDeletedCategoryNotes([]);
      loadAllNotes();
    }
  };

  const handleDescriptionSave = async () => {
    const updatedNote = { ...currentNote, description };
    await updateNote(updatedNote);
    setCurrentNote(updatedNote);
  };

  const handleDelete = async () => {
    await deleteNote(currentNote.id);
    
    // Store for undo from history page
    chrome.storage.local.set({ pending_undo_note: currentNote });
    
    // Navigate back to history page immediately
    onBack();
  };


  const handleAddToCalendar = () => {
    const encodedTitle = encodeURIComponent(currentNote.content);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}`;
    chrome.tabs.create({ url: calendarUrl });
  };

  const handleUrlClick = () => {
    if (currentNote.source_url) {
      chrome.tabs.create({ url: currentNote.source_url });
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(currentNote.id);
    const notes = await getNotes();
    const updatedNote = notes.find(n => n.id === currentNote.id);
    if (updatedNote) {
      setCurrentNote(updatedNote);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="assistant-icon" onClick={onBack} style={{ cursor: 'pointer' }}>
            <img src={logoIcon} alt="Nomi assistant" />
          </div>
          <div className="detail-header-content">
            <img src={backIcon} alt="Back" className="back-icon" onClick={onBack} style={{ cursor: 'pointer' }} />
            <span className="detail-title">{currentNote.content}</span>
            <div className="detail-actions">
              <img 
                src={favIcon} 
                alt="Favorite" 
                className={`action-icon ${currentNote.is_favorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                style={{ cursor: 'pointer' }}
              />
              <img src={deleteIcon} alt="Delete" className="action-icon" onClick={handleDelete} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <img src={tagIcon} alt="Tag" className="detail-section-icon" />
            <div className="tag-selector-wrapper" ref={tagDropdownRef}>
              <div 
                className="tag-selector"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              >
                <div 
                  className="tag-indicator" 
                  style={{ backgroundColor: getCategoryColor(currentNote.category) }}
                ></div>
                <span className="tag-name">{currentNote.category}</span>
                <img src={dropdownIcon} alt="Dropdown" className="dropdown-icon-small" />
              </div>
              {isTagDropdownOpen && (
                <div className="tag-dropdown">
                  {uniqueCategories.map((category) => (
                    <div
                      key={category}
                      className="tag-dropdown-item category-item"
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (!editingCategory) {
                          handleTagChange(category);
                        }
                      }}
                    >
                      <div className="category-item-content">
                        <div className="tag-indicator" style={{ backgroundColor: editingCategory === category && editingCategoryColor ? editingCategoryColor : getCategoryColor(category) }}></div>
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
                    className={`tag-dropdown-item add-new-category ${isAddingNewCategory ? 'editing' : ''}`}
                    onClick={!isAddingNewCategory ? handleAddNewCategory : undefined}
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
          </div>

          <div className="detail-item">
            <img src={dateIcon} alt="Date" className="detail-section-icon" />
            <span className="detail-text">{formatDate(currentNote.created_at)}</span>
          </div>

          <div className="detail-item description-item">
            <input
              type="text"
              className="description-input"
              placeholder="Add description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDescriptionSave();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            <p className="save-hint">
              <img src={enterIcon} alt="" className="enter-icon" />
              <span>Tap ENTER to save</span>
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <button
          className="calendar-button active"
          onClick={handleAddToCalendar}
        >
          <div className="calendar-icon">
            <img src={calendarIcon} alt="Calendar" />
          </div>
          <span className="calendar-text">Add to<br />Google Calendar</span>
        </button>
        {currentNote.source_url && (
          <div 
            className="url-display-detail"
            onClick={handleUrlClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="url-text-wrapper">
              <span className="url-text-detail">www.{new URL(currentNote.source_url).hostname}</span>
              <div className="url-fade-overlay"></div>
              <img src={urlIcon} alt="External link" className="url-icon-detail" />
            </div>
          </div>
        )}
      </div>
      {showUndoPopup && (
        <div className="undo-popup">
          <span className="undo-text">{deletedCategoryNotes.length > 0 ? 'Category deleted' : 'Deleted'}</span>
          <button className="undo-button" onClick={handleUndoCategoryDelete}>Undo</button>
        </div>
      )}
    </div>
  );
};

export default DetailView;


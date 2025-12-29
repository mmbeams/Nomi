import React, { useState, useEffect, useRef } from 'react';
import { Note, CATEGORY_COLORS } from '../types';
import { getNotes, groupNotesByDate, getUniqueCategories, deleteNote, restoreNote, updateNote } from '../utils/storage';
import { getCategoryColor } from '../utils/colorGenerator';
import logoIcon from '../assets/logo.svg';
import detailIcon from '../assets/detail.svg';
import favIcon from '../assets/fav.svg';
import deleteIcon from '../assets/delete.svg';
import dropdownIcon from '../assets/dropdown.svg';
import moreIcon from '../assets/more.svg';

interface HistoryProps {
  onBack: () => void;
  onNoteClick: (note: Note) => void;
}

const History: React.FC<HistoryProps> = ({ onBack, onNoteClick }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletedNote, setDeletedNote] = useState<Note | null>(null);
  const [showUndoPopup, setShowUndoPopup] = useState(false);
  const [isAddingNewTag, setIsAddingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const newTagInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
    // Check for pending undo note from detail page
    chrome.storage.local.get(['pending_undo_note'], (result) => {
      if (result.pending_undo_note) {
        setDeletedNote(result.pending_undo_note);
        setShowUndoPopup(true);
        chrome.storage.local.remove(['pending_undo_note']);
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowUndoPopup(false);
          setDeletedNote(null);
        }, 5000);
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

  const loadNotes = async () => {
    const allNotes = await getNotes();
    setNotes(allNotes);
  };

  const filteredNotes = selectedCategory === 'Recent' 
    ? notes 
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

  const uniqueCategories = getUniqueCategories(notes);

  const handleAddNewTag = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:84',message:'handleAddNewTag called',data:{isDropdownOpen,isAddingNewTag:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setIsAddingNewTag(true);
    setIsDropdownOpen(true);
    setTimeout(() => {
      newTagInputRef.current?.focus();
    }, 0);
  };

  const handleNewTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewTagSubmit();
    } else if (e.key === 'Escape') {
      setIsAddingNewTag(false);
      setNewTagName('');
      setIsDropdownOpen(false);
    }
  };

  const handleNewTagSubmit = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:105',message:'handleNewTagSubmit called',data:{newTagName:newTagName.trim(),hasValue:!!newTagName.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (newTagName.trim()) {
      const categoryName = newTagName.trim();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:109',message:'Before state updates',data:{categoryName,currentSelectedCategory:selectedCategory,isDropdownOpen,isAddingNewTag},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setSelectedCategory(categoryName);
      setIsDropdownOpen(false);
      setIsAddingNewTag(false);
      setNewTagName('');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:114',message:'After state updates',data:{categoryName,notesCount:notes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await loadNotes();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:117',message:'After loadNotes',data:{notesCount:notes.length,uniqueCategories:getUniqueCategories(notes)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    }
  };

  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || '#9E9E9E';
  };

  const handleDelete = async (note: Note) => {
    await deleteNote(note.id);
    setDeletedNote(note);
    setShowUndoPopup(true);
    setOpenMenuId(null);
    loadNotes();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowUndoPopup(false);
      setDeletedNote(null);
    }, 5000);
  };

  const handleUndo = async () => {
    if (deletedNote) {
      await restoreNote(deletedNote);
      setShowUndoPopup(false);
      setDeletedNote(null);
      loadNotes();
    }
  };

  const handleAddToFav = async (note: Note) => {
    // TODO: Implement favorite functionality
    console.log('Add to fav:', note);
    setOpenMenuId(null);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="assistant-icon" onClick={onBack} style={{ cursor: 'pointer' }}>
            <img src={logoIcon} alt="Nomi assistant" />
          </div>
          <div className="category-header">
            <div 
              className="category-selector"
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'History.tsx:147',message:'Category selector clicked',data:{selectedCategory,isDropdownOpen,willToggle:!isDropdownOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <div className="category-indicator" style={{ backgroundColor: selectedCategory === 'Recent' ? '#9E9E9E' : getCategoryColor(selectedCategory) }}></div>
              <span className="category-name">{selectedCategory === 'Recent' ? 'Recent' : selectedCategory}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {isDropdownOpen && (
              <div className="category-dropdown">
                <div 
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategory('Recent');
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="category-indicator" style={{ backgroundColor: '#9E9E9E' }}></div>
                  <span>Recent notes</span>
                </div>
                {uniqueCategories.map((category) => (
                  <div
                    key={category}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="category-indicator" style={{ backgroundColor: getCategoryColor(category) }}></div>
                    <span>{category}</span>
                  </div>
                ))}
                <div 
                  className={`dropdown-item add-new-tag ${isAddingNewTag ? 'editing' : ''}`}
                  onClick={!isAddingNewTag ? handleAddNewTag : undefined}
                >
                  <div className="category-indicator new-tag-indicator"></div>
                  {isAddingNewTag ? (
                    <input
                      ref={newTagInputRef}
                      type="text"
                      className="new-tag-input-inline"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={handleNewTagKeyDown}
                      onBlur={handleNewTagSubmit}
                      autoFocus
                    />
                  ) : (
                    <span>new tag</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="history-content">
        {dateKeys.length === 0 ? (
          <div className="empty-history">
            <p>No notes yet. Start capturing your thoughts!</p>
          </div>
        ) : (
          dateKeys.map((dateKey) => (
            <div key={dateKey} className="date-section">
              <h3 className="date-header">{dateKey}</h3>
              <div className="notes-list">
                {groupedNotes[dateKey].map((note) => (
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
                    {hoveredNoteId === note.id && (
                      <div 
                        className="more-icon-wrapper"
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
                              <span>Add to Fav</span>
                            </div>
                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); handleDelete(note); }}>
                              <img src={deleteIcon} alt="Delete" className="menu-icon" />
                              <span>Delete</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div 
                      className="note-category-indicator" 
                      style={{ backgroundColor: getCategoryColor(note.category) }}
                    ></div>
                    <span className="note-content">{note.content}</span>
                    <img src={detailIcon} alt="Detail" className="note-detail-icon" onClick={(e) => { e.stopPropagation(); onNoteClick(note); }} />
                  </div>
                ))}
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




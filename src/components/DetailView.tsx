import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { updateNote, deleteNote, getNotes } from '../utils/storage';
import { getCategoryColor, generateTagColor } from '../utils/colorGenerator';
import logoIcon from '../assets/logo.svg';
import backIcon from '../assets/back.svg';
import tagIcon from '../assets/tag.svg';
import dateIcon from '../assets/date.svg';
import calendarIcon from '../assets/calendar.svg';
import urlIcon from '../assets/url.svg';
import favIcon from '../assets/fav.svg';
import deleteIcon from '../assets/delete.svg';
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
  const [isAddingNewTag, setIsAddingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [deletedNote, setDeletedNote] = useState<Note | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const newTagInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:42',message:'getNotes error',data:{errorMessage:error instanceof Error ? error.message : String(error),hasError:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Error loading notes:', error);
    }
  };

  const getUniqueCategories = (): string[] => {
    const categories = new Set<string>();
    allNotes.forEach((n) => {
      if (n.category) {
        categories.add(n.category);
      }
    });
    return Array.from(categories).sort();
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
    setIsAddingNewTag(false);
    setNewTagName('');
    loadAllNotes(); // Reload to get updated categories
  };

  const handleAddNewTag = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailView.tsx:88',message:'handleAddNewTag called',data:{isTagDropdownOpen,isAddingNewTag:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setIsAddingNewTag(true);
    setTimeout(() => {
      newTagInputRef.current?.focus();
    }, 0);
  };

  const handleNewTagSubmit = async () => {
    if (newTagName.trim()) {
      const tagName = newTagName.trim();
      await handleTagChange(tagName);
    }
  };

  const handleNewTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewTagSubmit();
    } else if (e.key === 'Escape') {
      setIsAddingNewTag(false);
      setNewTagName('');
    }
  };

  const handleDescriptionSave = async () => {
    const updatedNote = { ...currentNote, description };
    await updateNote(updatedNote);
    setCurrentNote(updatedNote);
  };

  const handleDelete = async () => {
    await deleteNote(currentNote.id);
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
              <img src={favIcon} alt="Favorite" className="action-icon" />
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
                  {getUniqueCategories().map((category) => (
                    <div
                      key={category}
                      className="tag-dropdown-item"
                      onClick={() => handleTagChange(category)}
                    >
                      <div className="tag-indicator" style={{ backgroundColor: getCategoryColor(category) }}></div>
                      <span>{category}</span>
                    </div>
                  ))}
                  <div 
                    className={`tag-dropdown-item add-new-tag ${isAddingNewTag ? 'editing' : ''}`}
                    onClick={!isAddingNewTag ? handleAddNewTag : undefined}
                  >
                    <div className="tag-indicator new-tag-indicator"></div>
                    {isAddingNewTag ? (
                      <input
                        ref={newTagInputRef}
                        type="text"
                        className="new-tag-input-inline"
                        placeholder="add new page"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={handleNewTagKeyDown}
                        onBlur={handleNewTagSubmit}
                        autoFocus
                      />
                    ) : (
                      <span>new page</span>
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
    </div>
  );
};

export default DetailView;


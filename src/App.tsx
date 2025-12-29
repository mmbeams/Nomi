import React, { useState, useEffect, useRef, useCallback } from 'react';
import logoIcon from './assets/logo.svg';
import historyIcon from './assets/history.svg';
import calendarIcon from './assets/calendar.svg';
import enterIcon from './assets/enter.svg';
import { View, Note, BACKEND_URL, CATEGORY_COLORS } from './types';
import { saveNote, getNotes, updateNote, getUniqueCategories, addEmptyCategory, removeEmptyCategory } from './utils/storage';
import { getCategoryColor } from './utils/colorGenerator';
import History from './components/History';
import DetailView from './components/DetailView';

type Screen = 'empty' | 'withNote' | 'saved';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [screen, setScreen] = useState<Screen>('empty');
  const [noteText, setNoteText] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [fullUrl, setFullUrl] = useState<string>('');
  const [savedCategory, setSavedCategory] = useState<string>('Daily Life');
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:24',message:'App useEffect started',data:{hasChrome:!!chrome,hasChromeTabs:!!chrome?.tabs},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Get current tab URL
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:29',message:'chrome.tabs.query callback',data:{tabsLength:tabs?.length,firstTabUrl:tabs?.[0]?.url?.substring(0,50),chromeRuntimeError:chrome.runtime?.lastError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        if (tabs[0]?.url) {
          try {
            const url = new URL(tabs[0].url);
            setCurrentUrl(url.hostname);
            setFullUrl(tabs[0].url);
          } catch {
            setCurrentUrl('current page');
            setFullUrl('');
          }
        }
      });
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:40',message:'ERROR: chrome.tabs.query failed',data:{errorName:error instanceof Error ? error.name : typeof error,errorMessage:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }

    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNoteText(value);
    setScreen(value.trim() ? 'withNote' : 'empty');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && noteText.trim()) {
      handleSave();
    }
  };

  const categorizeNote = async (note: string): Promise<string> => {
    try {
      console.log('Categorizing note:', note);
      console.log('Backend URL:', `${BACKEND_URL}/api/categorize`);
      
      const response = await fetch(`${BACKEND_URL}/api/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to categorize: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Category received:', data.category);
      
      if (!data.category) {
        console.warn('No category in response, using fallback');
        throw new Error('No category in response');
      }
      
      return data.category;
    } catch (error) {
      console.error('Error categorizing note:', error);
      console.error('Error type:', error instanceof Error ? error.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      // Enhanced fallback: simple keyword-based categorization if backend is unavailable
      const lowerNote = note.toLowerCase();
      console.log('Using fallback categorization for:', note);
      
      if (lowerNote.includes('todo') || lowerNote.includes('task') || lowerNote.includes('do') || lowerNote.includes('pick up') || lowerNote.includes('call')) {
        console.log('Fallback: Todos');
        return 'Todos';
      } else if (lowerNote.includes('code') || lowerNote.includes('bug') || lowerNote.includes('dev') || lowerNote.includes('feature') || lowerNote.includes('programming')) {
        console.log('Fallback: Dev');
        return 'Dev';
      } else if (lowerNote.includes('idea') || lowerNote.includes('inspiration') || lowerNote.includes('inspo') || lowerNote.includes('creative')) {
        console.log('Fallback: Ideas');
        return 'Ideas';
      } else if (lowerNote.includes('work') || lowerNote.includes('meeting') || lowerNote.includes('project')) {
        console.log('Fallback: Work');
        return 'Work';
      } else if (lowerNote.includes('learn') || lowerNote.includes('study') || lowerNote.includes('course')) {
        console.log('Fallback: Learning');
        return 'Learning';
      }
      console.log('Fallback: Daily Life');
      return 'Daily Life'; // Default fallback
    }
  };

  const handleSave = async () => {
    if (noteText.trim() && !isSaving) {
      setIsSaving(true);
      const content = noteText.trim();
      
      try {
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

        // Categorize note
        const category = await categorizeNote(content);

        // Create note object
        const note: Note = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          content,
          category,
          created_at: Date.now(),
          source_url: sourceUrl,
        };

        // Save to storage
        await saveNote(note);

        // Update UI
        setSavedCategory(category);
        setSavedNoteId(note.id);
        setScreen('saved');
        setNoteText('');
        
        // Load all notes for category popup
        await loadAllNotes();
      } catch (error) {
        console.error('Error saving note:', error);
        // Still show saved state with fallback category
        setSavedCategory('Life');
        setSavedNoteId(null);
        setScreen('saved');
        setNoteText('');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRestart = () => {
    setScreen('empty');
    setNoteText('');
    inputRef.current?.focus();
  };

  const handleRestartKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRestart();
    }
  };

  useEffect(() => {
    if (screen !== 'saved') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setScreen('empty');
        setNoteText('');
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen]);

  const handleAddToCalendar = () => {
    if (noteText.trim()) {
      // Open Google Calendar with the note as event title
      const encodedTitle = encodeURIComponent(noteText.trim());
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}`;
      chrome.tabs.create({ url: calendarUrl });
    }
  };

  const getUniqueCategoriesList = async (): Promise<string[]> => {
    return await getUniqueCategories(allNotes);
  };

  const handleCategoryChange = async (newCategory: string) => {
    if (savedNoteId) {
      const notes = await getNotes();
      const note = notes.find(n => n.id === savedNoteId);
      if (note) {
        const updatedNote = { ...note, category: newCategory };
        await updateNote(updatedNote);
        setSavedCategory(newCategory);
        const updatedNotes = await getNotes();
        setAllNotes(updatedNotes);
      }
    }
    setShowCategoryPopup(false);
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setTimeout(() => {
      newCategoryInputRef.current?.focus();
    }, 0);
  };

  const loadAllNotes = async () => {
    const notes = await getNotes();
    setAllNotes(notes);
    const categories = await getUniqueCategories(notes);
    setUniqueCategories(categories);
  };

  const handleNewCategorySubmit = async () => {
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();
      await handleCategoryChange(categoryName);
      // Reload all notes to refresh categories
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryPopupRef.current && !categoryPopupRef.current.contains(event.target as Node)) {
        setShowCategoryPopup(false);
      }
    };

    if (showCategoryPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryPopup]);

  if (view === 'history') {
    return <History onBack={() => setView('landing')} onNoteClick={(note) => { setSelectedNote(note); setView('detail'); }} />;
  }

  if (view === 'detail' && selectedNote) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:210',message:'Rendering DetailView',data:{view,hasSelectedNote:!!selectedNote,noteId:selectedNote?.id,noteContent:selectedNote?.content?.substring(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return <DetailView note={selectedNote} onBack={() => setView('history')} />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="assistant-icon" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <img src={logoIcon} alt="Nomi assistant" />
          </div>
          <p className={`greeting ${screen === 'withNote' ? 'faded' : ''}`}>
            hi, i'm nomi.
          </p>
        </div>
      </div>

      <div className="main-content">
        {screen === 'saved' ? (
          <div className="saved-state">
            <div className="saved-message">
              <span className="checkmark">✓</span>
              <span className="saved-text">Saved to "{savedCategory}"</span>
            </div>
            <p 
              className="restart-hint"
              onClick={handleRestart}
              onKeyDown={handleRestartKeyDown}
              tabIndex={0}
            >
              <img src={enterIcon} alt="" className="enter-icon" />
              <span>Tap ENTER to restart</span>
            </p>
            <p 
              className="restart-hint"
              onClick={() => setShowCategoryPopup(true)}
              style={{ cursor: 'pointer', marginTop: '8px' }}
              tabIndex={0}
            >
              <span>Not in right place? Change Tag</span>
            </p>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              className="note-input"
              placeholder="Write down anything on mind…"
              value={noteText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <p className={`save-hint ${screen === 'withNote' ? 'faded' : ''}`}>
              <img src={enterIcon} alt="" className="enter-icon" />
              <span>Tap ENTER to save</span>
            </p>
          </>
        )}
      </div>

      <div className="footer">
        <button
          className={`calendar-button ${noteText.trim() ? 'active' : 'inactive'}`}
          onClick={handleAddToCalendar}
          disabled={!noteText.trim()}
        >
          <div className="calendar-icon">
            <img src={calendarIcon} alt="Calendar" />
          </div>
          <span className="calendar-text">Add to<br />Google Calendar</span>
        </button>
        <div 
          className="history-button"
          onClick={() => setView('history')}
          style={{ cursor: 'pointer' }}
        >
          <img src={historyIcon} alt="History" className="history-icon" />
        </div>
      </div>
      {showCategoryPopup && (
        <div className="category-popup-overlay">
          <div className="category-popup" ref={categoryPopupRef}>
            <div className="category-popup-header">
              <span>Change Tag</span>
            </div>
            <div className="category-popup-content">
              {uniqueCategories.map((category) => (
                <div
                  key={category}
                  className="tag-dropdown-item"
                  onClick={() => handleCategoryChange(category)}
                >
                  <div className="tag-indicator" style={{ backgroundColor: getCategoryColor(category) }}></div>
                  <span>{category}</span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default App;


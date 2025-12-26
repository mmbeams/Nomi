import React, { useState, useEffect, useRef } from 'react';
import logoIcon from './assets/logo.svg';
import historyIcon from './assets/history.svg';
import calendarIcon from './assets/calendar.svg';
import urlIcon from './assets/url.svg';
import saveIcon from './assets/save.svg';
import { View, Note, BACKEND_URL } from './types';
import { saveNote } from './utils/storage';
import History from './components/History';

type Screen = 'empty' | 'withNote' | 'saved';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [screen, setScreen] = useState<Screen>('empty');
  const [noteText, setNoteText] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [fullUrl, setFullUrl] = useState<string>('');
  const [savedCategory, setSavedCategory] = useState<string>('Daily Life');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to categorize: ${response.status}`);
      }

      const data = await response.json();
      console.log('Category received:', data.category);
      return data.category || 'Daily Life';
    } catch (error) {
      console.error('Error categorizing note:', error);
      console.error('Full error:', error);
      // Fallback: simple keyword-based categorization if backend is unavailable
      const lowerNote = note.toLowerCase();
      if (lowerNote.includes('todo') || lowerNote.includes('task') || lowerNote.includes('do') || lowerNote.includes('pick up')) {
        console.log('Fallback: Todos');
        return 'Todos';
      } else if (lowerNote.includes('code') || lowerNote.includes('bug') || lowerNote.includes('dev') || lowerNote.includes('feature')) {
        console.log('Fallback: Dev');
        return 'Dev';
      } else if (lowerNote.includes('idea') || lowerNote.includes('inspiration') || lowerNote.includes('inspo')) {
        console.log('Fallback: Ideas');
        return 'Ideas';
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
        setScreen('saved');
        setNoteText('');
      } catch (error) {
        console.error('Error saving note:', error);
        // Still show saved state with fallback category
        setSavedCategory('Daily Life');
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

  const handleAddToCalendar = () => {
    if (noteText.trim()) {
      // Open Google Calendar with the note as event title
      const encodedTitle = encodeURIComponent(noteText.trim());
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}`;
      chrome.tabs.create({ url: calendarUrl });
    }
  };

  if (view === 'history') {
    return <History onBack={() => setView('landing')} />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="assistant-icon" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <img src={logoIcon} alt="Nomi assistant" />
          </div>
          <p className={`greeting ${screen === 'withNote' ? 'faded' : ''}`}>
            hi, i'm Nomi, i'm here to<br />help organize your<br />thoughts
          </p>
        </div>
        <div className="header-right" onClick={() => setView('history')} style={{ cursor: 'pointer' }}>
          <div className="notes-icon">
            <img src={historyIcon} alt="Notes" />
          </div>
          <span className="notes-label">Notes</span>
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
              <img src={saveIcon} alt="" className="save-icon" />
              <span>Tap ENTER to restart</span>
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
              <img src={saveIcon} alt="" className="save-icon" />
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
          className="url-display"
          onClick={() => {
            if (fullUrl) {
              chrome.tabs.create({ url: fullUrl });
            } else {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url) {
                  chrome.tabs.create({ url: tabs[0].url });
                }
              });
            }
          }}
          style={{ cursor: fullUrl ? 'pointer' : 'default' }}
        >
          <img src={urlIcon} alt="External link" className="url-icon" />
          <span className="url-text">www.{currentUrl}</span>
        </div>
      </div>
    </div>
  );
};

export default App;


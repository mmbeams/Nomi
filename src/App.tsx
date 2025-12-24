import React, { useState, useEffect, useRef } from 'react';

type Screen = 'empty' | 'withNote' | 'saved';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('empty');
  const [noteText, setNoteText] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        try {
          const url = new URL(tabs[0].url);
          setCurrentUrl(url.hostname);
        } catch {
          setCurrentUrl('current page');
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

  const handleSave = () => {
    if (noteText.trim()) {
      // Save to storage (you can extend this later)
      chrome.storage.local.set({ lastNote: noteText.trim() }, () => {
        setScreen('saved');
        setNoteText('');
      });
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
    // TODO: Implement Google Calendar integration
    console.log('Add to Google Calendar:', noteText);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="assistant-icon">
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="8" width="28" height="14" stroke="currentColor" strokeWidth="2" fill="none" rx="2"/>
              <circle cx="10" cy="15" r="2" fill="currentColor"/>
              <circle cx="22" cy="15" r="2" fill="currentColor"/>
              <path d="M 8 6 Q 16 2 24 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={`greeting ${screen === 'withNote' ? 'faded' : ''}`}>
            Hi, I'm Nomi. I'm here to help organize your thoughts.
          </p>
        </div>
        <div className="header-right">
          <div className="notes-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h16v16H4V4z" fill="#FF9500" stroke="#000" strokeWidth="1.5"/>
              <path d="M16 4l4 4v12H4V4h12z" fill="#FF9500"/>
              <path d="M16 4v4h4" stroke="#000" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span className="notes-label">Notes</span>
        </div>
      </div>

      <div className="main-content">
        {screen === 'saved' ? (
          <div className="saved-state">
            <div className="saved-message">
              <span className="checkmark">✓</span>
              <span className="saved-text">Saved to "Daily Life"</span>
            </div>
            <p 
              className="restart-hint"
              onClick={handleRestart}
              onKeyDown={handleRestartKeyDown}
              tabIndex={0}
            >
              ← Tap ENTER to restart
            </p>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              className="note-input"
              placeholder="Write down anything on your mind…"
              value={noteText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <p className="save-hint">← Tap ENTER to save</p>
          </>
        )}
      </div>

      <div className="footer">
        <button
          className={`calendar-button ${screen === 'saved' ? 'active' : 'inactive'}`}
          onClick={handleAddToCalendar}
          disabled={screen !== 'saved'}
        >
          <div className="calendar-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="13" stroke="#4285F4" strokeWidth="1.5" fill="white" rx="1"/>
              <line x1="3" y1="8" x2="17" y2="8" stroke="#4285F4" strokeWidth="1.5"/>
              <text x="10" y="15" textAnchor="middle" fontSize="8" fill="#4285F4" fontWeight="bold">31</text>
            </svg>
          </div>
          <span>Add to Google Calendar</span>
        </button>
        <div className="url-display">
          <span className="url-text">www.{currentUrl}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M4 1h6v6M10 1L1 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default App;


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:7',message:'popup.tsx script loaded',data:{hasDocument:!!document,hasWindow:!!window,readyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
// #endregion

// #region agent log
const rootElement = document.getElementById('root');
fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:11',message:'Checking root element',data:{rootExists:!!rootElement,rootId:rootElement?.id,rootTagName:rootElement?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

if (!rootElement) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:15',message:'ERROR: root element not found',data:{documentBody:document.body?.innerHTML?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  throw new Error('Root element not found');
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:20',message:'Creating React root',data:{hasReact:!!React,hasReactDOM:!!ReactDOM},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

try {
  const root = ReactDOM.createRoot(rootElement);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:25',message:'React root created, rendering App',data:{rootCreated:!!root},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:33',message:'App render called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popup.tsx:36',message:'ERROR: React render failed',data:{errorName:error instanceof Error ? error.name : typeof error,errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  throw error;
}


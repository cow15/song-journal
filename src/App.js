import React from 'react';
import SongJournal from './SongJournal';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <SongJournal />
      </ErrorBoundary>
    </div>
  );
}

export default App;

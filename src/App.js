import React from 'react';
import SongDiary from './SongDiary';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <SongDiary />
      </ErrorBoundary>
    </div>
  );
}

export default App;

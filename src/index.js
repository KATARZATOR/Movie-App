import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { GenresProvider } from './GenresContext';
import { SessionProvider } from './SessionContext';
import MoviesList from './components/MoviesList';

const App = () => {
  return (
    <div className="main-page-container">
      <div className="main-page">
        <GenresProvider>
          <SessionProvider>
            <MoviesList />
          </SessionProvider>
        </GenresProvider>
      </div>
    </div>
  );
};

console.log(1);

const root = createRoot(document.getElementById('root'));
root.render(<App />);

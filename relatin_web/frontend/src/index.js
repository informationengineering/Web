import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import UserDetail from './UserDetail'; 
import FavoritesPage from './FavoritesPage';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/users/:id" element={<UserDetail />} /> {}
      <Route path="/favorites" element={<FavoritesPage />} />
    </Routes>
  </BrowserRouter>
);

/*import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import UserDetail from './UserDetail';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/users/:id" element={<UserDetail />} />
    </Routes>
  </BrowserRouter>
);*/

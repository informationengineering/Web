import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import UserDetail from './UserDetail'; 
import FavoritesPage from './FavoritesPage';
import { useAuth, AuthProvider } from './login';
import LoginPage from './LoginPage';
import ProfilePage from "./ProfilePage";
//import { AuthProvider, LoginPage } from './login'; // ✅ 加這行

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);


/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/users/:id" element={<UserDetail />} /> {}
      <Route path="/favorites" element={<FavoritesPage />} />*/
      //<Route path="/login" element={<LoginPage />} /> {/* ✅ 加這行 */}
//    </Routes>
//  </BrowserRouter>
//);

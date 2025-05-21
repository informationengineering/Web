import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './login';
import './style.css';

function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const favoritesKey = `favorites_${user.id}`;
    const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    setFavorites(savedFavorites);
  }, [user, navigate]);

  useEffect(() => {
    if (favorites.length === 0) {
      setUsers([]);
      return;
    }
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(u => favorites.includes(u.id.toString()));
        setUsers(filtered);
      })
      .catch(err => console.error('載入錯誤:', err));
  }, [favorites]);

  if (!user) return null; // 導向登入中不顯示內容

  return (
    <>
      <header>
        <h1>💾 我的收藏</h1>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: '#384aa5' }}>
          ← 返回首頁
        </Link>
      </header>

      <main>
        <div className="card-container">
          {users.length > 0 ? (
            users.map(user => (
              <Link key={user.id} to={`/users/${user.id}`} style={{ textDecoration: 'none' }}>
                <div className="profile-card">
                  <img src={user.image_url} alt={`${user.name}的大頭照`} />
                  <h2>{user.name}</h2>
                  <p className="gender">性別：{user.gender || '未填寫'}</p>
                  <p className="description">{user.description || '這個人很神秘～'}</p>
                </div>
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', marginTop: '40px' }}>目前沒有收藏的使用者。</p>
          )}
        </div>
      </main>
    </>
  );
}

export default FavoritesPage;


/*import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

function FavoritesPage() {
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(user => favorites.includes(user.id.toString()));
        setUsers(filtered);
      })
      .catch(err => console.error('載入錯誤:', err));
  }, [favorites]);

  return (
    <>
      <header>
        <h1>💾 我的收藏</h1>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: '#384aa5' }}>← 返回首頁</Link>
      </header>

      <main>
        <div className="card-container">
          {users.length > 0 ? (
            users.map(user => (
              <Link key={user.id} to={`/users/${user.id}`} style={{ textDecoration: 'none' }}>
                <div className="profile-card">
                  <img src={user.image_url} alt={`${user.name}的大頭照`} />
                  <h2>{user.name}</h2>
                  <p className="gender">性別：{user.gender || '未填寫'}</p>
                  <p className="description">{user.description || '這個人很神秘～'}</p>
                </div>
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', marginTop: '40px' }}>目前沒有收藏的使用者。</p>
          )}
        </div>
      </main>
    </>
  );
}

export default FavoritesPage;*/

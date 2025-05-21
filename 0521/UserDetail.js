import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './login'; // 取得登入資訊
import './style.css';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { user: currentUser } = useAuth(); // 目前登入使用者
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3002/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('載入錯誤:', err));
  }, [id]);

  useEffect(() => {
    if (!currentUser) {
      setIsFavorite(false);
      return;
    }
    const favoritesKey = `favorites_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    setIsFavorite(favorites.includes(id));
  }, [id, currentUser]);

  const toggleFavorite = () => {
    if (!currentUser) {
      alert('請先登入才能收藏');
      return;
    }
    const favoritesKey = `favorites_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    let updatedFavorites;

    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      updatedFavorites = [...favorites, id];
      setIsFavorite(true);
    }

    localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
  };

  if (!user) return <p style={{ textAlign: 'center', paddingTop: '50px' }}>載入中...</p>;

  return (
    <>
      <header>
        <h1>交友平台</h1>
        {/* 移除搜尋欄位，故此處不放 input */}
      </header>

      <div className="wrapper">
        <main className="main">
          <article className="profile">
            <figure className="photo">
              <img src={user.image_url} alt={`${user.name}的大頭照`} />
            </figure>
            <div className="info">
              <h2>{user.name}</h2>
              {/* 將 description 改為 intro */}
              <p className="description">{user.intro || '這個人很神秘～'}</p>
              <p className="description">性別：{user.gender || '未填寫'}</p>
              <p className="description">Email：{user.email}</p>

              <button
                onClick={toggleFavorite}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  background: isFavorite ? '#ff69b4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isFavorite ? '💖 已收藏' : '🤍 加入收藏'}
              </button>

              <div style={{ marginTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#384aa5' }}>
                  ← 返回首頁
                </Link>
              </div>
              <div style={{ marginTop: '10px' }}>
                <Link to="/favorites" style={{ textDecoration: 'none', color: '#384aa5' }}>
                  💾 我的收藏
                </Link>
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}

export default UserDetail;

/*import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './login'; // 取得登入資訊
import './style.css';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { user: currentUser } = useAuth(); // 目前登入使用者
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3002/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('載入錯誤:', err));
  }, [id]);

  useEffect(() => {
    if (!currentUser) {
      setIsFavorite(false);
      return;
    }
    const favoritesKey = `favorites_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    setIsFavorite(favorites.includes(id));
  }, [id, currentUser]);

  const toggleFavorite = () => {
    if (!currentUser) {
      alert('請先登入才能收藏');
      return;
    }
    const favoritesKey = `favorites_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    let updatedFavorites;

    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      updatedFavorites = [...favorites, id];
      setIsFavorite(true);
    }

    localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
  };

  if (!user) return <p style={{ textAlign: 'center', paddingTop: '50px' }}>載入中...</p>;

  return (
    <>
      <header>
        <h1>交友平台</h1>
        <input type="text" id="searchInput" placeholder="搜尋名字或介紹..." disabled />
      </header>

      <div className="wrapper">
        <main className="main">
          <article className="profile">
            <figure className="photo">
              <img src={user.image_url} alt={`${user.name}的大頭照`} />
            </figure>
            <div className="info">
              <h2>{user.name}</h2>
              <p className="description">{user.description || '這個人很神秘～'}</p>
              <p className="description">性別：{user.gender || '未填寫'}</p>
              <p className="description">Email：{user.email}</p>

              <button
                onClick={toggleFavorite}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  background: isFavorite ? '#ff69b4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isFavorite ? '💖 已收藏' : '🤍 加入收藏'}
              </button>

              <div style={{ marginTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#384aa5' }}>
                  ← 返回首頁
                </Link>
              </div>
              <div style={{ marginTop: '10px' }}>
                <Link to="/favorites" style={{ textDecoration: 'none', color: '#384aa5' }}>
                  💾 我的收藏
                </Link>
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}

export default UserDetail;*/

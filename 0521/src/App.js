import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login'; // ⭐ 使用登入狀態
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth(); // ⭐ 取得登入資訊與登出函式

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  // 修正排除自己條件
  const filteredUsers = users.filter(u => {
    const keyword = search.trim().toLowerCase();
    const notSelf = !user || u.id !== user.id; // 排除自己
    return notSelf && (
      u.name.toLowerCase().includes(keyword) ||
      (u.description && u.description.toLowerCase().includes(keyword))
    );
  });

  return (
    <>
      <header style={{ position: 'relative', padding: '10px 20px', borderBottom: '1px solid #ccc' }}>
        <h1>交友平台</h1>
        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
          {user ? (
            <>
              <span>歡迎，{user.name}</span>
              <button onClick={logout} style={{ marginLeft: '10px' }}>登出</button>
            </>
          ) : (
            <Link to="/login">
              <button>登入</button>
            </Link>
          )}
        </div>
      </header>

      {/* 以下排版不動，保留你原本的內容 */}
      <main>
        <div className="card-container" id="cardContainer">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
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
            <p style={{ textAlign: 'center', marginTop: '40px' }}>找不到符合的使用者。</p>
          )}
        </div>
      </main>
    </>
  );
}

export default App;


/*import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login'; // ⭐ 使用登入狀態
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth(); // ⭐ 取得登入資訊與登出函式

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  // 修正排除自己條件
  const filteredUsers = users.filter(u => {
    const keyword = search.trim().toLowerCase();
    const notSelf = !user || u.id !== user.id; // 排除自己
    return notSelf && (
      u.name.toLowerCase().includes(keyword) ||
      (u.description && u.description.toLowerCase().includes(keyword))
    );
  });

  return (
    <>
      <header style={{ position: 'relative', padding: '10px 20px', borderBottom: '1px solid #ccc' }}>
        <h1>交友平台</h1>
        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
          {user ? (
            <>
              <span>歡迎，{user.name}</span>
              <button onClick={logout} style={{ marginLeft: '10px' }}>登出</button>
            </>
          ) : (
            <Link to="/login">
              <button>登入</button>
            </Link>
          )}
        </div>
      </header>

/*      <main>
        <div className="card-container" id="cardContainer">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
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
            <p style={{ textAlign: 'center', marginTop: '40px' }}>找不到符合的使用者。</p>
          )}
        </div>
      </main>
    </>
  );
}

export default App;*/
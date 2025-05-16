import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  const filteredUsers = users.filter(user => {
    const keyword = search.trim().toLowerCase();
    return (
      user.name.toLowerCase().includes(keyword) ||
      (user.description && user.description.toLowerCase().includes(keyword))
    );
  });

  return (
    <>
      <header>
        <h1>交友平台</h1>
        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>

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
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.includes(search) || (user.description || '').includes(search)
  );

  return (
    <>
      <header>
        <h1>交友平台</h1>
        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>

      <main>
        <div className="card-container" id="cardContainer">
          {filteredUsers.map(user => (
            <Link key={user.id} to={`/users/${user.id}`} style={{ textDecoration: 'none' }}>
              <div className="profile-card">
                <img src={user.image_url} alt={`${user.name}的大頭照`} />
                <h2>{user.name}</h2>
                <p className="gender">性別：{user.gender || '未填寫'}</p>
                <p className="description">{user.description || '這個人很神秘～'}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export default App;*/

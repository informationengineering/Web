import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login';
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 鈴鐺符號 state，預設是 🔔
  const [bellIcon, setBellIcon] = useState('🔔');

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  useEffect(() => {
    if (!user) {
      setMatchedUsers([]);
      setBellIcon('🔔');
      return;
    }

    const favoritesKey = `favorites_${user.id}`;
    // 將收藏ID都轉成字串
    const myFavorites = (JSON.parse(localStorage.getItem(favoritesKey)) || []).map(id => id.toString());

    // 找出雙方互相收藏的使用者，ID皆轉字串比較
    const matched = myFavorites.filter(favId => {
      const otherFavoritesKey = `favorites_${favId}`;
      const otherFavorites = (JSON.parse(localStorage.getItem(otherFavoritesKey)) || []).map(id => id.toString());
      return otherFavorites.includes(user.id.toString());
    });

    const matchedFullUsers = users.filter(u => matched.includes(u.id.toString()));

    setMatchedUsers(matchedFullUsers);

    // 配對成功且配對清單未開啟時，鈴鐺變 📢
    if (matchedFullUsers.length > 0 && !showMatches) {
      setBellIcon('📢');
    } else {
      setBellIcon('🔔');
    }
  }, [user, users, showMatches]);

  const filteredUsers = users.filter(u => {
    const keyword = search.trim().toLowerCase();
    const notSelf = !user || u.id !== user.id;
    return notSelf && (
      u.name.toLowerCase().includes(keyword) ||
      (u.description && u.description.toLowerCase().includes(keyword))
    );
  });

  const handleBellClick = () => {
    if (!user) {
      setErrorMsg('請先登入才能收藏');
      setShowMatches(false);
      return;
    }
    setErrorMsg('');
    setShowMatches(!showMatches);

    // 點開配對清單後，鈴鐺恢復 🔔
    if (!showMatches) {
      setBellIcon('🔔');
    }
  };

  return (
    <>
      <header style={{ position: 'relative', padding: '20px 0', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
        {/* 鈴鐺 */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            cursor: 'pointer',
            zIndex: 100,
            fontSize: '24px',
            userSelect: 'none',
          }}
          onClick={handleBellClick}
          aria-label="配對通知"
        >
          {bellIcon}
          {matchedUsers.length > 0 && bellIcon === '🔔' && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '10px',
                height: '10px',
                backgroundColor: 'red',
                borderRadius: '50%',
              }}
            />
          )}
        </div>

        <h1 style={{ margin: 0 }}>交友平台</h1>

        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginTop: '10px', padding: '5px 10px', width: '300px', maxWidth: '90%' }}
        />

        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          {user ? (
            <>
              <span>歡迎，{user.name}</span>
              <button onClick={logout} style={{ marginLeft: '10px' }}>
                登出
              </button>
            </>
          ) : (
            <Link to="/login">
              <button>登入</button>
            </Link>
          )}
        </div>
      </header>

      {/* 顯示錯誤訊息 */}
      {errorMsg && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          {errorMsg}
        </div>
      )}

      {/* 配對清單彈窗 */}
      {showMatches && (
        <div
          style={{
            position: 'absolute',
            top: '90px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '10px',
            width: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <h3>配對成功</h3>
          {matchedUsers.length === 0 ? (
            <p>目前沒有配對成功的使用者。</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {matchedUsers.map(mu => (
                <li key={mu.id} style={{ marginBottom: '8px' }}>
                  <Link
                    to={`/users/${mu.id}`}
                    onClick={() => setShowMatches(false)}
                    style={{ textDecoration: 'none', color: '#384aa5' }}
                  >
                    {mu.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
import { useAuth } from './login';
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 鈴鐺符號 state，預設是 🔔
  const [bellIcon, setBellIcon] = useState('🔔');

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  useEffect(() => {
    if (!user) {
      setMatchedUsers([]);
      setBellIcon('🔔');
      return;
    }

    const favoritesKey = `favorites_${user.id}`;
    const myFavorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];

    const matched = myFavorites.filter(favId => {
      const otherFavoritesKey = `favorites_${favId}`;
      const otherFavorites = JSON.parse(localStorage.getItem(otherFavoritesKey)) || [];
      return otherFavorites.includes(user.id);
    });

    const matchedFullUsers = users.filter(u => matched.includes(u.id.toString()));

    setMatchedUsers(matchedFullUsers);

    // 配對成功且配對清單未開啟時，鈴鐺變 📢
    if (matchedFullUsers.length > 0 && !showMatches) {
      setBellIcon('📢');
    } else {
      setBellIcon('🔔');
    }
  }, [user, users, showMatches]);

  const filteredUsers = users.filter(u => {
    const keyword = search.trim().toLowerCase();
    const notSelf = !user || u.id !== user.id;
    return notSelf && (
      u.name.toLowerCase().includes(keyword) ||
      (u.description && u.description.toLowerCase().includes(keyword))
    );
  });

  const handleBellClick = () => {
    if (!user) {
      setErrorMsg('請先登入才能查看通知');
      setShowMatches(false);
      return;
    }
    setErrorMsg('');
    setShowMatches(!showMatches);

    // 點開配對清單後，鈴鐺恢復 🔔
    if (!showMatches) {
      setBellIcon('🔔');
    }
  };

  return (
    <>
      <header style={{ position: 'relative', padding: '20px 0', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
        
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            cursor: 'pointer',
            zIndex: 100,
            fontSize: '24px',
            userSelect: 'none',
          }}
          onClick={handleBellClick}
          aria-label="配對通知"
        >
          {bellIcon}
          {matchedUsers.length > 0 && bellIcon === '🔔' && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '10px',
                height: '10px',
                backgroundColor: 'red',
                borderRadius: '50%',
              }}
            />
          )}
        </div>

        <h1 style={{ margin: 0 }}>交友平台</h1>

        <input
          type="text"
          id="searchInput"
          placeholder="搜尋名字或介紹..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginTop: '10px', padding: '5px 10px', width: '300px', maxWidth: '90%' }}
        />

        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          {user ? (
            <>
              <span>歡迎，{user.name}</span>
              <button onClick={logout} style={{ marginLeft: '10px' }}>
                登出
              </button>
            </>
          ) : (
            <Link to="/login">
              <button>登入</button>
            </Link>
          )}
        </div>
      </header>

      
      {errorMsg && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          {errorMsg}
        </div>
      )}

      
      {showMatches && (
        <div
          style={{
            position: 'absolute',
            top: '90px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '10px',
            width: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <h3>配對成功</h3>
          {matchedUsers.length === 0 ? (
            <p>目前沒有配對成功的使用者。</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {matchedUsers.map(mu => (
                <li key={mu.id} style={{ marginBottom: '8px' }}>
                  <Link
                    to={`/users/${mu.id}`}
                    onClick={() => setShowMatches(false)}
                    style={{ textDecoration: 'none', color: '#384aa5' }}
                  >
                    {mu.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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

export default App;*/

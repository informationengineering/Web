import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login';
import ChatModal from './ChatModal';
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 聊天視窗狀態
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // 是否有新通知（配對或未讀訊息）
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  // 取得配對清單
  useEffect(() => {
    if (!user) {
      setMatchedUsers([]);
      setHasNewNotification(false);
      return;
    }

    const favoritesKey = `favorites_${user.id}`;
    const myFavorites = (JSON.parse(localStorage.getItem(favoritesKey)) || []).map(id => id.toString());

    const matched = myFavorites.filter(favId => {
      const otherFavoritesKey = `favorites_${favId}`;
      const otherFavorites = (JSON.parse(localStorage.getItem(otherFavoritesKey)) || []).map(id => id.toString());
      return otherFavorites.includes(user.id.toString());
    });

    const matchedFullUsers = users.filter(u => matched.includes(u.id.toString()));

    setMatchedUsers(matchedFullUsers);

    // 判斷是否有未讀訊息
    const hasUnreadMessage = matchedFullUsers.some(mu => {
      return localStorage.getItem(`unread_${user.id}_${mu.id}`) === "true";
    });

    // 如果有新配對或未讀訊息，且配對清單和聊天視窗都沒開，顯示通知
    if ((matchedFullUsers.length > 0 || hasUnreadMessage) && !showMatches && !chatOpen) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [user, users, showMatches, chatOpen]);

  const filteredUsers = users.filter(u => {
    const keyword = search.trim().toLowerCase();
    const notSelf = !user || u.id !== user.id;
    return notSelf && (
      u.name.toLowerCase().includes(keyword) ||
      (u.description && u.description.toLowerCase().includes(keyword))
    );
  });

  // 點擊鈴鐺
  const handleBellClick = () => {
    if (!user) {
      setErrorMsg('請先登入才能收藏');
      setShowMatches(false);
      return;
    }
    setErrorMsg('');
    // 切換配對清單顯示狀態
    const newShowMatches = !showMatches;
    setShowMatches(newShowMatches);

    // 使用者點開配對清單，清除通知（如果沒有未讀訊息）
    if (newShowMatches) {
      // 只要點開配對清單，就先清除通知
      setHasNewNotification(false);
    }
  };

  // 判斷是否有未讀訊息
  const hasUnread = (targetId) => {
    if (!user) return false;
    return localStorage.getItem(`unread_${user.id}_${targetId}`) === "true";
  };

  // 開啟聊天視窗
  const openChat = (targetId, targetName) => {
    setChatTarget({ id: targetId, name: targetName });
    setChatOpen(true);
    // 點開聊天視窗時清除通知
    setHasNewNotification(false);
  };

  // 關閉聊天視窗
  const closeChat = () => setChatOpen(false);

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
          {/* 根據 hasNewNotification 顯示鈴鐺 */}
          {hasNewNotification ? '📢' : '🔔'}
          {matchedUsers.length > 0 && !hasNewNotification && (
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
                <li key={mu.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    to={`/users/${mu.id}`}
                    onClick={() => setShowMatches(false)}
                    style={{ textDecoration: 'none', color: '#384aa5' }}
                  >
                    {mu.name}
                  </Link>
                  <button
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}
                    onClick={() => openChat(mu.id, mu.name)}
                  >
                    {hasUnread(mu.id) ? '💌' : '💬'}
                  </button>
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

      <ChatModal
        open={chatOpen}
        onClose={closeChat}
        currentUserId={user?.id}
        targetUserId={chatTarget?.id}
        targetUserName={chatTarget?.name}
      />
    </>
  );
}

export default App;


/*import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login';
import ChatModal from './ChatModal'; // 請確保你有建立 ChatModal.js
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

  // 聊天視窗狀態
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

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
    const myFavorites = (JSON.parse(localStorage.getItem(favoritesKey)) || []).map(id => id.toString());

    const matched = myFavorites.filter(favId => {
      const otherFavoritesKey = `favorites_${favId}`;
      const otherFavorites = (JSON.parse(localStorage.getItem(otherFavoritesKey)) || []).map(id => id.toString());
      return otherFavorites.includes(user.id.toString());
    });

    const matchedFullUsers = users.filter(u => matched.includes(u.id.toString()));

    setMatchedUsers(matchedFullUsers);

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

    if (!showMatches) {
      setBellIcon('🔔');
    }
  };

  // 判斷是否有未讀訊息
  const hasUnread = (targetId) => {
    if (!user) return false;
    return localStorage.getItem(`unread_${user.id}_${targetId}`) === "true";
  };

  // 開啟聊天視窗
  const openChat = (targetId, targetName) => {
    setChatTarget({ id: targetId, name: targetName });
    setChatOpen(true);
  };

  // 關閉聊天視窗
  const closeChat = () => setChatOpen(false);

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
                <li key={mu.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    to={`/users/${mu.id}`}
                    onClick={() => setShowMatches(false)}
                    style={{ textDecoration: 'none', color: '#384aa5' }}
                  >
                    {mu.name}
                  </Link>
                  <button
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}
                    onClick={() => openChat(mu.id, mu.name)}
                  >
                    {hasUnread(mu.id) ? '💌' : '💬'}
                  </button>
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

      <ChatModal
        open={chatOpen}
        onClose={closeChat}
        currentUserId={user?.id}
        targetUserId={chatTarget?.id}
        targetUserName={chatTarget?.name}
      />
    </>
  );
}

export default App;*/

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './login';
import ChatModal from './ChatModal';
import './style.css';
import apiRequest from './utils/api';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout, apiRequest } = useAuth();

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  // 聊天視窗狀態
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // 載入用戶列表
  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  // 載入配對列表
  useEffect(() => {
    const loadMatches = async () => {
      if (!user) {
        setMatchedUsers([]);
        return;
      }

      try {
        const response = await apiRequest('/matches');
        if (response.ok) {
          const matches = await response.json();
          setMatchedUsers(matches);
        }
      } catch (error) {
        console.error('載入配對列表失敗:', error);
      }
    };

    loadMatches();
  }, [user, apiRequest]);

  // 載入未讀訊息數量
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (!user) {
        setUnreadCounts({});
        return;
      }

      try {
        const response = await apiRequest('/chat/unread');
          if (response.ok) {
            const counts = await response.json();
            console.log('API response:', counts);//
            const countsMap = {};
            if (Array.isArray(counts)) {
              counts.forEach(item => {
                // 根據你的 mu.id 型別決定
                countsMap[item.sender_id.toString()] = item.unread_count; // 如果 mu.id 是字串
                //countsMap[Number(item.sender_id)] = item.unread_count; // 如果 mu.id 是數字
            });
          } else {
            console.error('未讀訊息回傳格式錯誤', counts);
          }
          console.log('unreadCounts:', countsMap);//
          setUnreadCounts(countsMap);
        }

      } catch (error) {
        console.error('載入未讀訊息失敗:', error);
      }
    };

    loadUnreadCounts();

    // 每30秒檢查一次未讀訊息
    const interval = setInterval(loadUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [user, apiRequest]);

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
      setErrorMsg('請先登入才能查看配對');
      setShowMatches(false);
      return;
    }
    setErrorMsg('');
    setShowMatches(!showMatches);
  };

  // ✅ 修正版：開啟聊天視窗前先建立聊天室
  const openChat = async (targetId, targetName) => {
    try {
      await apiRequest('/chat_rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user2_id: targetId })
      });
    } catch (error) {
      console.error('建立聊天室失敗:', error);
      alert('建立聊天室失敗，請稍後再試');
      return;
    }
    setChatTarget({ id: targetId, name: targetName });
    setChatOpen(true);
  };

  // 關閉聊天視窗
  const closeChat = () => {
    setChatOpen(false);
    // 重新載入未讀訊息數量
    if (user) {
      apiRequest('/chat/unread')
        .then(response => response.json())
        .then(counts => {
          const countsMap = {};
          if (Array.isArray(counts)) {
            counts.forEach(item => {
              countsMap[item.sender_id] = item.unread_count;
            });
          } else {
            console.error('未讀訊息回傳格式錯誤', counts);
          }
          setUnreadCounts(countsMap);
        });
    }
  };

  const hasNewNotification = matchedUsers.length > 0 || Object.keys(unreadCounts).length > 0;

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
          {hasNewNotification ? '📢' : '🔔'}
          {hasNewNotification && (
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

        <div style={{ position: 'absolute', top: '20px', right: '20px', textAlign: 'right' }}>
          {user ? (
            <>
              <div>
                <span>歡迎，{user.name}</span>
                <button onClick={logout} style={{ marginLeft: '10px' }}>
                  登出
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <Link to="/profile">
                  <button>個人主頁</button>
                </Link>
              </div>
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
                    {unreadCounts[mu.id] ? '💌' : '💬'}
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
                  <img 
                    src={user.image_url || '/default-avatar.png'} 
                    alt={`${user.name}的大頭照`}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
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
import ChatModal from './ChatModal';
import './style.css';

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout, apiRequest } = useAuth();

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  // 聊天視窗狀態
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // 載入用戶列表
  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('載入失敗:', err));
  }, []);

  // 載入配對列表
  useEffect(() => {
    const loadMatches = async () => {
      if (!user) {
        setMatchedUsers([]);
        return;
      }

      try {
        const response = await apiRequest('/matches');
        if (response.ok) {
          const matches = await response.json();
          setMatchedUsers(matches);
        }
      } catch (error) {
        console.error('載入配對列表失敗:', error);
      }
    };

    loadMatches();
  }, [user, apiRequest]);

  // 載入未讀訊息數量
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (!user) {
        setUnreadCounts({});
        return;
      }

      try {
        const response = await apiRequest('/chat/unread');
        if (response.ok) {
          const counts = await response.json();
          const countsMap = {};
          if (Array.isArray(counts)) {
            counts.forEach(item => {
              countsMap[item.sender_id] = item.unread_count;
            });
          } else {
            console.error('未讀訊息回傳格式錯誤', counts);
          }
          setUnreadCounts(countsMap);
        }

      } catch (error) {
        console.error('載入未讀訊息失敗:', error);
      }
    };

    loadUnreadCounts();
    
    // 每30秒檢查一次未讀訊息
    const interval = setInterval(loadUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [user, apiRequest]);

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
      setErrorMsg('請先登入才能查看配對');
      setShowMatches(false);
      return;
    }
    setErrorMsg('');
    setShowMatches(!showMatches);
  };

  // 開啟聊天視窗
  const openChat = (targetId, targetName) => {
    setChatTarget({ id: targetId, name: targetName });
    setChatOpen(true);
  };

  // 關閉聊天視窗
  const closeChat = () => {
    setChatOpen(false);
    // 重新載入未讀訊息數量
    if (user) {
      apiRequest('/chat/unread')
        .then(response => response.json())
        .then(counts => {
          const countsMap = {};
          if (Array.isArray(counts)) {
            counts.forEach(item => {
              countsMap[item.sender_id] = item.unread_count;
            });
          } else {
            console.error('未讀訊息回傳格式錯誤', counts);
          }
          setUnreadCounts(countsMap);
        });
    }
  };

  const hasNewNotification = matchedUsers.length > 0 || Object.keys(unreadCounts).length > 0;

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
          {hasNewNotification ? '📢' : '🔔'}
          {hasNewNotification && (
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

        <div style={{ position: 'absolute', top: '20px', right: '20px', textAlign: 'right' }}>
          {user ? (
            <>
              <div>
                <span>歡迎，{user.name}</span>
                <button onClick={logout} style={{ marginLeft: '10px' }}>
                  登出
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <Link to="/profile">
                  <button>個人主頁</button>
                </Link>
              </div>
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
                    {unreadCounts[mu.id] ? '💌' : '💬'}
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
                  <img 
                    src={user.image_url || '/default-avatar.png'} 
                    alt={`${user.name}的大頭照`}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
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
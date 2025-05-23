import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './login';
import './style.css';
import './UserDetail.css';
import ChatModal from './ChatModal';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { user: currentUser, apiRequest } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3002/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('載入錯誤:', err));
  }, [id]);

  // 檢查是否為最愛
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await apiRequest(`/favorites/check/${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('檢查最愛狀態失敗:', error);
      }
    };

    checkFavoriteStatus();
  }, [id, currentUser, apiRequest]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert('請先登入才能收藏');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/favorites', {
        method: 'POST',
        body: JSON.stringify({ favorite_user_id: parseInt(id) })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } else {
        const error = await response.json();
        alert(error.error || '操作失敗');
      }
    } catch (error) {
      console.error('切換最愛狀態失敗:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 開啟聊天室
  /*const handleChatClick = async () => {
    try {
      // 建立聊天室（若已存在後端會自動忽略）
      await apiRequest('/chat_rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user2_id: parseInt(id) })
      });
      // 開啟聊天視窗
      setChatModalOpen(true);
    } catch (error) {
      alert('建立聊天室失敗，請稍後再試');
      console.error(error);
    }
  };*/

  if (!user) return <p style={{ textAlign: 'center', paddingTop: '50px' }}>載入中...</p>;

  return (
    <>
      <header>
        <h1>交友平台</h1>
      </header>

      <div className="wrapper">
        <main className="main">
          <article className="profile">
            <figure className="photo">
              <img 
                src={user.image_url || '/default-avatar.png'} 
                alt={`${user.name}的大頭照`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </figure>
            <div className="info">
              <h2>{user.name}</h2>
              <p className="description">{user.intro || '這個人很神秘～'}</p>
              <p className="description">性別：{user.gender || '未填寫'}</p>
              
              <button
                onClick={toggleFavorite}
                disabled={isLoading}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  background: isFavorite ? '#ff69b4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? '處理中...' : (isFavorite ? '💖 已收藏' : '🤍 加入收藏')}
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

      {/* 聊天視窗元件 */}
      {chatModalOpen && (
        <ChatModal
          open={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          currentUserId={currentUser?.id}
          targetUserId={parseInt(id)}
          targetUserName={user.name}
        />
      )}
    </>
  );
}

export default UserDetail;


/*import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './login';
import './style.css';
import './UserDetail.css';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { user: currentUser, apiRequest } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3002/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('載入錯誤:', err));
  }, [id]);

  // 檢查是否為最愛
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await apiRequest(`/favorites/check/${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('檢查最愛狀態失敗:', error);
      }
    };

    checkFavoriteStatus();
  }, [id, currentUser, apiRequest]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert('請先登入才能收藏');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/favorites', {
        method: 'POST',
        body: JSON.stringify({ favorite_user_id: parseInt(id) })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } else {
        const error = await response.json();
        alert(error.error || '操作失敗');
      }
    } catch (error) {
      console.error('切換最愛狀態失敗:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <p style={{ textAlign: 'center', paddingTop: '50px' }}>載入中...</p>;

  return (
    <>
      <header>
        <h1>交友平台</h1>
      </header>

      <div className="wrapper">
        <main className="main">
          <article className="profile">
            <figure className="photo">
              <img 
                src={user.image_url || '/default-avatar.png'} 
                alt={`${user.name}的大頭照`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </figure>
            <div className="info">
              <h2>{user.name}</h2>
              <p className="description">{user.intro || '這個人很神秘～'}</p>
              <p className="description">性別：{user.gender || '未填寫'}</p>
              
              <button
                onClick={toggleFavorite}
                disabled={isLoading}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  background: isFavorite ? '#ff69b4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? '處理中...' : (isFavorite ? '💖 已收藏' : '🤍 加入收藏')}
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
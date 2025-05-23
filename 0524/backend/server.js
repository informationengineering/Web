const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'datingapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: '需要登入' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(401).json({ error: '用戶不存在' });
    req.user = users[0];
    next();
  } catch {
    return res.status(403).json({ error: 'Token 無效' });
  }
};

// ✅ 登入（明碼比對）
app.post('/login', async (req, res) => {
  try {
    const { account, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE account = ?', [account]);

    if (users.length === 0) return res.status(401).json({ error: '帳號或密碼錯誤' });

    const user = users[0];
    const isPasswordValid = password === user.password;

    console.log('帳號輸入:', account);
    console.log('密碼輸入:', password);
    console.log('資料庫帳號:', user.account);
    console.log('資料庫密碼:', user.password);
    console.log('比對結果:', isPasswordValid);

    if (!isPasswordValid) return res.status(401).json({ error: '帳號或密碼錯誤' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error('登入錯誤:', err);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 註冊
app.post('/register', async (req, res) => {
  try {
    const { account, password, name, email } = req.body;
    // 直接存明碼
    //const hashedPassword = password;
    await pool.query(
      'INSERT INTO users (account, password, name, email) VALUES (?, ?, ?, ?)',
      [account, password, name, email]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});


// 獲取所有用戶（公開資料）
app.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, image_url, gender, description FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('獲取用戶列表錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取單一用戶詳細資料
app.get('/users/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, image_url, gender, description, intro, email FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('獲取用戶詳細資料錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 更新用戶資料（需要登入）
app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // 確保只能修改自己的資料
    if (req.user.id !== userId) {
      return res.status(403).json({ error: '沒有權限修改此用戶資料' });
    }

    const { name, gender, email, description, intro, account, password, imageData } = req.body;
    
    let updateFields = [];
    let values = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(gender);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (intro !== undefined) {
      updateFields.push('intro = ?');
      values.push(intro);
    }
    if (account !== undefined) {
      // 檢查帳號是否已被其他用戶使用
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE account = ? AND id != ?',
        [account, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: '帳號已被使用' });
      }
      updateFields.push('account = ?');
      values.push(account);
    }
    if (password !== undefined && password.trim() !== '') {
      updateFields.push('password = ?');
      values.push(password);
    }
    if (imageData !== undefined) {
      updateFields.push('image_url = ?');
      values.push(imageData);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '沒有提供要更新的資料' });
    }

    values.push(userId);
    
    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );


    // 返回更新後的用戶資料（不包含密碼）
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, image_url, gender, description, intro, account FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUser[0]);

  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// === 我的最愛相關 API ===

// 獲取我的最愛列表
app.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await pool.query(`
      SELECT u.id, u.name, u.image_url, u.gender, u.description, f.created_at
      FROM favorites f
      JOIN users u ON f.favorite_user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`
    , [req.user.id]);

    res.json(favorites);
  } catch (error) {
    console.error('獲取最愛列表錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 新增/移除最愛
app.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { favorite_user_id } = req.body;
    
    if (!favorite_user_id || favorite_user_id === req.user.id) {
      return res.status(400).json({ error: '無效的用戶ID' });
    }

    // 檢查是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND favorite_user_id = ?',
      [req.user.id, favorite_user_id]
    );

    if (existing.length > 0) {
      // 移除最愛
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND favorite_user_id = ?',
        [req.user.id, favorite_user_id]
      );
      res.json({ action: 'removed', isFavorite: false });
    } else {
      // 新增最愛
      await pool.query(
        'INSERT INTO favorites (user_id, favorite_user_id) VALUES (?, ?)',
        [req.user.id, favorite_user_id]
      );
      res.json({ action: 'added', isFavorite: true });
    }

  } catch (error) {
    console.error('處理最愛錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 檢查是否為最愛
app.get('/favorites/check/:userId', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND favorite_user_id = ?',
      [req.user.id, req.params.userId]
    );

    res.json({ isFavorite: result.length > 0 });
  } catch (error) {
    console.error('檢查最愛狀態錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// === 配對相關 API ===
// 獲取配對列表
app.get('/matches', authenticateToken, async (req, res) => {
  try {
    const [matches] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.image_url, u.gender, u.description
      FROM users u
      WHERE u.id IN (
        SELECT CASE 
          WHEN f1.user_id = ? THEN f1.favorite_user_id 
          ELSE f1.user_id 
        END
        FROM favorites f1
        WHERE (f1.user_id = ? OR f1.favorite_user_id = ?)
        AND EXISTS (
          SELECT 1 FROM favorites f2 
          WHERE (f2.user_id = f1.favorite_user_id AND f2.favorite_user_id = f1.user_id)
        )
      )
    `, [req.user.id, req.user.id, req.user.id]);

    res.json(matches);
  } catch (error) {
    console.error('獲取配對列表錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// === 對話框相關 API ===
app.post('/chat_rooms', authenticateToken, async (req, res) => {
  try {
    const user1_id = req.user.id;
    const { user2_id } = req.body;
    if (!user2_id || user2_id === user1_id) {
      return res.status(400).json({ error: '無效的配對對象' });
    }
    const user_pair_key = [user1_id, user2_id].sort((a, b) => a - b).join('_');
    await pool.query(
      'INSERT IGNORE INTO chat_rooms (user1_id, user2_id, user_pair_key, is_matched) VALUES (?, ?, ?, ?)',
      [user1_id, user2_id, user_pair_key, true]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('建立聊天室錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// === 聊天相關 API ===
// 獲取聊天訊息
app.get('/chat/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId, 10);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: '用戶ID格式錯誤' });
    }
    
    const [messages] = await pool.query(`
      SELECT 
        id, sender_id, receiver_id, message, is_read, created_at,
        (SELECT name FROM users WHERE id = sender_id) as sender_name
      FROM chat_messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [req.user.id, otherUserId, otherUserId, req.user.id]);

    // 標記為已讀（對方發給我的訊息）
    await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, req.user.id]
    );

    res.json(messages);
  } catch (error) {
    console.error('獲取聊天訊息錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 發送聊天訊息
app.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    
    if (!receiver_id || !message || message.trim() === '') {
      return res.status(400).json({ error: '接收者ID和訊息內容必填' });
    }

    const [result] = await pool.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, message.trim()]
    );

    const [newMessage] = await pool.query(
      'SELECT * FROM chat_messages WHERE id = ?',
      [result.insertId]
    );

    res.json(newMessage[0]);
  } catch (error) {
    console.error('發送訊息錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取未讀訊息數量
app.get('/chat/unread', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.sender_id,
        COUNT(*) as unread_count,
        u.name as sender_name
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ? AND m.is_read = FALSE
      GROUP BY m.sender_id
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    console.error('獲取未讀訊息錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 標記與某用戶的訊息為已讀
app.put('/chat/read/:userId', authenticateToken, async (req, res) => {
  try {
    const myUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId, 10);
    await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, myUserId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('標記已讀失敗:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
}); 

/*const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'datingapp'
});

db.connect((err) => {
  if (err) {
    console.error('資料庫連線失敗:', err);
    return;
  }
  console.log('成功連接資料庫');
});

// GET 所有 users（含性別與描述）
app.get('/users', (req, res) => {
  db.query('SELECT id, name, image_url, gender, description FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// GET 單一 user
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('User not found');
    res.json(results[0]);
  });
});

// POST 登入
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT id, name, account FROM users WHERE account = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(401).json({ error: '帳號或密碼錯誤' });
      res.json(results[0]);
    }
  );
});

// PUT 更新使用者資料
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const {
    name, gender, email, description,
    intro, account, password, imageData
  } = req.body;

  console.log('✅ 收到更新請求，內容如下：', req.body);

  const sql = `
    UPDATE users SET
      name = ?, gender = ?, email = ?, description = ?,
      intro = ?, account = ?, password = ?, image_url = ?
    WHERE id = ?
  `;

  const values = [
    name, gender, email, description,
    intro, account, password, imageData, userId
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err2, rows) => {
      if (err2) return res.status(500).send(err2);
      res.json(rows[0]);
    });
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});*/
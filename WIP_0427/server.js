const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 建立資料庫連線
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',      // 你的MySQL密碼
  database: 'datingApp'
});

// 測試連線
db.connect((err) => {
  if (err) {
    console.error('資料庫連線失敗:', err);
    return;
  }
  console.log('MySQL連線成功');
});

// 路由：取得所有用戶
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send('伺服器錯誤');
      return;
    }
    res.json(results);
  });
});

// 路由：取得單一用戶
app.get('/user/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      res.status(500).send('伺服器錯誤');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('找不到用戶');
      return;
    }
    res.json(results[0]);
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});

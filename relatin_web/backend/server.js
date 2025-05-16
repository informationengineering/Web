const express = require('express');
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

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});

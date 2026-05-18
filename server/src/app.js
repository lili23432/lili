import cors from 'cors';
import express from 'express';
import { pool } from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'library borrow server is running' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const [rows] = await pool.execute(
    'SELECT id, username, phone, role, create_time FROM users WHERE username = ? AND password = ?',
    [username, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  res.json({ user: rows[0] });
});

app.get('/api/books', async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT b.id, b.book_name, b.author, b.publisher, b.price, b.stock, c.category_name
      FROM books b
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.id ASC
    `);
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/books/search', async (req, res, next) => {
  try {
    const keyword = req.query.keyword || '';
    const [resultSets] = await pool.query('CALL sp_search_book(?)', [keyword]);
    res.json({ data: resultSets[0] || [] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/borrow', async (req, res, next) => {
  const { userId, bookId } = req.body;
  if (!userId || !bookId) {
    return res.status(400).json({ message: 'userId 和 bookId 不能为空' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [books] = await connection.execute('SELECT id, stock FROM books WHERE id = ? FOR UPDATE', [bookId]);
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: '图书不存在' });
    }
    if (books[0].stock <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: '库存不足，无法借阅' });
    }

    await connection.execute(
      'INSERT INTO borrow_records(user_id, book_id, borrow_time, status) VALUES (?, ?, NOW(), \'BORROWED\')',
      [userId, bookId]
    );
    await connection.execute('UPDATE books SET stock = stock - 1 WHERE id = ?', [bookId]);
    await connection.commit();
    res.json({ message: '借阅成功' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.post('/api/return', async (req, res, next) => {
  const { recordId } = req.body;
  if (!recordId) {
    return res.status(400).json({ message: 'recordId 不能为空' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [records] = await connection.execute(
      'SELECT id, book_id, status FROM borrow_records WHERE id = ? FOR UPDATE',
      [recordId]
    );
    if (records.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: '借阅记录不存在' });
    }
    if (records[0].status === 'RETURNED') {
      await connection.rollback();
      return res.status(400).json({ message: '该图书已归还' });
    }

    await connection.execute(
      "UPDATE borrow_records SET status = 'RETURNED', return_time = NOW() WHERE id = ?",
      [recordId]
    );
    await connection.execute('UPDATE books SET stock = stock + 1 WHERE id = ?', [records[0].book_id]);
    await connection.commit();
    res.json({ message: '归还成功' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.get('/api/records', async (req, res, next) => {
  try {
    const { userId, role } = req.query;
    const params = [];
    let sql = 'SELECT id, user_id, username, book_id, book_name, borrow_time, return_time, status FROM v_borrow_detail';
    if (role !== 'admin') {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }
    sql += ' ORDER BY borrow_time DESC';
    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const message = error.sqlMessage || error.message || '服务器内部错误';
  const status = message.includes('最多只能借阅') ? 400 : 500;
  res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`Library borrow server started at http://localhost:${port}`);
});

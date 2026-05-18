import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import http from '../api/http.js';

export default function Books({ user }) {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBooks = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const url = searchKeyword ? `/books/search?keyword=${encodeURIComponent(searchKeyword)}` : '/books';
      const data = await http.get(url);
      setBooks(data.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const borrowBook = async (book) => {
    try {
      await http.post('/borrow', { userId: user.id, bookId: book.id });
      message.success(`成功借阅《${book.book_name}》`);
      loadBooks(keyword);
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: '编号', dataIndex: 'id', width: 80 },
    { title: '书名', dataIndex: 'book_name' },
    { title: '作者', dataIndex: 'author' },
    { title: '出版社', dataIndex: 'publisher' },
    { title: '分类', dataIndex: 'category_name', render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '价格', dataIndex: 'price', render: (value) => `¥${Number(value).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', render: (value) => <Tag color={value > 0 ? 'green' : 'red'}>{value}</Tag> },
    {
      title: '操作',
      render: (_, record) => <Button type="primary" disabled={record.stock <= 0} onClick={() => borrowBook(record)}>借阅</Button>
    }
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" className="full-width">
        <Typography.Title level={3}>图书列表与搜索</Typography.Title>
        <Space.Compact className="search-box">
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={() => loadBooks(keyword)} placeholder="输入书名关键词，调用存储过程 sp_search_book" />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => loadBooks(keyword)}>搜索</Button>
          <Button onClick={() => { setKeyword(''); loadBooks(); }}>重置</Button>
        </Space.Compact>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={books} pagination={{ pageSize: 8 }} />
      </Space>
    </Card>
  );
}

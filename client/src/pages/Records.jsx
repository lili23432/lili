import { Button, Card, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import http from '../api/http.js';

export default function Records({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await http.get(`/records?userId=${user.id}&role=${user.role}`);
      setRecords(data.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const returnBook = async (record) => {
    try {
      await http.post('/return', { recordId: record.id });
      message.success(`已归还《${record.book_name}》`);
      loadRecords();
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: '记录号', dataIndex: 'id', width: 90 },
    { title: '用户名', dataIndex: 'username' },
    { title: '图书名', dataIndex: 'book_name' },
    { title: '借阅时间', dataIndex: 'borrow_time' },
    { title: '归还时间', dataIndex: 'return_time', render: (value) => value || '-' },
    { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 'BORROWED' ? 'orange' : 'green'}>{value === 'BORROWED' ? '借阅中' : '已归还'}</Tag> },
    {
      title: '操作',
      render: (_, record) => record.status === 'BORROWED'
        ? <Button onClick={() => returnBook(record)}>归还</Button>
        : <Button disabled>已完成</Button>
    }
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" className="full-width">
        <Typography.Title level={3}>借阅记录（视图 v_borrow_detail）</Typography.Title>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={records} pagination={{ pageSize: 8 }} />
      </Space>
    </Card>
  );
}

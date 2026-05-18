import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import http from '../api/http.js';

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const data = await http.post('/login', values);
      localStorage.setItem('library_user', JSON.stringify(data.user));
      message.success('登录成功');
      navigate('/books');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <Typography.Title level={2} className="center-title">图书借阅管理系统</Typography.Title>
        <Typography.Paragraph className="login-tip">数据库课程设计演示账号：admin / 123456 或 student1 / 123456</Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ username: 'student1', password: '123456' }}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">登录</Button>
        </Form>
      </Card>
    </div>
  );
}

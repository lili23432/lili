import { BookOutlined, DatabaseOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography, message } from 'antd';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import Books from './pages/Books.jsx';
import Login from './pages/Login.jsx';
import Records from './pages/Records.jsx';

const { Header, Content, Sider } = Layout;

function getUser() {
  const raw = localStorage.getItem('library_user');
  return raw ? JSON.parse(raw) : null;
}

function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { key: '/books', icon: <BookOutlined />, label: '图书列表' },
    { key: '/records', icon: <ProfileOutlined />, label: '借阅记录' }
  ];

  const logout = () => {
    localStorage.removeItem('library_user');
    message.success('已退出登录');
    navigate('/login');
  };

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo"><DatabaseOutlined /> 图书借阅系统</div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header className="top-header">
          <Typography.Text>当前用户：{user.username}（{user.role === 'admin' ? '管理员' : '学生'}）</Typography.Text>
          <Button icon={<LogoutOutlined />} onClick={logout}>退出</Button>
        </Header>
        <Content className="page-content">
          <Routes>
            <Route path="/books" element={<Books user={user} />} />
            <Route path="/records" element={<Records user={user} />} />
            <Route path="*" element={<Navigate to="/books" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}

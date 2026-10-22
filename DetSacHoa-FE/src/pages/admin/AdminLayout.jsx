import React, { useState } from 'react';
import './AdminLayout.css';
import { getStoredAuth, adminAuthService } from '../../services/adminService';
import { 
  IconDashboard, 
  IconUsers, 
  IconSilkProduct, 
  IconFeedback, 
  IconStore, 
  IconLogout, 
  IconFlower 
} from '../../components/AdminIcons';
import AdminDashboard from './AdminDashboard';
import UserManager from './UserManager';
import ProductManager from './ProductManager';
import FeedbackManager from './FeedbackManager';

export default function AdminLayout({ onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = getStoredAuth();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleLogout = () => {
    adminAuthService.logout();
    showToast('Đã đăng xuất khỏi phiên quản trị', 'info');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const tabTitles = {
    dashboard: { title: 'Tổng Quan Hệ Thống', desc: 'Thống kê hoạt động kinh doanh và dịch vụ tơ lụa Dệt Sắc Hoa' },
    users: { title: 'Quản Lý Người Dùng', desc: 'Danh sách tài khoản khách hàng, nhân viên và quản trị viên' },
    products: { title: 'Quản Lý Sản Phẩm', desc: 'Kho tàng sản phẩm lụa Hà Đông, gấm vóc và hoa nghệ thuật' },
    feedbacks: { title: 'Quản Lý Feedback', desc: 'Ý kiến đóng góp, đánh giá chất lượng và phản hồi từ khách hàng' }
  };

  return (
    <div className="admin-root">
      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="admin-mobile-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <IconFlower size={24} color="#e11d48" />
          </div>
          <div className="admin-brand-text">
            <h1>Dệt Sắc Hoa</h1>
            <span className="admin-brand-badge">Trang Quản Trị</span>
          </div>
          <button 
            className="admin-sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            title="Đóng menu"
          >
            ✕
          </button>
        </div>

        <div className="admin-sidebar-menu">
          <div className="admin-menu-heading">Trung Tâm Điều Hành</div>

          <button 
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <span className="admin-nav-icon">
              <IconDashboard size={20} color={activeTab === 'dashboard' ? '#e11d48' : 'currentColor'} />
            </span>
            <span>Tổng Quan (Dashboard)</span>
          </button>

          <div className="admin-menu-heading">Quản Lý Nghiệp Vụ</div>

          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabClick('users')}
          >
            <span className="admin-nav-icon">
              <IconUsers size={20} color={activeTab === 'users' ? '#e11d48' : 'currentColor'} />
            </span>
            <span>Quản Lý Người Dùng</span>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabClick('products')}
          >
            <span className="admin-nav-icon">
              <IconSilkProduct size={20} color={activeTab === 'products' ? '#e11d48' : 'currentColor'} />
            </span>
            <span>Quản Lý Sản Phẩm</span>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === 'feedbacks' ? 'active' : ''}`}
            onClick={() => handleTabClick('feedbacks')}
          >
            <span className="admin-nav-icon">
              <IconFeedback size={20} color={activeTab === 'feedbacks' ? '#e11d48' : 'currentColor'} />
            </span>
            <span>Quản Lý Feedback</span>
          </button>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="admin-sidebar-footer">
          <button 
            className="admin-back-store-btn"
            onClick={onClose}
            title="Trở về website chính Dệt Sắc Hoa"
          >
            <IconStore size={18} color="#e11d48" />
            <span>Về Website Chính</span>
          </button>

          <div className="admin-user-pill">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={user?.fullName || 'Admin'} 
              className="admin-user-avatar"
            />
            <div className="admin-user-meta">
              <div className="admin-user-name">{user?.fullName || 'Quản Trị Viên'}</div>
              <div className="admin-user-role">{user?.role || 'Admin'}</div>
            </div>
            <button 
              className="admin-logout-btn" 
              onClick={handleLogout}
              title="Đăng xuất khỏi trang quản trị"
            >
              <IconLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button 
              className="admin-mobile-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Mở menu quản trị"
            >
              ☰
            </button>
            <div className="admin-header-title">
              <h2>{tabTitles[activeTab]?.title}</h2>
              <p>{tabTitles[activeTab]?.desc}</p>
            </div>
          </div>

          <div className="admin-header-actions">
            <div className="admin-status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">Hệ Thống Online</span>
            </div>

            <button 
              className="admin-btn-secondary admin-close-header-btn"
              onClick={onClose}
            >
              ✕ Đóng
            </button>
          </div>
        </header>

        {/* BODY CONTENT BY TAB */}
        <div className="admin-content-body">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={handleTabClick} />}
          {activeTab === 'users' && <UserManager showToast={showToast} />}
          {activeTab === 'products' && <ProductManager showToast={showToast} />}
          {activeTab === 'feedbacks' && <FeedbackManager showToast={showToast} />}
        </div>
      </main>

      {/* TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="admin-toast">
          <span style={{ color: toast.type === 'success' ? '#059669' : '#e11d48' }}>
            {toast.type === 'success' ? '✓' : (toast.type === 'error' ? '⚠️' : '✦')}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

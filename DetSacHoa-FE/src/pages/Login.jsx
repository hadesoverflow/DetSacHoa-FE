import React, { useState } from 'react';
import './Login.css';
import { adminAuthService } from '../services/adminService';

export default function Login({ onClose, onAdminLogin }) {
  const [isHovered, setIsHovered] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' | 'customer'

  const handleFillCredentials = (mode) => {
    setLoginMode(mode);
    setErrorMessage('');
    if (mode === 'admin') {
      setUsernameOrEmail('admin');
      setPassword('Admin@123');
    } else {
      setUsernameOrEmail('hoangyen@gmail.com');
      setPassword('123456');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await adminAuthService.login(usernameOrEmail, password);
      if (res && res.success) {
        const user = res.data.user;
        if (user.role === 'Admin' || user.role === 'Staff') {
          if (onAdminLogin) {
            onAdminLogin(user);
          } else {
            onClose();
          }
        } else {
          alert(`Chào mừng ${user.fullName} đã quay trở lại với Dệt Sắc Hoa!`);
          onClose();
        }
      } else {
        setErrorMessage(res?.message || 'Tài khoản hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi hệ thống trong khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay d-flex items-center justify-center">
      <div className="login-modal-wrapper d-flex">
        
        {/* Cột trái: Hình ảnh hoa trang trí */}
        <div className="login-image-side relative d-none d-flex@md">
          <img 
            src="/wp-content/themes/unseen/public/images/floral-login.jpg" 
            alt="Dệt Sắc Hoa Floral" 
            className="login-floral-img"
          />
          <div className="login-image-overlay absolute fill d-flex flex-column justify-end p-2" style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.9) 0%, transparent 80%)' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#d4af37' }}>
              Dệt Sắc Hoa
            </span>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              Cổng quản trị tơ lụa & dịch vụ khách hàng cao cấp
            </p>
          </div>
        </div>

        {/* Cột phải: Form đăng nhập */}
        <div className="login-form-side relative d-flex flex-column justify-center">
          <button 
            className="login-close-btn absolute t-sans"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
          
          <div className="login-header text-center">
            <h2 className="login-title t-serif t-italic" style={{ color: '#fffaf0' }}>
              {loginMode === 'admin' ? 'Quản Trị Viên' : 'Đăng Nhập'}
            </h2>
            <p className="login-subtitle t-sans">
              {loginMode === 'admin' 
                ? 'Đăng nhập vào bảng điều khiển quản trị Dệt Sắc Hoa' 
                : 'Chào mừng bạn trở lại với không gian tơ lụa Việt'}
            </p>

            {/* Chuyển đổi nhanh chế độ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin')}
                style={{
                  background: loginMode === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: loginMode === 'admin' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                  color: loginMode === 'admin' ? '#f3e5ab' : '#94a3b8',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                👑 Tài Khoản Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('customer')}
                style={{
                  background: loginMode === 'customer' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: loginMode === 'customer' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                  color: loginMode === 'customer' ? '#f3e5ab' : '#94a3b8',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🛍️ Khách Hàng
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#f87171',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <form className="login-form d-flex flex-column" onSubmit={handleFormSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                id="usernameOrEmail" 
                className="login-input t-sans" 
                placeholder="Tên đăng nhập hoặc Email" 
                required 
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                id="password" 
                className="login-input t-sans" 
                placeholder="Mật khẩu (VD: Admin@123)" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="d-flex justify-between items-center w-100 forgot-password-wrapper">
              <label className="d-flex items-center remember-me t-sans">
                <input type="checkbox" className="mr-1" defaultChecked />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ IT Quản trị để cấp lại mật khẩu.'); }} className="forgot-password t-sans">
                Quên mật khẩu?
              </a>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn t-sans"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: isHovered && !loading ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8210 100%)',
                color: '#090b0e',
                fontWeight: 700,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Đang xác thực...' : (loginMode === 'admin' ? 'Đăng Nhập Quản Trị' : 'Đăng Nhập Khách Hàng')}
            </button>
          </form>

          <div className="login-footer text-center t-sans" style={{ marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Mẹo thử nghiệm: Nhấn nút <strong>"👑 Tài Khoản Admin"</strong> ở trên để tự động điền sẵn tài khoản Admin.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

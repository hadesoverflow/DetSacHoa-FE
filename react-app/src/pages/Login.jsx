import React, { useState } from 'react';
import './Login.css';

export default function Login({ onClose }) {
  const [isHovered, setIsHovered] = useState(false);

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
            <h2 className="login-title t-serif t-italic">Đăng Nhập</h2>
            <p className="login-subtitle t-sans">Chào mừng bạn trở lại với Dệt Sắc Hoa</p>
          </div>

          <form className="login-form d-flex flex-column" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <input 
                type="email" 
                id="email" 
                className="login-input t-sans" 
                placeholder="Email của bạn" 
                required 
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                id="password" 
                className="login-input t-sans" 
                placeholder="Mật khẩu" 
                required 
              />
            </div>

            <div className="d-flex justify-between items-center w-100 forgot-password-wrapper">
              <label className="d-flex items-center remember-me t-sans">
                <input type="checkbox" className="mr-1" />
                <span>Ghi nhớ</span>
              </label>
              <a href="#" className="forgot-password t-sans">Quên mật khẩu?</a>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn t-sans"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              Đăng Nhập
            </button>
          </form>

          <div className="login-footer text-center t-sans">
            Chưa có tài khoản? <a href="#" className="register-link">Đăng ký ngay</a>
          </div>
        </div>
      </div>
    </div>
  );
}

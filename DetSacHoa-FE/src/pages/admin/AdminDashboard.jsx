import React, { useEffect, useState } from 'react';
import { adminDashboardService } from '../../services/adminService';
import { 
  IconUsers, 
  IconSilkProduct, 
  IconFeedback, 
  IconStar, 
  IconPlus, 
  IconSparkles 
} from '../../components/AdminIcons';

export default function AdminDashboard({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminDashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--admin-pink)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1.5s infinite linear' }}>
            <IconSparkles size={36} color="#e11d48" />
          </div>
          <p style={{ fontWeight: 600 }}>Đang tải dữ liệu tổng quan Dệt Sắc Hoa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-view">
      {/* STATS METRIC CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrap">
            <IconUsers size={28} color="#e11d48" />
          </div>
          <div className="stat-meta">
            <span>Tổng Người Dùng</span>
            <h3>{stats?.totalUsers || 0}</h3>
            <div className="stat-badge" style={{ color: 'var(--admin-info)' }}>
              ✦ Khách hàng & Quản trị
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap">
            <IconSilkProduct size={28} color="#e11d48" />
          </div>
          <div className="stat-meta">
            <span>Sản Phẩm Lụa</span>
            <h3>{stats?.totalProducts || 0}</h3>
            <div className="stat-badge" style={{ color: 'var(--admin-success)' }}>
              ✦ {stats?.activeProducts || 0} Đang mở bán
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap">
            <IconFeedback size={28} color="#e11d48" />
          </div>
          <div className="stat-meta">
            <span>Phản Hồi / Đánh Giá</span>
            <h3>{stats?.totalFeedbacks || 0}</h3>
            <div className="stat-badge" style={{ color: stats?.pendingFeedbacks > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
              ✦ {stats?.pendingFeedbacks || 0} Đang chờ duyệt
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap">
            <IconStar size={28} color="#e11d48" filled={true} />
          </div>
          <div className="stat-meta">
            <span>Điểm Đánh Giá</span>
            <h3>{stats?.averageRating ? `${stats.averageRating} / 5` : '5.0 / 5'}</h3>
            <div className="stat-badge" style={{ color: '#be123c' }}>
              ✦ Trung bình từ khách hàng
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="admin-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)', border: '1px solid var(--admin-pink-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#be123c' }}>
              Lối Tắt Thao Tác Nhanh
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--admin-text-secondary)', fontSize: '0.88rem' }}>
              Truy cập nhanh các phân hệ nghiệp vụ quản trị Dệt Sắc Hoa
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="admin-btn-gold" onClick={() => onNavigateTab('products')}>
              <IconPlus size={16} /> Quản Lý Sản Phẩm
            </button>
            <button className="admin-btn-secondary" onClick={() => onNavigateTab('users')}>
              <IconUsers size={16} color="#e11d48" /> Quản Lý Người Dùng
            </button>
            <button className="admin-btn-secondary" onClick={() => onNavigateTab('feedbacks')}>
              <IconFeedback size={16} color="#e11d48" /> Duyệt Feedback ({stats?.pendingFeedbacks || 0})
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN RECENT ACTIVITIES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* RECENT FEEDBACKS */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--admin-text-primary)' }}>
              Phản Hồi Mới Nhất
            </h3>
            <button 
              onClick={() => onNavigateTab('feedbacks')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--admin-pink)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
            >
              Xem tất cả →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.recentFeedbacks && stats.recentFeedbacks.length > 0 ? (
              stats.recentFeedbacks.map(f => (
                <div key={f.id} style={{ padding: '0.85rem 1rem', background: '#fffafd', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ color: '#be123c', fontSize: '0.92rem' }}>{f.customerName}</strong>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(f.rating)].map((_, i) => (
                        <IconStar key={i} size={14} color="#f43f5e" filled={true} />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                    {f.subject}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--admin-text-secondary)', lineHeight: '1.4' }}>
                    "{f.content}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    <span>{new Date(f.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className={`badge ${f.status === 'Approved' ? 'badge-active' : (f.status === 'Pending' ? 'badge-pending' : 'badge-inactive')}`}>
                      {f.status === 'Approved' ? 'Đã duyệt' : (f.status === 'Pending' ? 'Chờ duyệt' : 'Đã ẩn')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Chưa có phản hồi nào</p>
            )}
          </div>
        </div>

        {/* RECENT PRODUCTS */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--admin-text-primary)' }}>
              Sản Phẩm Nổi Bật Gần Đây
            </h3>
            <button 
              onClick={() => onNavigateTab('products')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--admin-pink)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
            >
              Quản lý kho →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.recentProducts && stats.recentProducts.length > 0 ? (
              stats.recentProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#fffafd', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <img 
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=120'} 
                    alt={p.name} 
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--admin-pink-border)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.15rem' }}>
                      {p.categoryName} • Tồn: <span style={{ color: p.stockQuantity < 15 ? 'var(--admin-warning)' : 'var(--admin-success)', fontWeight: 700 }}>{p.stockQuantity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--admin-pink)', fontSize: '0.92rem' }}>
                      {formatCurrency(p.price)}
                    </div>
                    <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`} style={{ marginTop: '0.2rem' }}>
                      {p.isActive ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Chưa có sản phẩm nào</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

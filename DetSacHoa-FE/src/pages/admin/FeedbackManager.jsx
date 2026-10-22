import React, { useEffect, useState } from 'react';
import { adminFeedbackService } from '../../services/adminService';
import { 
  IconSearch, 
  IconCheck, 
  IconEyeOff, 
  IconReply, 
  IconTrash, 
  IconStar 
} from '../../components/AdminIcons';

export default function FeedbackManager({ showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('');

  // Reply Modal State
  const [replyingFeedback, setReplyingFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, [search, statusFilter, ratingFilter]);

  const fetchFeedbacks = async () => {
    try {
      const data = await adminFeedbackService.getFeedbacks(search, statusFilter, ratingFilter);
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải danh sách phản hồi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminFeedbackService.updateStatus(id, status);
      const label = status === 'Approved' ? 'Duyệt hiển thị' : (status === 'Hidden' ? 'Ẩn phản hồi' : 'Chuyển về chờ');
      showToast(`Đã ${label} thành công!`, 'success');
      fetchFeedbacks();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleOpenReply = (item) => {
    setReplyingFeedback(item);
    setReplyMessage(item.adminReply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      showToast('Vui lòng nhập nội dung trả lời!', 'warning');
      return;
    }

    try {
      await adminFeedbackService.replyFeedback(replyingFeedback.id, replyMessage.trim());
      showToast('Đã gửi phản hồi đến khách hàng!', 'success');
      setReplyingFeedback(null);
      fetchFeedbacks();
    } catch (err) {
      showToast(err.message || 'Không thể gửi phản hồi', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này vĩnh viễn không?')) {
      try {
        await adminFeedbackService.deleteFeedback(id);
        showToast('Đã xóa phản hồi thành công!', 'success');
        fetchFeedbacks();
      } catch (err) {
        showToast(err.message || 'Không thể xóa', 'error');
      }
    }
  };

  const pendingCount = feedbacks.filter(f => f.status === 'Pending').length;

  return (
    <div className="feedback-manager-view">
      {/* TABS & TOOLBAR */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button 
          className={`admin-nav-btn ${statusFilter === 'All' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.2rem', borderRadius: '30px' }}
          onClick={() => setStatusFilter('All')}
        >
          Tất Cả ({feedbacks.length})
        </button>

        <button 
          className={`admin-nav-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.2rem', borderRadius: '30px' }}
          onClick={() => setStatusFilter('Pending')}
        >
          Chờ Duyệt {pendingCount > 0 && <span className="admin-nav-badge" style={{ marginLeft: '0.5rem' }}>{pendingCount}</span>}
        </button>

        <button 
          className={`admin-nav-btn ${statusFilter === 'Approved' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.2rem', borderRadius: '30px' }}
          onClick={() => setStatusFilter('Approved')}
        >
          Đã Duyệt Công Khai
        </button>

        <button 
          className={`admin-nav-btn ${statusFilter === 'Hidden' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.2rem', borderRadius: '30px' }}
          onClick={() => setStatusFilter('Hidden')}
        >
          Đã Ẩn
        </button>
      </div>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-search-box">
            <IconSearch size={18} color="#e11d48" />
            <input 
              type="text" 
              placeholder="Tìm theo tên khách, nội dung..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="admin-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">Tất cả đánh giá sao</option>
            <option value="5">★★★★★ (5 sao)</option>
            <option value="4">★★★★☆ (4 sao)</option>
            <option value="3">★★★☆☆ (3 sao)</option>
            <option value="2">★★☆☆☆ (2 sao)</option>
            <option value="1">★☆☆☆☆ (1 sao)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
          Hiển thị <strong>{feedbacks.length}</strong> phản hồi
        </div>
      </div>

      {/* FEEDBACK CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-pink)' }}>
            Đang tải dữ liệu phản hồi...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
            Không tìm thấy phản hồi nào phù hợp tiêu chí lọc.
          </div>
        ) : (
          feedbacks.map(f => (
            <div 
              key={f.id} 
              className="admin-card" 
              style={{
                borderLeft: f.status === 'Pending' 
                  ? '4px solid var(--admin-warning)' 
                  : (f.status === 'Approved' ? '4px solid var(--admin-success)' : '4px solid var(--admin-danger)')
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#be123c', fontWeight: 600 }}>
                      {f.customerName}
                    </h4>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(f.rating)].map((_, i) => (
                        <IconStar key={i} size={14} color="#f43f5e" filled={true} />
                      ))}
                    </div>
                    <span className={`badge ${f.status === 'Approved' ? 'badge-active' : (f.status === 'Pending' ? 'badge-pending' : 'badge-inactive')}`}>
                      {f.status === 'Approved' ? '● Đã duyệt' : (f.status === 'Pending' ? 'Chờ duyệt' : '○ Đã ẩn')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    {f.customerEmail} {f.customerPhone && `• ${f.customerPhone}`} • Ngày gửi: {new Date(f.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="action-btn-group">
                  {f.status !== 'Approved' && (
                    <button 
                      className="table-action-btn"
                      style={{ color: 'var(--admin-success)', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                      title="Duyệt hiển thị công khai"
                      onClick={() => handleUpdateStatus(f.id, 'Approved')}
                    >
                      <IconCheck size={14} color="#059669" />
                      <span style={{ marginLeft: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Duyệt</span>
                    </button>
                  )}

                  {f.status !== 'Hidden' && (
                    <button 
                      className="table-action-btn"
                      style={{ color: 'var(--admin-warning)', borderColor: '#fde68a', background: '#fef3c7' }}
                      title="Ẩn phản hồi"
                      onClick={() => handleUpdateStatus(f.id, 'Hidden')}
                    >
                      <IconEyeOff size={14} color="#d97706" />
                      <span style={{ marginLeft: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Ẩn</span>
                    </button>
                  )}

                  <button 
                    className="table-action-btn"
                    style={{ color: 'var(--admin-pink)', borderColor: 'var(--admin-pink-border)', background: 'var(--admin-pink-light)' }}
                    title="Trả lời khách hàng"
                    onClick={() => handleOpenReply(f)}
                  >
                    <IconReply size={14} color="#e11d48" />
                    <span style={{ marginLeft: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {f.adminReply ? 'Sửa trả lời' : 'Trả lời'}
                    </span>
                  </button>

                  <button 
                    className="table-action-btn btn-delete"
                    title="Xóa phản hồi"
                    onClick={() => handleDelete(f.id)}
                  >
                    <IconTrash size={14} color="#dc2626" />
                  </button>
                </div>
              </div>

              {/* Feedback Content */}
              <div style={{ background: '#fffafd', padding: '1rem', borderRadius: '10px', border: '1px solid var(--admin-border)', marginBottom: f.adminReply ? '0.75rem' : 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--admin-text-primary)', marginBottom: '0.35rem' }}>
                  {f.subject}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-secondary)', lineHeight: '1.5' }}>
                  "{f.content}"
                </div>
              </div>

              {/* Admin Reply Thread */}
              {f.adminReply && (
                <div style={{ background: '#fff1f2', borderLeft: '3px solid var(--admin-pink)', padding: '0.85rem 1rem', borderRadius: '0 10px 10px 0', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Phản Hồi Từ Ban Quản Trị Dệt Sắc Hoa
                    </span>
                    {f.repliedAt && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(f.repliedAt).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)', lineHeight: '1.4' }}>
                    {f.adminReply}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REPLY MODAL */}
      {replyingFeedback && (
        <div className="admin-modal-overlay" onClick={() => setReplyingFeedback(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Trả Lời Phản Hồi Khách Hàng</h3>
              <button className="admin-modal-close" onClick={() => setReplyingFeedback(null)}>✕</button>
            </div>

            <form onSubmit={handleSendReply}>
              <div className="admin-modal-body">
                <div style={{ padding: '0.85rem 1rem', background: '#fffafd', borderRadius: '8px', border: '1px solid var(--admin-pink-border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-pink)', fontWeight: 600 }}>
                    Khách hàng: {replyingFeedback.customerName} ({replyingFeedback.customerEmail})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    "{replyingFeedback.content}"
                  </div>
                </div>

                <div className="form-group">
                  <label>Nội dung thư phản hồi từ Ban Quản Trị *</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    required
                    placeholder="Dệt Sắc Hoa trân trọng cảm ơn quý khách..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    * Khi gửi trả lời, phản hồi sẽ tự động được chuyển sang trạng thái "Đã duyệt công khai".
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setReplyingFeedback(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-gold">
                  Gửi Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

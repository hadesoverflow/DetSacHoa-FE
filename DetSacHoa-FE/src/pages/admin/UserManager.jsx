import React, { useEffect, useState } from 'react';
import { adminUserService } from '../../services/adminService';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconLock, 
  IconUnlock, 
  IconTrash 
} from '../../components/AdminIcons';

export default function UserManager({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    role: 'Customer',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const activeParam = statusFilter === 'All' ? null : statusFilter === 'Active';
      const data = await adminUserService.getUsers(search, roleFilter, activeParam);
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      role: 'Customer',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Leave blank unless updating
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      role: user.role,
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminUserService.updateUser(editingUser.id, formData);
        showToast('Cập nhật người dùng thành công!', 'success');
      } else {
        if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
          showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
          return;
        }
        await adminUserService.createUser(formData);
        showToast('Thêm mới người dùng thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = await adminUserService.toggleStatus(user.id);
      showToast(newStatus ? `Đã mở khóa tài khoản ${user.username}` : `Đã khóa tài khoản ${user.username}`, 'info');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Không thể thay đổi trạng thái', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" (${user.username}) không?`)) {
      try {
        await adminUserService.deleteUser(user.id);
        showToast('Đã xóa người dùng thành công!', 'success');
        fetchUsers();
      } catch (err) {
        showToast(err.message || 'Không thể xóa người dùng', 'error');
      }
    }
  };

  return (
    <div className="user-manager-view">
      {/* TOOLBAR */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-search-box">
            <IconSearch size={18} color="#e11d48" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, email, SĐT..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Admin">Quản trị viên (Admin)</option>
            <option value="Staff">Nhân viên (Staff)</option>
            <option value="Customer">Khách hàng (Customer)</option>
          </select>

          <select 
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Inactive">Đã khóa</option>
          </select>
        </div>

        <button className="admin-btn-gold" onClick={handleOpenAdd}>
          <IconPlus size={16} /> Thêm Người Dùng
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người Dùng</th>
              <th>Liên Hệ</th>
              <th>Địa Chỉ</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-pink)' }}>
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`} 
                        alt={u.fullName} 
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--admin-pink-border)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{u.phoneNumber || 'Chưa cập nhật'}</div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                      {u.address || '—'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : (u.role === 'Staff' ? 'badge-staff' : 'badge-customer')}`}>
                      {u.role === 'Admin' ? 'Quản Trị' : (u.role === 'Staff' ? 'Nhân Viên' : 'Khách Hàng')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? '● Hoạt động' : '○ Đã khóa'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="table-action-btn"
                        title="Chỉnh sửa thông tin"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <IconEdit size={15} color="#e11d48" />
                      </button>
                      <button 
                        className="table-action-btn"
                        title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.username === 'admin'}
                        style={u.username === 'admin' ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                      >
                        {u.isActive ? <IconLock size={15} color="#d97706" /> : <IconUnlock size={15} color="#059669" />}
                      </button>
                      <button 
                        className="table-action-btn btn-delete"
                        title="Xóa người dùng"
                        onClick={() => handleDelete(u)}
                        disabled={u.username === 'admin'}
                        style={u.username === 'admin' ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                      >
                        <IconTrash size={15} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên đăng nhập *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      disabled={!!editingUser}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="nguyenvana"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      disabled={!!editingUser}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="a@gmail.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="0912345678"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{editingUser ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo *'}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Quận/Huyện, Tỉnh/TP"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Vai trò hệ thống</label>
                    <select 
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      disabled={editingUser?.username === 'admin'}
                    >
                      <option value="Customer">Khách hàng (Customer)</option>
                      <option value="Staff">Nhân viên (Staff)</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select 
                      className="form-control"
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      disabled={editingUser?.username === 'admin'}
                    >
                      <option value="true">Hoạt động bình thường</option>
                      <option value="false">Khóa tài khoản</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-gold">
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

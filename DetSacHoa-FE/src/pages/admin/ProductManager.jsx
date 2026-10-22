import React, { useEffect, useState } from 'react';
import { adminProductService } from '../../services/adminService';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconStar 
} from '../../components/AdminIcons';

export default function ProductManager({ showToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: 1,
    price: '',
    originalPrice: '',
    stockQuantity: 10,
    imageUrl: '',
    shortDescription: '',
    description: '',
    isFeatured: false,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter]);

  const loadCategories = async () => {
    try {
      const data = await adminProductService.getCategories();
      setCategories(data);
      if (data && data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const activeParam = statusFilter === 'All' ? null : statusFilter === 'Active';
      const data = await adminProductService.getProducts(search, categoryFilter, activeParam);
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `DSH-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || 1,
      price: '',
      originalPrice: '',
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
      shortDescription: '',
      description: '',
      isFeatured: false,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku || '',
      categoryId: prod.categoryId,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      stockQuantity: prod.stockQuantity,
      imageUrl: prod.imageUrl || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      isFeatured: !!prod.isFeatured,
      isActive: prod.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.price || !formData.categoryId) {
        showToast('Vui lòng điền tên, danh mục và giá sản phẩm!', 'warning');
        return;
      }

      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, formData);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await adminProductService.createProduct(formData);
        showToast('Thêm sản phẩm mới thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDelete = async (prod) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${prod.name}" không?`)) {
      try {
        await adminProductService.deleteProduct(prod.id);
        showToast('Đã xóa sản phẩm thành công!', 'success');
        fetchProducts();
      } catch (err) {
        showToast(err.message || 'Không thể xóa sản phẩm', 'error');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="product-manager-view">
      {/* TOOLBAR */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-search-box">
            <IconSearch size={18} color="#e11d48" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, mã SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang mở bán</option>
            <option value="Inactive">Đã tạm ẩn</option>
          </select>
        </div>

        <button className="admin-btn-gold" onClick={handleOpenAdd}>
          <IconPlus size={16} /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sản Phẩm Lụa</th>
              <th>Mã SKU</th>
              <th>Danh Mục</th>
              <th>Giá Bán</th>
              <th>Tồn Kho</th>
              <th>Nổi Bật</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-pink)' }}>
                  Đang tải danh sách sản phẩm lụa...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  Không tìm thấy sản phẩm nào phù hợp.
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img 
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=120'} 
                        alt={p.name} 
                        style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--admin-pink-border)' }}
                      />
                      <div style={{ maxWidth: '240px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.shortDescription || 'Lụa tơ tằm thủ công'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: '#be123c', background: '#ffe4e6', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                      {p.sku || 'N/A'}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)' }}>
                      {p.categoryName}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--admin-pink)', fontSize: '0.92rem' }}>
                        {formatCurrency(p.price)}
                      </strong>
                      {p.originalPrice && (
                        <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--admin-text-muted)' }}>
                          {formatCurrency(p.originalPrice)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.stockQuantity <= 5 ? 'badge-inactive' : (p.stockQuantity <= 20 ? 'badge-pending' : 'badge-active')}`}>
                      {p.stockQuantity > 0 ? `${p.stockQuantity} chiếc` : 'Hết hàng'}
                    </span>
                  </td>
                  <td>
                    {p.isFeatured ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#e11d48', fontSize: '0.85rem', fontWeight: 700 }}>
                        <IconStar size={14} color="#e11d48" filled={true} /> Hot
                      </span>
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {p.isActive ? '● Đang bán' : '○ Tạm ẩn'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="table-action-btn"
                        title="Sửa sản phẩm"
                        onClick={() => handleOpenEdit(p)}
                      >
                        <IconEdit size={15} color="#e11d48" />
                      </button>
                      <button 
                        className="table-action-btn btn-delete"
                        title="Xóa sản phẩm"
                        onClick={() => handleDelete(p)}
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Chỉnh Sửa Sản Phẩm Lụa' : 'Thêm Mới Sản Phẩm Lụa'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Áo Dài Lụa Hà Đông Thêu Sen..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Mã SKU</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="AD-SEN-001"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Danh mục *</label>
                    <select 
                      className="form-control"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giá bán (VND) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="3850000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá gốc (nếu giảm)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="4500000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Số lượng trong kho</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Đường dẫn hình ảnh (URL)</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                {formData.imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#fffafd', borderRadius: '8px', border: '1px solid var(--admin-pink-border)' }}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Xem trước ảnh" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} 
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                      Xem trước hình ảnh sản phẩm thực tế
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Mô tả ngắn</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Tóm tắt đặc sắc của mẫu thiết kế..."
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả chi tiết</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Chất liệu sợi tơ tằm, kỹ thuật dệt hoa văn, ý nghĩa nghệ thuật..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Đánh dấu là Sản phẩm Nổi Bật (Featured)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Đang mở bán công khai</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-gold">
                  {editingProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import './Products.css';

const MOCK_PRODUCTS = [
  // 1 - 21: HOA NGHỆ THUẬT (THEO DANH SÁCH YÊU CẦU)
  {
    id: 1,
    name: 'Hồng Ecuador',
    price: 180000,
    priceLabel: '180.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Hồng Proud',
    price: 195000,
    priceLabel: '195.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Ecuador'
  },
  {
    id: 3,
    name: 'Hồng Lạc Thần',
    price: 220000,
    priceLabel: '220.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Đặc Quyền'
  },
  {
    id: 4,
    name: 'Hồng Pink Floyd',
    price: 210000,
    priceLabel: '210.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1610609626993-58a8929bf3e7?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Hot'
  },
  {
    id: 5,
    name: 'Phi Yến Hồng',
    price: 145000,
    priceLabel: '145.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: ''
  },
  {
    id: 6,
    name: 'Phi Yến Trắng',
    price: 145000,
    priceLabel: '145.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Thanh Nhã'
  },
  {
    id: 7,
    name: 'Mao Lương Trắng',
    price: 165000,
    priceLabel: '165.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Mới'
  },
  {
    id: 8,
    name: 'Mao Lương Hồng',
    price: 175000,
    priceLabel: '175.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Yêu Thích'
  },
  {
    id: 9,
    name: 'Hồng Sophie',
    price: 185000,
    priceLabel: '185.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: ''
  },
  {
    id: 10,
    name: 'Đồng Tiền Nhí Hồng Kem',
    price: 85000,
    priceLabel: '85.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1573572042111-dcdf086047be?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Nhỏ Xinh'
  },
  {
    id: 11,
    name: 'Đồng Tiền Nhí Hồng Phấn Nhuỵ Đen',
    price: 95000,
    priceLabel: '95.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Độc Đáo'
  },
  {
    id: 12,
    name: 'Hoa Sao Xanh',
    price: 110000,
    priceLabel: '110.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1549100789-756142409c2e?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Mộng Mơ'
  },
  {
    id: 13,
    name: 'Hoa Sao Trắng',
    price: 95000,
    priceLabel: '95.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: ''
  },
  {
    id: 14,
    name: 'Hoa Thuỷ Tiên',
    price: 155000,
    priceLabel: '155.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Thanh Khiết'
  },
  {
    id: 15,
    name: 'Chùm Hồng Strawberry Macaron',
    price: 260000,
    priceLabel: '260.000 ₫',
    unit: 'chùm',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Best Seller'
  },
  {
    id: 16,
    name: 'Phăng Trắng',
    price: 90000,
    priceLabel: '90.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: ''
  },
  {
    id: 17,
    name: 'Phăng Hồng Kem Dâu',
    price: 115000,
    priceLabel: '115.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Ngọt Ngào'
  },
  {
    id: 18,
    name: 'Hồng Kem Dâu',
    price: 175000,
    priceLabel: '175.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Trend'
  },
  {
    id: 19,
    name: 'Hoa Cỏ May Côn Minh',
    price: 125000,
    priceLabel: '125.000 ₫',
    unit: 'bó',
    image: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Phụ Kiện'
  },
  {
    id: 20,
    name: 'Đồng Tiền Nhí Trắng Hồng Nhạt',
    price: 88000,
    priceLabel: '88.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: ''
  },
  {
    id: 21,
    name: 'Ly Hồng',
    price: 240000,
    priceLabel: '240.000 ₫',
    unit: 'cành',
    image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Nghệ Thuật',
    badge: 'Quý Phái'
  },

  // 22 - 30: CÁC LOẠI BÌNH HOA NGHỆ THUẬT ĐA DẠNG
  {
    id: 22,
    name: 'Bình Gốm Sứ Trụ Gân Ngang',
    price: 1450000,
    priceLabel: '1.450.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Thủ Công'
  },
  {
    id: 23,
    name: 'Bình Sứ Khía Tân Cổ Điển',
    price: 1850000,
    priceLabel: '1.850.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Hoàng Gia'
  },
  {
    id: 24,
    name: 'Bình Gốm Quai Rót Nghệ Thuật',
    price: 1250000,
    priceLabel: '1.250.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Artisan'
  },
  {
    id: 25,
    name: 'Bình Thủy Tinh Pha Lê Trụ Đứng',
    price: 980000,
    priceLabel: '980.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Pha Lê'
  },
  {
    id: 26,
    name: 'Bình Gốm Men Rạn Cổ Điển',
    price: 2150000,
    priceLabel: '2.150.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Men Rạn'
  },
  {
    id: 27,
    name: 'Bình Gốm Đất Nung Terracotta',
    price: 890000,
    priceLabel: '890.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Mộc Mạc'
  },
  {
    id: 28,
    name: 'Bình Sứ Trắng Bát Tràng Dáng Bầu',
    price: 1650000,
    priceLabel: '1.650.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Bát Tràng'
  },
  {
    id: 29,
    name: 'Bình Thủy Tinh Khói Bắc Âu',
    price: 1120000,
    priceLabel: '1.120.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Nordic'
  },
  {
    id: 30,
    name: 'Bình Gốm Tạc Khối Vòm Điêu Khắc',
    price: 2450000,
    priceLabel: '2.450.000 ₫',
    unit: 'bình',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Điêu Khắc'
  }
];

const CATEGORIES = ['Tất cả', 'Hoa Nghệ Thuật', 'Bình Hoa', 'Bán Chạy Nhất'];
const SORTS = ['Mặc định', 'Giá thấp - cao', 'Giá cao - thấp'];
const ITEMS_PER_PAGE = 10; // 5 sản phẩm/hàng x 2 hàng = 10 sản phẩm/trang

export default function Products({ onClose }) {
  const [filter, setFilter] = useState('Tất cả');
  const [sort, setSort] = useState('Mặc định');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleScroll = (e) => {
      setScrolled(e.target.scrollTop > 50);
    };
    const overlay = document.getElementById('products-scroll-container');
    if (overlay) overlay.addEventListener('scroll', handleScroll);
    return () => {
      if (overlay) overlay.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset về trang 1 khi lọc hoặc đổi sắp xếp
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sort]);

  // Lọc sản phẩm
  let filteredProducts = filter === 'Tất cả' 
    ? [...MOCK_PRODUCTS] 
    : filter === 'Bán Chạy Nhất'
      ? MOCK_PRODUCTS.filter(p => p.badge && (p.badge.includes('Best') || p.badge.includes('Hot') || p.badge.includes('Trend') || p.badge.includes('Đặc Quyền')))
      : MOCK_PRODUCTS.filter(p => p.category === filter);

  // Sắp xếp
  if (sort === 'Giá thấp - cao') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'Giá cao - thấp') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Phân trang: 1 hàng 5 sản phẩm, 2 hàng = 10 sản phẩm / trang
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const overlay = document.getElementById('products-scroll-container');
    if (overlay) {
      overlay.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartTotalFormatted = cartTotal.toLocaleString('vi-VN') + ' ₫';
  
  // Free shipping threshold logic
  const FREE_SHIPPING_THRESHOLD = 5000000; // 5 triệu
  const progressPercent = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <div className="products-page-overlay" id="products-scroll-container">
      
      {/* Top Navbar */}
      <nav className={`shop-navbar t-sans ${scrolled ? 'scrolled' : ''}`}>
        <button className="shop-close-btn" onClick={onClose}>
          <span className="arrow">←</span> <span className="btn-text">Trang Chủ</span>
        </button>
        <div className="shop-logo t-serif t-italic">
          <img src="/logo/DetSacHoa_Logo.png" alt="Logo Dệt Sắc Hoa" className="shop-brand-logo" />
          <span className="shop-brand-text">Dệt Sắc Hoa</span>
        </div>
        <button className="shop-cart-btn" onClick={() => setIsCartOpen(true)}>
          <span className="cart-label">Giỏ hàng</span> ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </nav>

      {/* Hero Banner */}
      <div className="shop-hero">
        <img src="/wp-content/themes/unseen/public/images/shop-hero.jpg" alt="Luxury Floral Collection" className="shop-hero-bg" />
        <div className="shop-hero-content">
          <h1 className="t-serif t-italic">Bộ Sưu Tập Nghệ Thuật</h1>
          <p className="t-sans">Tinh hoa tơ lụa thủ công, hoa cành tuyển chọn &amp; bình gốm nghệ thuật</p>
        </div>
      </div>

      <div className="shop-container">
        {/* Sticky Filter Bar */}
        <div className="shop-filter-bar t-sans">
          <div className="shop-categories">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`shop-filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="shop-sort">
            <span className="sort-label">Sắp xếp:</span>
            <select className="shop-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid: 5 sản phẩm/hàng desktop, 2 sản phẩm/hàng mobile */}
        <div className="shop-grid">
          {paginatedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="shop-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="shop-card-image">
                {product.badge && <span className="shop-badge t-sans">{product.badge}</span>}
                <img src={product.image} alt={product.name} loading="lazy" />
                <div className="shop-card-action">
                  <button className="shop-add-btn t-sans" onClick={() => addToCart(product)}>
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
              <div className="shop-card-info">
                <span className="shop-card-category t-sans">{product.category}</span>
                <h3 className="shop-card-name t-serif t-italic" title={product.name}>{product.name}</h3>
                <div className="shop-card-bottom-row">
                  <p className="shop-card-price t-sans">
                    {product.priceLabel}
                    {product.unit && <span className="shop-card-unit"> / {product.unit}</span>}
                  </p>
                  <button 
                    className="shop-card-mobile-add-btn" 
                    onClick={() => addToCart(product)}
                    title="Thêm vào giỏ hàng"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="shop-pagination-wrap t-sans">
            <div className="pagination-info">
              Hiển thị <strong>{startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</strong> trên tổng số <strong>{filteredProducts.length}</strong> sản phẩm • Trang <strong>{currentPage} / {totalPages}</strong>
            </div>
            <div className="shop-pagination">
              <button 
                className="page-btn page-nav-btn prev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Trang trước"
              >
                ← Trước
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`page-btn page-num ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button 
                className="page-btn page-nav-btn next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Trang sau"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Minimalist */}
      <footer className="shop-footer t-sans">
        <div className="footer-links">
          <a href="#">Chính sách đổi trả</a>
          <a href="#">Vận chuyển hỏa tốc</a>
          <a href="#">Bảo quản lụa</a>
          <a href="#">Chăm sóc khách hàng</a>
        </div>
        <p>© 2026 Dệt Sắc Hoa. All rights reserved.</p>
      </footer>

      {/* Cart Drawer Overlay */}
      <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
        <div className="cart-drawer t-sans" onClick={e => e.stopPropagation()}>
          <div className="cart-header">
            <h2>Túi mua sắm ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
            <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
          </div>
          
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <p>Giỏ hàng của bạn đang trống.</p>
                <button className="shop-now-btn" onClick={() => setIsCartOpen(false)}>Tiếp tục khám phá</button>
              </div>
            ) : (
              <>
                <div className="shipping-progress">
                  <p className="shipping-msg">
                    {amountToFreeShipping > 0 
                      ? <>Mua thêm <strong>{amountToFreeShipping.toLocaleString('vi-VN')} ₫</strong> để được Miễn phí giao hàng!</>
                      : <strong>🎉 Quý khách đã đủ điều kiện Miễn phí giao hàng toàn quốc!</strong>
                    }
                  </p>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <h4>{item.name}</h4>
                          <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                        </div>
                        <p className="cart-item-price">{item.priceLabel}</p>
                        
                        <div className="cart-item-actions">
                          <div className="quantity-selector">
                            <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                          </div>
                          <p className="cart-item-subtotal">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-promo">
                <input type="text" placeholder="Mã ưu đãi nghệ thuật" />
                <button>Áp dụng</button>
              </div>
              <div className="cart-total">
                <span>Tổng tạm tính</span>
                <span>{cartTotalFormatted}</span>
              </div>
              <p className="cart-taxes">Đã bao gồm thuế GTGT &amp; bảo hiểm vận chuyển an toàn.</p>
              <button className="checkout-btn">
                Thanh toán an toàn • {cartTotalFormatted}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

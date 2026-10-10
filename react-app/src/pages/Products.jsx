import React, { useState, useEffect } from 'react';
import './Products.css';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Bình Gốm Cổ Điển Mạ Vàng',
    price: 2500000,
    priceLabel: '2.500.000 ₫',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Bó Mẫu Đơn Quý Tộc',
    price: 1200000,
    priceLabel: '1.200.000 ₫',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Lụa Cao Cấp',
    badge: ''
  },
  {
    id: 3,
    name: 'Bình Thủy Tinh Pha Lê',
    price: 1850000,
    priceLabel: '1.850.000 ₫',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: 'Mới'
  },
  {
    id: 4,
    name: 'Hoa Hồng Đỏ Kiêu Sa',
    price: 850000,
    priceLabel: '850.000 ₫',
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Lụa Cao Cấp',
    badge: ''
  },
  {
    id: 5,
    name: 'Lọ Hoa Sứ Men Rạn',
    price: 3100000,
    priceLabel: '3.100.000 ₫',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Bình Hoa',
    badge: ''
  },
  {
    id: 6,
    name: 'Lan Hồ Điệp Thượng Hạng',
    price: 4500000,
    priceLabel: '4.500.000 ₫',
    image: 'https://images.unsplash.com/photo-1596547609652-9cb5d8d736bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hoa Lụa Cao Cấp',
    badge: 'Limited'
  }
];

const CATEGORIES = ['Tất cả', 'Bình Hoa', 'Hoa Lụa Cao Cấp', 'Combo Quà Tặng'];
const SORTS = ['Mặc định', 'Giá thấp - cao', 'Giá cao - thấp'];

export default function Products({ onClose }) {
  const [filter, setFilter] = useState('Tất cả');
  const [sort, setSort] = useState('Mặc định');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  let filteredProducts = filter === 'Tất cả' 
    ? [...MOCK_PRODUCTS] 
    : MOCK_PRODUCTS.filter(p => p.category === filter);

  if (sort === 'Giá thấp - cao') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'Giá cao - thấp') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

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
      }).filter(Boolean); // Remove items that became null (quantity 0)
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
          <span className="arrow">←</span> Trở về
        </button>
        <div className="shop-logo t-serif t-italic">Dệt Sắc Hoa</div>
        <button className="shop-cart-btn" onClick={() => setIsCartOpen(true)}>
          Giỏ hàng ({cart.length})
        </button>
      </nav>

      {/* Hero Banner */}
      <div className="shop-hero">
        <img src="/wp-content/themes/unseen/public/images/shop-hero.jpg" alt="Luxury Floral Collection" className="shop-hero-bg" />
        <div className="shop-hero-content">
          <h1 className="t-serif t-italic">Bộ Sưu Tập Nghệ Thuật</h1>
          <p className="t-sans">Tinh hoa gốm sứ và hương sắc ngàn năm.</p>
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

        {/* Product Grid */}
        <div className="shop-grid">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id + index} 
              className="shop-card"
              style={{ animationDelay: `${index * 0.1}s` }}
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
                <h3 className="shop-card-name t-serif t-italic">{product.name}</h3>
                <p className="shop-card-price t-sans">{product.priceLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Minimalist */}
      <footer className="shop-footer t-sans">
        <div className="footer-links">
          <a href="#">Chính sách đổi trả</a>
          <a href="#">Vận chuyển</a>
          <a href="#">Bảo quản lụa</a>
          <a href="#">Liên hệ</a>
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
                <button className="shop-now-btn" onClick={() => setIsCartOpen(false)}>Tiếp tục mua sắm</button>
              </div>
            ) : (
              <>
                <div className="shipping-progress">
                  <p className="shipping-msg">
                    {amountToFreeShipping > 0 
                      ? <>Mua thêm <strong>{amountToFreeShipping.toLocaleString('vi-VN')} ₫</strong> để được Miễn phí giao hàng!</>
                      : <strong>🎉 Bạn đã được Miễn phí giao hàng!</strong>
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
                <input type="text" placeholder="Mã giảm giá (nếu có)" />
                <button>Áp dụng</button>
              </div>
              <div className="cart-total">
                <span>Tổng tạm tính</span>
                <span>{cartTotalFormatted}</span>
              </div>
              <p className="cart-taxes">Thuế và phí vận chuyển sẽ được tính ở bước thanh toán.</p>
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

import React from 'react';
import './About.css';

export default function About({ onClose, onNavigate }) {
  const handleOpenStudio = () => {
    if (onNavigate) {
      onNavigate('ai-studio');
    } else if (onClose) {
      onClose();
    }
  };

  const handleOpenCollections = () => {
    if (onNavigate) {
      onNavigate('collections');
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="about-page">
      {/* Top Navigation */}
      <nav className="about-navbar">
        <button className="about-back-btn" onClick={onClose}>
          <span>←</span> Trở Về Trang Chủ
        </button>
        <div className="about-brand-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo/DetSacHoa_Logo.png" alt="Logo Dệt Sắc Hoa" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
          <span>Dệt Sắc Hoa • Về Chúng Tôi</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="about-hero">
        <div className="about-hero-content">
          <div className="about-pill-badge">
            ✦ DI SẢN LỤA THỦ CÔNG &amp; CÔNG NGHỆ 3D
          </div>
          <h1 className="about-hero-title">
            Dệt Sắc Hoa — Bản Giao Hưởng Của <em>Hoa Lụa</em> &amp; Thời Gian
          </h1>
          <p className="about-hero-desc">
            Nơi tinh hoa nghề dệt lụa truyền thống hội ngộ cùng đỉnh cao công nghệ mô phỏng 3D WebGL và thị giác máy tính AI, kiến tạo vẻ đẹp vĩnh cửu cho mọi không gian sống.
          </p>
          <div className="about-hero-actions">
            <button className="about-btn-primary" onClick={handleOpenStudio}>
              Khám Phá AI Studio 3D ✦
            </button>
            <button className="about-btn-outline" onClick={handleOpenCollections}>
              Xem Bộ Sưu Tập Nghệ Thuật
            </button>
          </div>
        </div>
      </header>

      {/* Brand Story Section */}
      <section className="about-section">
        <div className="about-story-grid">
          <div className="about-story-text">
            <h2>Khởi Nguồn Từ Xúc Cảm Di Sản</h2>
            <p>
              Xuất phát từ niềm say mê sâu sắc với kỹ nghệ dệt lụa tơ tằm cổ truyền và nghệ thuật cắm hoa cung đình, <strong>Dệt Sắc Hoa</strong> ra đời với sứ mệnh gìn giữ và nâng tầm vẻ đẹp tự nhiên vào từng tác phẩm hoa lụa cao cấp.
            </p>
            <p>
              Không giống những sản phẩm hoa nhân tạo sản xuất đại trà, mỗi nhành hoa tại Dệt Sắc Hoa là kết tinh từ hơn 20 công đoạn thủ công tỉ mỉ: từ lựa chọn lụa tơ tằm dệt tay, nhuộm ombré chuyển sắc tự nhiên, đến từng nhát dập gân lá và uốn nắn cánh hoa của những nghệ nhân giàu kinh nghiệm.
            </p>
            <div className="about-quote-box">
              <p>
                "Hoa tươi mang vẻ đẹp rung động của một khoảnh khắc, còn hoa lụa Dệt Sắc Hoa lưu giữ trọn vẹn xúc cảm và ký ức của cả một đời."
              </p>
            </div>
            <p>
              Chúng tôi tin rằng, cái đẹp đích thực không chỉ nằm ở vẻ ngoài lộng lẫy, mà còn ở chiều sâu tâm hồn và câu chuyện ẩn sau từng thớ lụa, lớp men gốm độc bản.
            </p>
          </div>

          <div className="about-image-card">
            <img 
              src="/wp-content/themes/unseen/public/images/floral-login.jpg" 
              alt="Nghệ thuật hoa lụa Dệt Sắc Hoa" 
            />
            <div className="about-image-card-caption">
              <strong>Kỹ nghệ thủ công tinh xảo</strong> — Từng cánh hoa được tạo hình và nhuộm màu thủ công từ lụa tơ tằm tự nhiên.
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="about-section">
        <div className="about-pillars-header">
          <h2>Bốn Trụ Cột Độc Bản</h2>
          <p>Giá trị cốt lõi định hình nên thương hiệu hoa lụa nghệ thuật cao cấp hàng đầu</p>
        </div>

        <div className="about-pillars-grid">
          <div className="about-pillar-card">
            <div className="about-pillar-num">01</div>
            <h3 className="about-pillar-title">Lụa Tơ Tằm Thượng Hạng</h3>
            <p className="about-pillar-desc">
              Chất liệu lụa tơ tằm tự nhiên 100%, dệt tay theo kỹ thuật cổ truyền, mang lại độ mềm mại, bay bổng và khả năng bắt sáng đa chiều sống động.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-num">02</div>
            <h3 className="about-pillar-title">Kỹ Nghệ Nghệ Nhân</h3>
            <p className="about-pillar-desc">
              Từng cánh hoa, nụ non và cuống lá được các nghệ nhân lành nghề uốn tạo hình độc bản. Không có hai tác phẩm nào hoàn toàn giống hệt nhau.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-num">03</div>
            <h3 className="about-pillar-title">Gốm Men &amp; Pha Lê</h3>
            <p className="about-pillar-desc">
              Bình hoa chế tác từ men ngọc celadon cổ truyền, sứ mạ vàng vát cạnh và pha lê khúc xạ ánh sáng, tạo nên tổng thể quý phái và uy nghiêm.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-num">04</div>
            <h3 className="about-pillar-title">Tiên Phong AI 3D WebGL</h3>
            <p className="about-pillar-desc">
              Ứng dụng công nghệ đồ họa 3D thời gian thực và AI Vision giúp người thưởng hoa xoay 360°, phóng to chi tiết và ướm thử vào phòng trước khi sở hữu.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="about-stats-strip">
        <div className="about-stats-inner">
          <div>
            <div className="about-stat-number">50+</div>
            <div className="about-stat-label">Nghệ Nhân Lành Nghề</div>
          </div>
          <div>
            <div className="about-stat-number">100+</div>
            <div className="about-stat-label">Giờ Chế Tác / Tuyệt Tác</div>
          </div>
          <div>
            <div className="about-stat-number">15K+</div>
            <div className="about-stat-label">Không Gian Tỏa Sáng</div>
          </div>
          <div>
            <div className="about-stat-number">100%</div>
            <div className="about-stat-label">Bền Đẹp Vĩnh Cửu</div>
          </div>
        </div>
      </div>

      {/* Second Visual Story: Traditional craft meet 3D tech */}
      <section className="about-section">
        <div className="about-story-grid" style={{ direction: 'rtl' }}>
          <div className="about-story-text" style={{ direction: 'ltr' }}>
            <h2>Giao Điểm Tương Lai Của Nghệ Thuật Không Gian</h2>
            <p>
              Với mong muốn giúp khách hàng cảm nhận trọn vẹn từng đường nét của bình hoa trước khi đặt vào không gian sống, Dệt Sắc Hoa tiên phong tích hợp <strong>AI Flower Studio</strong>.
            </p>
            <p>
              Chỉ với một bức ảnh chụp căn phòng của bạn, hệ thống AI Vision sẽ tự động phân tích phong cách thiết kế, sắc độ ánh sáng và bảng màu chủ đạo để đề xuất mẫu bình hoa hài hòa phong thủy và thẩm mỹ nhất.
            </p>
            <div style={{ marginTop: '28px' }}>
              <button className="about-btn-primary" onClick={handleOpenStudio}>
                Trải Nghiệm AI Studio Ngay ✦
              </button>
            </div>
          </div>

          <div className="about-image-card" style={{ direction: 'ltr' }}>
            <img 
              src="/wp-content/themes/unseen/public/images/collection-1.jpg" 
              alt="Bình hoa lụa sang trọng trong không gian sống" 
            />
            <div className="about-image-card-caption">
              <strong>Sự đồng điệu giữa nội thất &amp; hoa lụa</strong> — Tôn vinh vẻ đẹp vương giả cho phòng khách, phòng trà và sảnh biệt thự.
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Box */}
      <section className="about-cta-section">
        <div className="about-cta-box">
          <h2>Đồng Hành Cùng Chúng Tôi Kiến Tạo Vẻ Đẹp</h2>
          <p>
            Khám phá những thiết kế hoa lụa giới hạn hoặc bắt đầu trải nghiệm phòng thử 3D để tìm kiếm tác phẩm hoàn hảo cho không gian của bạn.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="about-btn-primary" onClick={handleOpenStudio}>
              Khám Phá AI Studio
            </button>
            <button className="about-btn-outline" onClick={handleOpenCollections}>
              Xem Bộ Sưu Tập
            </button>
            <button className="about-btn-outline" onClick={onClose}>
              Quay Về Trang Chủ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

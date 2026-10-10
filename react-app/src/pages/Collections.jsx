import React, { useEffect, useState } from 'react';
import './Collections.css';

const COLLECTIONS = [
  {
    id: '01',
    title: 'Giao Hưởng Đỏ',
    subtitle: 'Sự đam mê bất diệt',
    story: 'Lấy cảm hứng từ những bản tình ca vượt thời gian, "Giao Hưởng Đỏ" mang trong mình vẻ đẹp kiêu sa của những đóa hồng nhung đỏ rực. Từng đường nét được tạo hình thủ công, sắp đặt tinh tế trong chiếc bình đồng cổ điển, tạo nên một kiệt tác không chỉ để trang trí, mà còn để thắp sáng không gian sống của bạn bằng một niềm đam mê bất diệt. Tác phẩm này tôn vinh sự quyền lực và sang trọng tột bậc.',
    image: '/wp-content/themes/unseen/public/images/collection-1.jpg',
    color: '#3d0c11'
  },
  {
    id: '02',
    title: 'Sương Mai Thuần Khiết',
    subtitle: 'Nét thanh tao của sương sớm',
    story: 'Khắc họa lại khoảnh khắc tia nắng ban mai chạm vào những giọt sương đọng trên cánh hoa lan trắng. "Sương Mai Thuần Khiết" là sự kết hợp hoàn hảo giữa nét đẹp mong manh của hoa lan và sự mộc mạc của cỏ lau khô. Đặt trong chiếc bình gốm trắng cổ, tác phẩm mang đến một không gian tĩnh lặng, an yên, giúp tâm hồn tìm lại sự cân bằng giữa cuộc sống hối hả.',
    image: '/wp-content/themes/unseen/public/images/collection-2.jpg',
    color: '#e2ddcc'
  },
  {
    id: '03',
    title: 'Hoàng Kim Kỷ Nguyên',
    subtitle: 'Tuyệt tác của sự vương giả',
    story: 'Được chế tác từ những loài hoa quý hiếm với tông màu vàng ánh kim và trắng ngà, "Hoàng Kim Kỷ Nguyên" là biểu tượng của sự thịnh vượng và quyền uy. Dành riêng cho những không gian xa hoa, thiết kế này đòi hỏi hơn 100 giờ làm việc thủ công từ các nghệ nhân lành nghề nhất của Dệt Sắc Hoa, nhằm lưu giữ trọn vẹn từng đường vân lá và cánh hoa rực rỡ.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    color: '#d4af37'
  }
];

export default function Collections({ onClose }) {
  
  return (
    <div className="collections-page">
      <nav className="collections-navbar t-sans">
        <button className="collections-close-btn" onClick={onClose}>
          <span className="arrow">←</span> Trở về Trang Chủ
        </button>
        <div className="collections-logo t-serif t-italic">Bộ Sưu Tập Nghệ Thuật</div>
      </nav>

      <div className="collections-header">
        <h1 className="t-serif t-italic">Chuyện Kẻ Dệt Hoa</h1>
        <p className="t-sans">Mỗi tác phẩm là một câu chuyện được dệt nên từ cảm xúc và thời gian.</p>
        <div className="scroll-indicator t-sans">Cuộn xuống khám phá ↓</div>
      </div>

      <div className="collections-content">
        {COLLECTIONS.map((col, index) => (
          <section key={col.id} className={`collection-section ${index % 2 !== 0 ? 'reverse' : ''}`}>
            
            {/* Sticky Image Side */}
            <div className="collection-visual">
              <div className="sticky-wrapper">
                <img src={col.image} alt={col.title} loading="lazy" />
                <div className="collection-number t-sans">{col.id}</div>
              </div>
            </div>

            {/* Story Side */}
            <div className="collection-story-container d-flex flex-column justify-center">
              <div className="collection-story-content">
                <h4 className="collection-subtitle t-sans" style={{ color: col.color }}>{col.subtitle}</h4>
                <h2 className="collection-title t-serif t-italic">{col.title}</h2>
                <div className="collection-divider" style={{ background: col.color }}></div>
                <p className="collection-text t-sans">
                  {col.story}
                </p>
                <button className="explore-btn t-sans" style={{ borderColor: col.color, color: col.color }}>
                  Khám phá tác phẩm
                </button>
              </div>
            </div>

          </section>
        ))}
      </div>

      <footer className="collections-footer t-sans">
        <h2>Bạn muốn viết nên câu chuyện của riêng mình?</h2>
        <button className="contact-btn">Liên hệ Thiết kế Riêng</button>
      </footer>
    </div>
  );
}

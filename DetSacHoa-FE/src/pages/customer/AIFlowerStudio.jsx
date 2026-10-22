import React, { useState, useRef } from 'react';
import './AIFlowerStudio.css';
import ThreeVaseViewer from '../../components/ThreeVaseViewer';
import { 
  IconSparkles, 
  IconFlower, 
  IconEye, 
  IconPlus
} from '../../components/AdminIcons';


// Sample luxury rooms for instant evaluation
const sampleRooms = [
  {
    id: 'indochine',
    name: 'Phòng Khách Indochine',
    style: 'Indochine Luxury',
    palette: ['#4a3525', '#d4a373', '#fefae0', '#e9edc9'],
    matchScore: 98,
    advice: 'Không gian nội thất gỗ mun ấm áp rất hài hòa với bình gốm men ngọc và hoa sen lụa Hà Đông thanh tao, cân bằng phong thủy vượng khí.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200'
  },
  {
    id: 'minimalist',
    name: 'Căn Hộ Hiện Đại',
    style: 'Modern Minimalist',
    palette: ['#f8fafc', '#94a3b8', '#334155', '#e2e8f0'],
    matchScore: 96,
    advice: 'Phòng mang phong cách tối giản thanh lịch, một bình thủy tinh khói phối hoa lan hồ điệp lụa trắng sẽ là nét chấm phá đắt giá.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200'
  },
  {
    id: 'tea-room',
    name: 'Phòng Trà Thiền Tịnh',
    style: 'Zen & Organic',
    palette: ['#c7b198', '#dfd3c3', '#f0ece2', '#596e79'],
    matchScore: 95,
    advice: 'Không gian thư thái thưởng trà phù hợp với bình gốm men rạn mộc mạc và hoa cúc họa mi lụa tơ tằm thuần khiết.',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200'
  },
  {
    id: 'dining',
    name: 'Bàn Tiệc Cung Đình',
    style: 'Royal Classic',
    palette: ['#3b181e', '#800020', '#d4af37', '#fdf0d5'],
    matchScore: 99,
    advice: 'Bàn tiệc sang trọng cần một bình gốm dát vàng đi kèm đóa mẫu đơn lụa đỏ nhung để tôn vinh sự vương giả, sung túc.',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200'
  }
];

// Danh sách các sản phẩm hoa 3D cao cấp (5 sản phẩm mỗi trang)
const FLOWER_PRODUCTS = [
  {
    id: 'ribbed_luoshen_roses',
    name: 'Trụ Gân & Lạc Thần',
    desc: 'Gốm trụ gân ngang + 18 đóa hồng Lạc Thần, nụ hồng & hoa sao'
  },
  {
    id: 'fluted_proud_roses',
    name: 'Sứ Khía & Hồng Proud',
    desc: 'Bình khía tân cổ điển + 18 đóa hồng Proud trắng ngọc'
  },
  {
    id: 'cat_red_roses',
    name: 'Bình Mèo & Hồng Đỏ',
    desc: 'Gốm quai rót vẽ hai chú mèo + hồng nhung đỏ & hạt cỏ'
  },
  {
    id: 'peony_noble_vase',
    name: 'Pha Lê & Mẫu Đơn Quý Tộc',
    desc: 'Pha lê vát cạnh mạ vàng + đóa mẫu đơn lụa hồng phấn & lan ý'
  },
  {
    id: 'lotus_celadon_zen',
    name: 'Men Ngọc & Sen Tịnh Liên',
    desc: 'Gốm men celadon cổ điển + đóa sen hồng lụa tơ tằm & đài sen'
  },
  {
    id: 'orchid_white_cascade',
    name: 'Khói Đen & Lan Hồ Điệp',
    desc: 'Thủy tinh khói hiện đại + 9 cành lan hồ điệp trắng ngọc buông rủ'
  },
  {
    id: 'vintage_gold_roses',
    name: 'Gốm Cổ Điển & Hồng Sa Mạc',
    desc: 'Gốm vuốt men mộc + hồng cappuccino vàng kem & cành bạch đàn khô'
  },
  {
    id: 'daisy_wildflower_rustic',
    name: 'Men Rạn & Cúc Họa Mi',
    desc: 'Gốm men rạn Bát Tràng + chùm cúc họa mi trắng & hoa dại mộc mạc'
  },
  {
    id: 'hydrangea_blue_palace',
    name: 'Sứ Lam & Cẩm Tú Cầu',
    desc: 'Sứ men lam hoa văn hoàng gia + cẩm tú cầu xanh pastel bồng bềnh'
  },
  {
    id: 'tulip_spring_elegance',
    name: 'Thủy Tinh & Tulip Hà Lan',
    desc: 'Thủy tinh trong suốt Bắc Âu + 24 nhánh tulip lụa đa sắc thanh lịch'
  }
];

export default function AIFlowerStudio({ onClose }) {
  const [selectedRoom, setSelectedRoom] = useState(sampleRooms[0]);
  const [customRoomImage, setCustomRoomImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Active 3D Design
  const [activeDesign, setActiveDesign] = useState('ribbed_luoshen_roses');

  // Pagination: 5 sản phẩm mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(FLOWER_PRODUCTS.length / ITEMS_PER_PAGE);
  const currentFlowerProducts = FLOWER_PRODUCTS.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Base 3D display states (used until custom 3D model is uploaded by user)
  const [vaseModel, setVaseModel] = useState('teardrop');
  const [material, setMaterial] = useState('celadon');
  const [flower, setFlower] = useState('lotus');
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  // Studio Mode: '3d' (Full 3D WebGL Studio) | 'ar' (In-Room AR Placement)
  const [mode, setMode] = useState('3d');
  
  // AR Placement draggable state (aligned to tabletop surface)
  const [vasePos, setVasePos] = useState({ x: 50, y: 76 });
  const [vaseScale, setVaseScale] = useState(0.95);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const threeViewerRef = useRef(null);

  // File Upload Handler for Room Photo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomRoomImage(event.target.result);
        triggerScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetRoom = (room) => {
    setCustomRoomImage(null);
    setSelectedRoom(room);
    triggerScanning();
  };

  const triggerScanning = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1600);
  };

  // AR Drag & Drop Handlers
  const handleARMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragOffset({
      x: ((e.clientX - rect.left) / rect.width) * 100 - vasePos.x,
      y: ((e.clientY - rect.top) / rect.height) * 100 - vasePos.y
    });
  };

  const handleARMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    const newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    setVasePos({
      x: Math.max(10, Math.min(90, newX)),
      y: Math.max(15, Math.min(85, newY))
    });
  };

  const handleARMouseUp = () => {
    setIsDragging(false);
  };

  // Download 3D Snapshot
  const handleDownload = () => {
    if (threeViewerRef.current) {
      const dataUrl = threeViewerRef.current.getSnapshot();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `DetSacHoa-3D-PhốiCảnh.png`;
        link.href = dataUrl;
        link.click();
        return;
      }
    }
    alert('Đang lưu bản vẽ phối cảnh 3D độ phân giải cao...');
  };

  const activeRoomImage = customRoomImage || selectedRoom.imageUrl;

  return (
    <div className="ai-studio-overlay">
      {/* TOP HEADER */}
      <div className="ai-studio-header">
        <div className="ai-studio-brand">
          <span className="ai-badge-pulse">
            <IconSparkles size={14} /> AI Vision 3D Studio
          </span>
          <div className="ai-studio-title">
            <h2>Dệt Sắc Hoa — Sáng Tạo 3D Không Gian Sống</h2>
            <p>Hệ thống phân tích căn phòng & thiết kế bình hoa lụa 3D thời gian thực (Three.js WebGL)</p>
          </div>
        </div>

        <button className="ai-close-btn" onClick={onClose}>
          ✕ Thoát Studio
        </button>
      </div>

      {/* STUDIO WORKSPACE */}
      <div className="ai-studio-body">
        
        {/* LEFT PANEL: UPLOAD & ROOM SELECTION */}
        <div className="ai-studio-panel-left">
          <div>
            <h3 className="ai-panel-heading">
              <IconEye size={18} color="#e11d48" /> 1. Không Gian Căn Phòng
            </h3>
            <p className="ai-panel-sub">Tải ảnh không gian phòng để ướm thử bình hoa</p>
          </div>

          {/* Upload Dropzone for Room */}
          <label className="ai-dropzone">
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <div className="ai-dropzone-icon">
              <IconPlus size={24} />
            </div>
            <strong style={{ display: 'block', fontSize: '0.88rem', color: '#881337' }}>
              Tải Ảnh Phòng Của Bạn
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Chụp phòng khách, sảnh, bàn trà hoặc phòng ngủ
            </span>
          </label>

          {/* AI Vision Analysis Results */}
          <div className="ai-analysis-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9f1239', fontWeight: 700, fontSize: '0.88rem' }}>
              <IconSparkles size={16} /> Phân Tích AI Vision
            </div>

            <div>
              <div className="ai-match-meter">
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>Độ Tương Thích Thẩm Mỹ:</span>
                <strong style={{ color: '#059669', fontSize: '0.9rem' }}>{selectedRoom.matchScore}%</strong>
              </div>
              <div className="ai-meter-bar">
                <div className="ai-meter-fill" style={{ width: `${selectedRoom.matchScore}%` }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>Phong Cách Nhận Diện:</span>
              <strong style={{ color: '#1e293b' }}>{selectedRoom.style}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>Bảng Màu Chủ Đạo:</span>
              <div className="ai-palette-pill">
                {selectedRoom.palette.map((c, i) => (
                  <span key={i} className="color-dot" style={{ backgroundColor: c }}></span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '0.25rem', padding: '0.65rem', background: '#fff1f2', borderRadius: '8px', borderLeft: '3px solid #f43f5e', fontSize: '0.78rem', color: '#881337', lineHeight: '1.4' }}>
              💡 <em>"{selectedRoom.advice}"</em>
            </div>
          </div>
        </div>

        {/* CENTER VIEWPORT: TRUE 3D WEBGL ENGINE & AR IN-ROOM PLACEMENT */}
        <div className="ai-studio-viewport">
          {/* Mode Switcher */}
          <div className="ai-mode-toggle">
            <button 
              className={`ai-mode-btn ${mode === '3d' ? 'active' : ''}`}
              onClick={() => setMode('3d')}
            >
              ✦ Mô Hình 3D Studio (Three.js)
            </button>
            <button 
              className={`ai-mode-btn ${mode === 'ar' ? 'active' : ''}`}
              onClick={() => setMode('ar')}
            >
              🌿 Ướm Vào Phòng Thực Tế (AR)
            </button>
          </div>

          {/* 3D WebGL Studio Mode */}
          {mode === '3d' && (
            <div className="ai-3d-canvas-wrap">
              <ThreeVaseViewer 
                ref={threeViewerRef}
                designId={activeDesign}
                vaseModel={vaseModel}
                material={material}
                flower={flower}
                autoRotate={isAutoRotate}
                isOverlay={false}
              />

              {/* 3D Quick Floating Toolbar */}
              <div className="ai-3d-quick-toolbar">
                <button 
                  className={`ai-quick-btn ${isAutoRotate ? 'active' : ''}`}
                  onClick={() => setIsAutoRotate(prev => !prev)}
                  title="Bật/Tắt tự động xoay 360°"
                >
                  🔄 {isAutoRotate ? 'Dừng Xoay' : 'Tự Động Xoay 360°'}
                </button>

                <button 
                  className="ai-quick-btn"
                  onClick={handleDownload}
                  title="Chụp ảnh render 3D"
                >
                  📸 Chụp Ảnh 3D
                </button>
              </div>


              <div className="ai-3d-hint">
                🖱️ Giữ chuột trái để xoay 360° • Cuộn chuột để phóng to/thu nhỏ • Giữ chuột phải để di chuyển góc nhìn
              </div>
            </div>
          )}

          {/* AR In-Room Placement Mode */}
          {mode === 'ar' && (
            <div 
              className="ai-room-overlay-wrap"
              onMouseMove={handleARMouseMove}
              onMouseUp={handleARMouseUp}
            >
              <img 
                src={activeRoomImage} 
                alt="Room Background" 
                className="ai-room-bg-image"
              />

              {/* Scanning Laser Animation */}
              {isScanning && (
                <div className="ai-scanner-overlay">
                  <div className="ai-scan-line"></div>
                  <div className="ai-detected-box" style={{ top: '55%', left: '42%', width: '18%', height: '26%' }}>
                    <div className="ai-box-label">Vị Trí Đặt Bình Tối Ưu Phong Thủy</div>
                  </div>
                </div>
              )}

              {/* Real 3D Vase Draggable on Room Photo */}
              <div 
                className="ai-ar-vase-draggable"
                style={{
                  top: `${vasePos.y}%`,
                  left: `${vasePos.x}%`,
                  transform: `translate(-50%, -85%) scale(${vaseScale})`,
                  transformOrigin: '50% 85%',
                  width: '380px',
                  height: '520px'
                }}
                onMouseDown={handleARMouseDown}
              >
                <ThreeVaseViewer 
                  designId={activeDesign}
                  vaseModel={vaseModel}
                  material={material}
                  flower={flower}
                  autoRotate={false}
                  isOverlay={true}
                />
              </div>

              {/* AR Adjustment Controls Overlay */}
              <div className="ai-ar-control-bar">
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Kích Thước Bình:
                </span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={vaseScale}
                  onChange={(e) => setVaseScale(parseFloat(e.target.value))}
                  style={{ accentColor: '#f43f5e', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.82rem', color: '#be123c', fontWeight: 700 }}>
                  {Math.round(vaseScale * 100)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', borderLeft: '1px solid #fecdd3', paddingLeft: '0.85rem' }}>
                  Kéo thả bình hoa đến vị trí bàn/kệ trong phòng
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CHỈ CHỨA CÁC SẢN PHẨM HOA */}
        <div className="ai-studio-panel-right">
          <div>
            <h3 className="ai-panel-heading">
              <IconFlower size={18} color="#e11d48" /> 2. Sản Phẩm Bình Hoa 3D
            </h3>
            <p className="ai-panel-sub">Bộ sưu tập bình hoa lụa thiết kế 3D cao cấp</p>
          </div>

          {/* Design Switcher Buttons */}
          <div className="ai-design-switcher-wrap">
            {currentFlowerProducts.map((item) => (
              <button
                key={item.id}
                className={`ai-design-tab-card ${activeDesign === item.id ? 'active' : ''}`}
                onClick={() => setActiveDesign(item.id)}
              >
                <div className="ai-design-tab-title">{item.name}</div>
                <div className="ai-design-tab-desc">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="ai-pagination-wrap">
              <button 
                className="ai-page-nav-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Trang trước"
              >
                ‹ Trước
              </button>
              <div className="ai-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`ai-page-num ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                className="ai-page-nav-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Trang sau"
              >
                Sau ›
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

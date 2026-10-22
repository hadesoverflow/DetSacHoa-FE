// API client for Dệt Sắc Hoa Admin & Backend integration
// Supports live connection to .NET RESTful API (default: http://localhost:5000/api)
// with automatic graceful fallback to local storage / memory data for offline presentation

const API_BASE_URL = 'http://localhost:5000/api';

// Initial mock data identical to SQL Server DbInitializer.cs
const initialData = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@detsachoa.vn',
      fullName: 'Quản Trị Viên Tối Cao',
      phoneNumber: '0901234567',
      address: '79 Phố Huế, Hoàn Kiếm, Hà Nội',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Admin',
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
      lastLoginAt: '2026-10-21T03:30:00Z'
    },
    {
      id: 2,
      username: 'lananh.silk',
      email: 'lananh@detsachoa.vn',
      fullName: 'Trần Thị Lan Anh',
      phoneNumber: '0912345678',
      address: 'Làng Lụa Vạn Phúc, Hà Đông, Hà Nội',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: 'Staff',
      isActive: true,
      createdAt: '2026-01-15T09:30:00Z',
      lastLoginAt: '2026-10-20T14:15:00Z'
    },
    {
      id: 3,
      username: 'hoangyen99',
      email: 'hoangyen@gmail.com',
      fullName: 'Nguyễn Hoàng Yến',
      phoneNumber: '0988776655',
      address: 'Quận 1, TP. Hồ Chí Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      role: 'Customer',
      isActive: true,
      createdAt: '2026-02-10T11:00:00Z',
      lastLoginAt: '2026-10-18T20:00:00Z'
    },
    {
      id: 4,
      username: 'minhtriet.le',
      email: 'triet.le@outlook.com',
      fullName: 'Lê Minh Triết',
      phoneNumber: '0933221100',
      address: 'Hải Châu, Đà Nẵng',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Customer',
      isActive: true,
      createdAt: '2026-03-05T16:45:00Z',
      lastLoginAt: '2026-10-15T10:30:00Z'
    },
    {
      id: 5,
      username: 'bichngoc',
      email: 'bichngoc@yahoo.com',
      fullName: 'Phạm Bích Ngọc',
      phoneNumber: '0977665544',
      address: 'Ninh Kiều, Cần Thơ',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'Customer',
      isActive: false,
      createdAt: '2026-03-20T14:00:00Z',
      lastLoginAt: '2026-09-01T08:00:00Z'
    }
  ],
  categories: [
    { id: 1, name: 'Áo Dài Lụa Tơ Tằm', slug: 'ao-dai-lua-to-tam', description: 'Trang phục truyền thống thêu tay nghệ nhân', displayOrder: 1, productCount: 2 },
    { id: 2, name: 'Khăn Choàng Lụa Hà Đông', slug: 'khan-choang-lua-ha-dong', description: 'Phụ kiện dệt trơn mềm mại tự nhiên', displayOrder: 2, productCount: 1 },
    { id: 3, name: 'Vải Lụa Thượng Uyển', slug: 'vai-lua-thuong-uyen', description: 'Lụa mét cao cấp gấm hoa vân cung đình', displayOrder: 3, productCount: 1 },
    { id: 4, name: 'Phụ Kiện Lụa Cung Đình', slug: 'phu-kien-lua-cung-dinh', description: 'Túi gấm quạt lụa và trâm cài phong nhã', displayOrder: 4, productCount: 1 }
  ],
  products: [
    {
      id: 1,
      name: 'Áo Dài Lụa Hà Đông Thêu Hoa Sen',
      slug: 'ao-dai-lua-ha-dong-theu-hoa-sen',
      sku: 'AD-SEN-001',
      shortDescription: 'Áo dài lụa tơ tằm dệt thủ công thêu hoa sen chỉ tơ vàng óng.',
      description: 'Được dệt từ 100% sợi tơ tằm tự nhiên tại làng lụa Hà Đông, áo dài tôn vinh vẻ đẹp thanh tao, quý phái của phụ nữ Việt Nam.',
      price: 3850000,
      originalPrice: 4500000,
      stockQuantity: 18,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
      categoryId: 1,
      categoryName: 'Áo Dài Lụa Tơ Tằm',
      isFeatured: true,
      isActive: true,
      createdAt: '2026-01-10T00:00:00Z'
    },
    {
      id: 2,
      name: 'Áo Dài Gấm Phượng Hoàng Cung Đình',
      slug: 'ao-dai-gam-phuong-hoang-cung-dinh',
      sku: 'AD-PH-002',
      shortDescription: 'Lụa gấm dệt hoa văn phượng hoàng triều Nguyễn cổ điển.',
      description: 'Chất vải gấm tơ tằm óng ả với chi tiết phượng hoàng cách điệu sắc sảo, đường may đo thủ công tinh xảo.',
      price: 4950000,
      originalPrice: 5800000,
      stockQuantity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
      categoryId: 1,
      categoryName: 'Áo Dài Lụa Tơ Tằm',
      isFeatured: true,
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z'
    },
    {
      id: 3,
      name: 'Khăn Lụa Tơ Tằm Nhuộm Màu Tự Nhiên',
      slug: 'khan-lua-to-tam-nhuom-mau-tu-nhien',
      sku: 'KL-NAT-001',
      shortDescription: 'Khăn lụa mỏng nhẹ nhuộm màu tự nhiên từ lá trầu, củ nâu.',
      description: 'Chất liệu lụa satin tơ tằm mềm mại êm ái, bảo vệ làn da và tăng nét sang trọng thanh lịch khi phối cùng trang phục công sở hoặc dạ hội.',
      price: 1250000,
      originalPrice: 1500000,
      stockQuantity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
      categoryId: 2,
      categoryName: 'Khăn Choàng Lụa Hà Đông',
      isFeatured: false,
      isActive: true,
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Vải Lụa Sa Nam Đàn Cao Cấp',
      slug: 'vai-lua-sa-nam-dan-cao-cap',
      sku: 'VL-SND-001',
      shortDescription: 'Vải lụa mộc dệt thoi truyền thống, độ rủ bay bổng.',
      description: 'Khổ vải 1.1m, thích hợp may âu phục, đầm dạ hội hoặc áo dài cao cấp với độ bền sợi tự nhiên qua nhiều thập kỷ.',
      price: 850000,
      originalPrice: 950000,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600',
      categoryId: 3,
      categoryName: 'Vải Lụa Thượng Uyển',
      isFeatured: false,
      isActive: true,
      createdAt: '2026-02-15T00:00:00Z'
    },
    {
      id: 5,
      name: 'Túi Gấm Lụa Thêu Tay Phong Cách Hoàng Gia',
      slug: 'tui-gam-lua-theu-tay-phong-cach-hoang-gia',
      sku: 'PK-TG-001',
      shortDescription: 'Túi dạ tiệc khung kim loại bọc gấm lụa thủ công.',
      description: 'Thiết kế cổ điển kết hợp khóa bấm đính ngọc trai nhân tạo sang trọng, mang lại thần thái đài các quý phái.',
      price: 1650000,
      originalPrice: 1900000,
      stockQuantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
      categoryId: 4,
      categoryName: 'Phụ Kiện Lụa Cung Đình',
      isFeatured: true,
      isActive: true,
      createdAt: '2026-03-01T00:00:00Z'
    }
  ],
  feedbacks: [
    {
      id: 1,
      customerName: 'Nguyễn Thị Minh Nguyệt',
      customerEmail: 'minhnguyet.art@gmail.com',
      customerPhone: '0908112233',
      rating: 5,
      subject: 'Áo dài lụa hoa sen quá tuyệt vời!',
      content: 'Chất vải lụa tơ tằm rất mát và mềm, đường kim mũi chỉ thêu hoa sen vô cùng tinh xảo. Tôi mặc đi dự tiệc ngoại giao và nhận được vô số lời khen ngợi.',
      status: 'Approved',
      adminReply: 'Dệt Sắc Hoa chân thành cảm ơn chị Minh Nguyệt đã tin tưởng lựa chọn tơ lụa truyền thống Việt Nam!',
      repliedAt: '2026-03-02T10:00:00Z',
      userId: 3,
      createdAt: '2026-03-01T15:20:00Z'
    },
    {
      id: 2,
      customerName: 'Hoàng Anh Tuấn',
      customerEmail: 'anhtuan.hn@gmail.com',
      customerPhone: '0919223344',
      rating: 5,
      subject: 'Món quà tặng mẹ rất ý nghĩa',
      content: 'Khăn lụa Hà Đông đóng hộp rất sang trọng và trang nhã, mẹ tôi rất thích màu nhuộm lá trầu cổ kính.',
      status: 'Approved',
      adminReply: 'Cảm ơn anh Tuấn! Dệt Sắc Hoa luôn sẵn lòng đồng hành trong những món quà tri ân gia đình.',
      repliedAt: '2026-03-06T14:30:00Z',
      userId: 4,
      createdAt: '2026-03-05T09:15:00Z'
    },
    {
      id: 3,
      customerName: 'Vũ Thanh Hằng',
      customerEmail: 'thanhhang.vu@gmail.com',
      customerPhone: '0978334455',
      rating: 4,
      subject: 'Thời gian giao hàng hơi chậm một chút',
      content: 'Chất lượng vải lụa gấm rất tốt nhưng đơn vị vận chuyển mất 4 ngày mới tới nơi. Hy vọng shop có thêm dịch vụ hỏa tốc.',
      status: 'Pending',
      adminReply: null,
      repliedAt: null,
      userId: null,
      createdAt: '2026-03-10T16:40:00Z'
    },
    {
      id: 4,
      customerName: 'Đặng Mai Phương',
      customerEmail: 'maiphuong.dang@gmail.com',
      customerPhone: '0934556677',
      rating: 5,
      subject: 'Tư vấn nhiệt tình, sản phẩm chuẩn như hình',
      content: 'Nhân viên hỗ trợ tư vấn số đo chuẩn xác, áo dài mặc vừa vặn như in. Sẽ tiếp tục ủng hộ Dệt Sắc Hoa.',
      status: 'Approved',
      adminReply: 'Cảm ơn chị Mai Phương rất nhiều ạ!',
      repliedAt: '2026-03-12T11:00:00Z',
      userId: null,
      createdAt: '2026-03-11T08:30:00Z'
    },
    {
      id: 5,
      customerName: 'Trịnh Quốc Bảo',
      customerEmail: 'quocbao.trinh@yahoo.com',
      customerPhone: '0903889900',
      rating: 3,
      subject: 'Cần hướng dẫn bảo quản lụa chi tiết hơn',
      content: 'Chất lượng khăn lụa đẹp nhưng shop nên kèm theo tờ hướng dẫn giặt ủi lụa bằng nước giặt tơ tằm chuyên dụng trong hộp.',
      status: 'Pending',
      adminReply: null,
      repliedAt: null,
      userId: null,
      createdAt: '2026-03-15T14:10:00Z'
    }
  ]
};

// Initialize localStorage cache if not exists
const loadStorageData = () => {
  try {
    const raw = localStorage.getItem('detsachoa_admin_data');
    if (!raw) {
      localStorage.setItem('detsachoa_admin_data', JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
};

const saveStorageData = (data) => {
  try {
    localStorage.setItem('detsachoa_admin_data', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Get auth token from storage
export const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('detsachoa_token');
    const user = JSON.parse(localStorage.getItem('detsachoa_user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const setStoredAuth = (token, user) => {
  if (token) localStorage.setItem('detsachoa_token', token);
  else localStorage.removeItem('detsachoa_token');

  if (user) localStorage.setItem('detsachoa_user', JSON.stringify(user));
  else localStorage.removeItem('detsachoa_user');
};

export const clearStoredAuth = () => {
  localStorage.removeItem('detsachoa_token');
  localStorage.removeItem('detsachoa_user');
};

// Helper for HTTP requests with backend detection
const request = async (endpoint, options = {}) => {
  const { token } = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for offline fallback

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Yêu cầu không thành công');
    }
    return json;
  } catch (err) {
    // Return null to signal fallback to local data
    return null;
  }
};

// ================= ADMIN SERVICES =================

// 1. Auth Service
export const adminAuthService = {
  login: async (usernameOrEmail, password) => {
    // Try live API first
    const liveRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });

    if (liveRes && liveRes.success) {
      setStoredAuth(liveRes.data.token, liveRes.data.user);
      return liveRes;
    }

    // Local Mock Fallback
    const db = loadStorageData();
    const user = db.users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail.trim().toLowerCase() ||
       u.email.toLowerCase() === usernameOrEmail.trim().toLowerCase())
    );

    // Default admin password verification: Admin@123 or any password for testing
    if (!user || (user.username === 'admin' && password !== 'Admin@123' && password !== 'admin')) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Mẹo tài khoản Admin: admin / Admin@123'
      };
    }

    if (!user.isActive) {
      return { success: false, message: 'Tài khoản của bạn đã bị khóa.' };
    }

    const mockToken = `mock-jwt-token-detsachoa-${user.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const response = {
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token: mockToken,
        tokenType: 'Bearer',
        expiresAt,
        user
      }
    };

    setStoredAuth(mockToken, user);
    return response;
  },

  logout: () => {
    clearStoredAuth();
  }
};

// 2. Dashboard Service
export const adminDashboardService = {
  getStats: async () => {
    const liveRes = await request('/dashboard/stats');
    if (liveRes && liveRes.success) return liveRes.data;

    // Local Fallback
    const db = loadStorageData();
    const totalUsers = db.users.length;
    const totalProducts = db.products.length;
    const activeProducts = db.products.filter(p => p.isActive).length;
    const totalFeedbacks = db.feedbacks.length;
    const pendingFeedbacks = db.feedbacks.filter(f => f.status === 'Pending').length;
    const avgRating = totalFeedbacks > 0 
      ? Number((db.feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1))
      : 5.0;

    return {
      totalUsers,
      totalProducts,
      activeProducts,
      totalFeedbacks,
      pendingFeedbacks,
      averageRating: avgRating,
      recentUsers: db.users.slice(0, 5),
      recentProducts: db.products.slice(0, 5),
      recentFeedbacks: db.feedbacks.slice(0, 5)
    };
  }
};

// 3. User Management Service
export const adminUserService = {
  getUsers: async (search = '', role = 'All', isActive = null) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (role && role !== 'All') query.append('role', role);
    if (isActive !== null) query.append('isActive', isActive);

    const liveRes = await request(`/users?${query.toString()}`);
    if (liveRes && liveRes.success) return liveRes.data.items;

    // Fallback
    const db = loadStorageData();
    let result = [...db.users];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.fullName.toLowerCase().includes(s) ||
        (u.phoneNumber && u.phoneNumber.includes(s))
      );
    }

    if (role && role !== 'All') {
      result = result.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }

    if (isActive !== null) {
      result = result.filter(u => u.isActive === isActive);
    }

    return result;
  },

  createUser: async (userData) => {
    const liveRes = await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber || '',
      address: userData.address || '',
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
      role: userData.role || 'Customer',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString()
    };
    db.users.unshift(newUser);
    saveStorageData(db);
    return newUser;
  },

  updateUser: async (id, userData) => {
    const liveRes = await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = {
        ...db.users[idx],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      saveStorageData(db);
      return db.users[idx];
    }
    throw new Error('Không tìm thấy người dùng');
  },

  toggleStatus: async (id) => {
    const liveRes = await request(`/users/${id}/toggle-status`, { method: 'PATCH' });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const user = db.users.find(u => u.id === id);
    if (user) {
      if (user.username === 'admin') {
        throw new Error('Không thể khóa tài khoản Quản trị viên tối cao');
      }
      user.isActive = !user.isActive;
      saveStorageData(db);
      return user.isActive;
    }
    throw new Error('Không tìm thấy người dùng');
  },

  deleteUser: async (id) => {
    const liveRes = await request(`/users/${id}`, { method: 'DELETE' });
    if (liveRes && liveRes.success) return true;

    const db = loadStorageData();
    const user = db.users.find(u => u.id === id);
    if (user && user.username === 'admin') {
      throw new Error('Không thể xóa tài khoản Quản trị viên tối cao');
    }
    db.users = db.users.filter(u => u.id !== id);
    saveStorageData(db);
    return true;
  }
};

// 4. Product Management Service
export const adminProductService = {
  getProducts: async (search = '', categoryId = null, isActive = null) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (categoryId) query.append('categoryId', categoryId);
    if (isActive !== null) query.append('isActive', isActive);

    const liveRes = await request(`/products?${query.toString()}`);
    if (liveRes && liveRes.success) return liveRes.data.items;

    const db = loadStorageData();
    let result = [...db.products];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(s) ||
        (p.sku && p.sku.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }

    if (categoryId && Number(categoryId) > 0) {
      result = result.filter(p => p.categoryId === Number(categoryId));
    }

    if (isActive !== null) {
      result = result.filter(p => p.isActive === isActive);
    }

    return result;
  },

  getCategories: async () => {
    const liveRes = await request('/products/categories');
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    return db.categories;
  },

  createProduct: async (productData) => {
    const liveRes = await request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const category = db.categories.find(c => c.id === Number(productData.categoryId));
    const newProduct = {
      id: Date.now(),
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
      sku: productData.sku || `PROD-${Date.now().toString().slice(-4)}`,
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      stockQuantity: Number(productData.stockQuantity || 0),
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
      categoryId: Number(productData.categoryId),
      categoryName: category ? category.name : 'Chưa phân loại',
      isFeatured: !!productData.isFeatured,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdAt: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    saveStorageData(db);
    return newProduct;
  },

  updateProduct: async (id, productData) => {
    const liveRes = await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const category = db.categories.find(c => c.id === Number(productData.categoryId));
      db.products[idx] = {
        ...db.products[idx],
        ...productData,
        price: Number(productData.price),
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
        stockQuantity: Number(productData.stockQuantity),
        categoryName: category ? category.name : db.products[idx].categoryName,
        updatedAt: new Date().toISOString()
      };
      saveStorageData(db);
      return db.products[idx];
    }
    throw new Error('Không tìm thấy sản phẩm');
  },

  deleteProduct: async (id) => {
    const liveRes = await request(`/products/${id}`, { method: 'DELETE' });
    if (liveRes && liveRes.success) return true;

    const db = loadStorageData();
    db.products = db.products.filter(p => p.id !== id);
    saveStorageData(db);
    return true;
  }
};

// 5. Feedback Management Service
export const adminFeedbackService = {
  getFeedbacks: async (search = '', status = 'All', rating = null) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status && status !== 'All') query.append('status', status);
    if (rating) query.append('rating', rating);

    const liveRes = await request(`/feedbacks?${query.toString()}`);
    if (liveRes && liveRes.success) return liveRes.data.items;

    const db = loadStorageData();
    let result = [...db.feedbacks];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(f => 
        f.customerName.toLowerCase().includes(s) ||
        f.customerEmail.toLowerCase().includes(s) ||
        f.subject.toLowerCase().includes(s) ||
        f.content.toLowerCase().includes(s)
      );
    }

    if (status && status !== 'All') {
      result = result.filter(f => f.status.toLowerCase() === status.toLowerCase());
    }

    if (rating && Number(rating) > 0) {
      result = result.filter(f => f.rating === Number(rating));
    }

    return result;
  },

  updateStatus: async (id, status) => {
    const liveRes = await request(`/feedbacks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const feedback = db.feedbacks.find(f => f.id === id);
    if (feedback) {
      feedback.status = status;
      saveStorageData(db);
      return feedback;
    }
    throw new Error('Không tìm thấy phản hồi');
  },

  replyFeedback: async (id, replyMessage) => {
    const liveRes = await request(`/feedbacks/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage })
    });
    if (liveRes && liveRes.success) return liveRes.data;

    const db = loadStorageData();
    const feedback = db.feedbacks.find(f => f.id === id);
    if (feedback) {
      feedback.adminReply = replyMessage;
      feedback.repliedAt = new Date().toISOString();
      feedback.status = 'Approved';
      saveStorageData(db);
      return feedback;
    }
    throw new Error('Không tìm thấy phản hồi');
  },

  deleteFeedback: async (id) => {
    const liveRes = await request(`/feedbacks/${id}`, { method: 'DELETE' });
    if (liveRes && liveRes.success) return true;

    const db = loadStorageData();
    db.feedbacks = db.feedbacks.filter(f => f.id !== id);
    saveStorageData(db);
    return true;
  }
};

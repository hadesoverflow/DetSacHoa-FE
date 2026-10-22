-- ========================================================
-- Script tạo Database & Bảng cho hệ thống Dệt Sắc Hoa
-- Database: SQL Server (DetSacHoaDb)
-- ========================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'DetSacHoaDb')
BEGIN
    CREATE DATABASE [DetSacHoaDb];
END
GO

USE [DetSacHoaDb];
GO

-- 1. BẢNG ROLES (VAI TRÒ)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(255) NULL
    );
END
GO

-- 2. BẢNG USERS (NGƯỜI DÙNG / ADMIN)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(150) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [FullName] NVARCHAR(150) NOT NULL,
        [PhoneNumber] NVARCHAR(20) NULL,
        [Address] NVARCHAR(255) NULL,
        [AvatarUrl] NVARCHAR(500) NULL,
        [Role] NVARCHAR(50) NOT NULL DEFAULT N'Customer',
        [RoleId] INT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NULL,
        [LastLoginAt] DATETIME2 NULL,
        CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE SET NULL
    );
END
GO

-- 3. BẢNG CATEGORIES (DANH MỤC SẢN PHẨM)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(150) NOT NULL,
        [Slug] NVARCHAR(150) NOT NULL UNIQUE,
        [Description] NVARCHAR(500) NULL,
        [ImageUrl] NVARCHAR(500) NULL,
        [DisplayOrder] INT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 4. BẢNG PRODUCTS (SẢN PHẨM)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Products] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [Slug] NVARCHAR(200) NOT NULL,
        [Sku] NVARCHAR(50) NULL,
        [ShortDescription] NVARCHAR(500) NULL,
        [Description] NVARCHAR(MAX) NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [OriginalPrice] DECIMAL(18,2) NULL,
        [StockQuantity] INT NOT NULL DEFAULT 0,
        [ImageUrl] NVARCHAR(500) NULL,
        [SecondaryImages] NVARCHAR(MAX) NULL,
        [CategoryId] INT NOT NULL,
        [IsFeatured] BIT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NULL,
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id]) ON DELETE NO ACTION
    );
END
GO

-- 5. BẢNG FEEDBACKS (PHẢN HỒI KHÁCH HÀNG)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Feedbacks]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Feedbacks] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CustomerName] NVARCHAR(150) NOT NULL,
        [CustomerEmail] NVARCHAR(150) NOT NULL,
        [CustomerPhone] NVARCHAR(20) NULL,
        [Rating] INT NOT NULL DEFAULT 5,
        [Subject] NVARCHAR(250) NOT NULL,
        [Content] NVARCHAR(MAX) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT N'Pending', -- Pending, Approved, Hidden
        [AdminReply] NVARCHAR(MAX) NULL,
        [RepliedAt] DATETIME2 NULL,
        [UserId] INT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Feedbacks_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE SET NULL
    );
END
GO

-- SEED DỮ LIỆU MẪU BAN ĐẦU
-- 1. Roles
IF NOT EXISTS (SELECT * FROM [dbo].[Roles])
BEGIN
    INSERT INTO [dbo].[Roles] ([Name], [Description]) VALUES
    (N'Admin', N'Quản trị viên toàn quyền hệ thống'),
    (N'Staff', N'Nhân viên quản lý sản phẩm và feedback'),
    (N'Customer', N'Khách hàng mua sắm');
END
GO

-- 2. Users (Admin password là: Admin@123)
IF NOT EXISTS (SELECT * FROM [dbo].[Users])
BEGIN
    DECLARE @adminRoleId INT = (SELECT TOP 1 [Id] FROM [dbo].[Roles] WHERE [Name] = N'Admin');
    DECLARE @customerRoleId INT = (SELECT TOP 1 [Id] FROM [dbo].[Roles] WHERE [Name] = N'Customer');

    -- Password hash cho Admin@123 (BCrypt)
    DECLARE @adminHash NVARCHAR(MAX) = N'$2a$11$eN7xNqvTz7ePjVn8Pcfj1.6B4QfQe.lP7Cfq89lVpZkYVj.UqK6C6';

    INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [FullName], [PhoneNumber], [Address], [AvatarUrl], [Role], [RoleId], [IsActive], [CreatedAt]) VALUES
    (N'admin', N'admin@detsachoa.vn', @adminHash, N'Quản Trị Viên Dệt Sắc Hoa', N'0912172192', N'Hà Nội, Việt Nam', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', N'Admin', @adminRoleId, 1, GETUTCDATE()),
    (N'lananh', N'lananh@gmail.com', @adminHash, N'Nguyễn Thị Lan Anh', N'0987654321', N'Ba Đình, Hà Nội', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', N'Customer', @customerRoleId, 1, DATEADD(day, -15, GETUTCDATE())),
    (N'hoangminh', N'hoangminh@gmail.com', @adminHash, N'Trần Hoàng Minh', N'0911223344', N'Quận 1, TP. Hồ Chí Minh', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', N'Customer', @customerRoleId, 1, DATEADD(day, -30, GETUTCDATE())),
    (N'thuydung', N'thuydung@gmail.com', @adminHash, N'Lê Thùy Dung', N'0944556677', N'Hải Châu, Đà Nẵng', N'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', N'Customer', @customerRoleId, 0, DATEADD(day, -45, GETUTCDATE()));
END
GO

-- 3. Categories
IF NOT EXISTS (SELECT * FROM [dbo].[Categories])
BEGIN
    INSERT INTO [dbo].[Categories] ([Name], [Slug], [Description], [ImageUrl], [DisplayOrder], [IsActive]) VALUES
    (N'Lụa Tơ Tằm Thượng Hạng', N'lua-to-tam-thuong-hang', N'Dệt từ sợi tơ tằm Bảo Lộc tự nhiên, mềm mại và sang trọng', N'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400', 1, 1),
    (N'Gấm Hoa Cung Đình', N'gam-hoa-cung-dinh', N'Họa tiết dệt nổi tinh xảo lấy cảm hứng từ mỹ thuật cổ truyền', N'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400', 2, 1),
    (N'Áo Dài Nghệ Thuật', N'ao-dai-nghe-thuat', N'Thiết kế cách tân kết hợp thêu tay thủ công sắc nét', N'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400', 3, 1),
    (N'Khăn Choàng Sắc Hoa', N'khan-choang-sac-hoa', N'Phụ kiện thanh lịch tôn vinh vẻ đẹp quý phái phương Đông', N'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', 4, 1);
END
GO

-- 4. Products
IF NOT EXISTS (SELECT * FROM [dbo].[Products])
BEGIN
    DECLARE @catLua INT = (SELECT TOP 1 [Id] FROM [dbo].[Categories] WHERE [Slug] = N'lua-to-tam-thuong-hang');
    DECLARE @catGam INT = (SELECT TOP 1 [Id] FROM [dbo].[Categories] WHERE [Slug] = N'gam-hoa-cung-dinh');
    DECLARE @catAoDai INT = (SELECT TOP 1 [Id] FROM [dbo].[Categories] WHERE [Slug] = N'ao-dai-nghe-thuat');
    DECLARE @catKhan INT = (SELECT TOP 1 [Id] FROM [dbo].[Categories] WHERE [Slug] = N'khan-choang-sac-hoa');

    INSERT INTO [dbo].[Products] ([Name], [Slug], [Sku], [ShortDescription], [Description], [Price], [OriginalPrice], [StockQuantity], [ImageUrl], [CategoryId], [IsFeatured], [IsActive]) VALUES
    (N'Vải Lụa Sen Vàng Hoàng Cung', N'vai-lua-sen-vang-hoang-cung', N'DSH-LUA-001', N'Lụa tơ tằm dệt ánh vàng kim kết hợp họa tiết đóa sen nở rạng ngời.', N'Sản phẩm được dệt hoàn toàn bằng phương pháp thủ công kết hợp công nghệ nhuộm thực vật tự nhiên.', 1850000, 2200000, 45, N'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800', @catLua, 1, 1),
    (N'Gấm Thêu Phượng Hoàng Mẫu Đơn', N'gam-theu-phuong-hoang-mau-don', N'DSH-GAM-002', N'Chất liệu gấm dệt nổi họa tiết phượng hoàng lộng lẫy và hoa mẫu đơn quý phái.', N'Được may và dệt tỉ mỉ từng chi tiết, tạo độ đứng form tuyệt đối cho các tà áo dạ tiệc, áo dài cao cấp.', 2950000, 3500000, 28, N'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800', @catGam, 1, 1),
    (N'Áo Dài Lụa Hà Đông Sắc Mây Hồng', N'ao-dai-lua-ha-dong-sac-may-hong', N'DSH-AD-003', N'Áo dài truyền thống dệt từ lụa tơ sống Hà Đông thanh khiết.', N'Mang lại nét duyên dáng, bay bổng cho người phụ nữ Việt Nam trong những dịp trọng đại.', 4200000, 4800000, 15, N'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', @catAoDai, 1, 1),
    (N'Khăn Lụa Vuông Hoa Cúc Mùa Thu', N'khan-lua-vuong-hoa-cuc-mua-thu', N'DSH-KHAN-004', N'Khăn choàng lụa satin 90x90cm in họa tiết hoa cúc cổ truyền.', N'Bề mặt mềm mượt óng ả, phụ kiện lý tưởng tôn vinh phong cách thanh lịch.', 850000, 1100000, 60, N'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800', @catKhan, 0, 1),
    (N'Vải Lụa Vân Mây Dạ Nguyệt', N'vai-lua-van-may-da-nguyet', N'DSH-LUA-005', N'Lụa dệt vân mây cổ điển với sắc xanh dạ nguyệt huyền bí.', N'Chất vải rủ nhẹ, tạo cảm giác êm ái mát lạnh ngay khi chạm vào da.', 1600000, 1900000, 0, N'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800', @catLua, 0, 1);
END
GO

-- 5. Feedbacks
IF NOT EXISTS (SELECT * FROM [dbo].[Feedbacks])
BEGIN
    DECLARE @userId INT = (SELECT TOP 1 [Id] FROM [dbo].[Users] WHERE [Username] = N'lananh');

    INSERT INTO [dbo].[Feedbacks] ([CustomerName], [CustomerEmail], [CustomerPhone], [Rating], [Subject], [Content], [Status], [AdminReply], [RepliedAt], [UserId], [CreatedAt]) VALUES
    (N'Nguyễn Thị Lan Anh', N'lananh@gmail.com', N'0987654321', 5, N'Chất lượng lụa quá tuyệt vời!', N'Mình đã đặt may áo dài cưới bằng tấm lụa sen vàng hoàng cung. Vải mềm, mát và óng ánh dưới ánh nắng. Rất hài lòng với sự tư vấn tận tình của Dệt Sắc Hoa.', N'Approved', N'Dệt Sắc Hoa xin chân thành cảm ơn chị Lan Anh! Chúc chị luôn xinh đẹp và rạng ngời hạnh phúc trong ngày trọng đại.', DATEADD(day, -2, GETUTCDATE()), @userId, DATEADD(day, -5, GETUTCDATE())),
    (N'Trần Hoàng Minh', N'hoangminh@gmail.com', N'0911223344', 5, N'Quà tặng mẹ rất ý nghĩa', N'Chiếc khăn choàng hoa cúc được đóng hộp gỗ sơn mài rất tinh tế và sang trọng. Mẹ mình rất thích chất lụa mịn mát này.', N'Approved', N'Cảm ơn bạn Hoàng Minh đã tin tưởng lựa chọn Dệt Sắc Hoa làm món quà trao gửi yêu thương đến Mẹ!', DATEADD(day, -1, GETUTCDATE()), NULL, DATEADD(day, -3, GETUTCDATE())),
    (N'Vũ Đình Trọng', N'trongvu@outlook.com', N'0908776655', 4, N'Giao hàng nhanh, đóng gói cẩn thận', N'Sản phẩm gấm đẹp chuẩn như hình ảnh. Hy vọng cửa hàng sẽ sớm mở thêm chi nhánh tại Đà Nẵng để khách ghé trải nghiệm trực tiếp.', N'Pending', NULL, NULL, NULL, DATEADD(hour, -10, GETUTCDATE())),
    (N'Phạm Thu Hà', N'thuha.pham@gmail.com', N'0933445566', 5, N'Nét đẹp truyền thống thăng hoa', N'Rất trân trọng cách Dệt Sắc Hoa giữ gìn tinh hoa làng nghề kết hợp mỹ thuật hiện đại. Chắc chắn sẽ ủng hộ thương hiệu lâu dài.', N'Pending', NULL, NULL, NULL, DATEADD(hour, -2, GETUTCDATE()));
END
GO

PRINT N'Cơ sở dữ liệu DetSacHoaDb và bảng dữ liệu mẫu đã được tạo thành công!';
GO

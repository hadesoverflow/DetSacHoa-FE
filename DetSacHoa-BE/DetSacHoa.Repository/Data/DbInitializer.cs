using DetSacHoa.Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace DetSacHoa.Repository.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(DetSacHoaDbContext context)
    {
        // Tự động tạo database nếu chưa có
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        if (!await context.Roles.AnyAsync())
        {
            var roles = new List<Role>
            {
                new() { Name = "Admin", Description = "Quản trị viên toàn quyền hệ thống" },
                new() { Name = "Staff", Description = "Nhân viên quản lý sản phẩm và phản hồi" },
                new() { Name = "Customer", Description = "Khách hàng mua sắm" }
            };
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        var customerRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");

        // 2. Seed Admin and Sample Users
        if (!await context.Users.AnyAsync())
        {
            // PasswordHash cho "Admin@123" (BCrypt hash)
            string adminHash = "$2a$11$eN7xNqvTz7ePjVn8Pcfj1.6B4QfQe.lP7Cfq89lVpZkYVj.UqK6C6"; // Admin@123
            string userHash = "$2a$11$eN7xNqvTz7ePjVn8Pcfj1.6B4QfQe.lP7Cfq89lVpZkYVj.UqK6C6";

            var users = new List<User>
            {
                new()
                {
                    Username = "admin",
                    Email = "admin@detsachoa.vn",
                    FullName = "Quản Trị Viên Dệt Sắc Hoa",
                    PasswordHash = adminHash,
                    PhoneNumber = "0912172192",
                    Address = "Hà Nội, Việt Nam",
                    AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    Role = "Admin",
                    RoleId = adminRole?.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Username = "lananh",
                    Email = "lananh@gmail.com",
                    FullName = "Nguyễn Thị Lan Anh",
                    PasswordHash = userHash,
                    PhoneNumber = "0987654321",
                    Address = "Ba Đình, Hà Nội",
                    AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                    Role = "Customer",
                    RoleId = customerRole?.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new()
                {
                    Username = "hoangminh",
                    Email = "hoangminh@gmail.com",
                    FullName = "Trần Hoàng Minh",
                    PasswordHash = userHash,
                    PhoneNumber = "0911223344",
                    Address = "Quận 1, TP. Hồ Chí Minh",
                    AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                    Role = "Customer",
                    RoleId = customerRole?.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new()
                {
                    Username = "thuydung",
                    Email = "thuydung@gmail.com",
                    FullName = "Lê Thùy Dung",
                    PasswordHash = userHash,
                    PhoneNumber = "0944556677",
                    Address = "Hải Châu, Đà Nẵng",
                    AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
                    Role = "Customer",
                    RoleId = customerRole?.Id,
                    IsActive = false, // Demo tài khoản bị khóa
                    CreatedAt = DateTime.UtcNow.AddDays(-45)
                }
            };
            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        // 3. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Name = "Lụa Tơ Tằm Thượng Hạng",
                    Slug = "lua-to-tam-thuong-hang",
                    Description = "Dệt từ sợi tơ tằm Bảo Lộc tự nhiên, mềm mại và sang trọng",
                    ImageUrl = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new()
                {
                    Name = "Gấm Hoa Cung Đình",
                    Slug = "gam-hoa-cung-dinh",
                    Description = "Họa tiết dệt nổi tinh xảo lấy cảm hứng từ mỹ thuật cổ truyền",
                    ImageUrl = "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new()
                {
                    Name = "Áo Dài Nghệ Thuật",
                    Slug = "ao-dai-nghe-thuat",
                    Description = "Thiết kế cách tân kết hợp thêu tay thủ công sắc nét",
                    ImageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400",
                    DisplayOrder = 3,
                    IsActive = true
                },
                new()
                {
                    Name = "Khăn Choàng Sắc Hoa",
                    Slug = "khan-choang-sac-hoa",
                    Description = "Phụ kiện thanh lịch tôn vinh vẻ đẹp quý phái phương Đông",
                    ImageUrl = "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400",
                    DisplayOrder = 4,
                    IsActive = true
                }
            };
            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 4. Seed Products
        if (!await context.Products.AnyAsync())
        {
            var cats = await context.Categories.ToListAsync();
            var catLua = cats.FirstOrDefault(c => c.Slug == "lua-to-tam-thuong-hang") ?? cats[0];
            var catGam = cats.FirstOrDefault(c => c.Slug == "gam-hoa-cung-dinh") ?? cats[1];
            var catAoDai = cats.FirstOrDefault(c => c.Slug == "ao-dai-nghe-thuat") ?? cats[2];
            var catKhan = cats.FirstOrDefault(c => c.Slug == "khan-choang-sac-hoa") ?? cats[3];

            var products = new List<Product>
            {
                new()
                {
                    Name = "Vải Lụa Sen Vàng Hoàng Cung",
                    Slug = "vai-lua-sen-vang-hoang-cung",
                    Sku = "DSH-LUA-001",
                    ShortDescription = "Lụa tơ tằm dệt ánh vàng kim kết hợp họa tiết đóa sen nở rạng ngời.",
                    Description = "Sản phẩm được dệt hoàn toàn bằng phương pháp thủ công kết hợp công nghệ nhuộm thực vật tự nhiên, an toàn cho làn da và bền màu qua thời gian.",
                    Price = 1850000,
                    OriginalPrice = 2200000,
                    StockQuantity = 45,
                    ImageUrl = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800",
                    CategoryId = catLua.Id,
                    IsFeatured = true,
                    IsActive = true
                },
                new()
                {
                    Name = "Gấm Thêu Phượng Hoàng Mẫu Đơn",
                    Slug = "gam-theu-phuong-hoang-mau-don",
                    Sku = "DSH-GAM-002",
                    ShortDescription = "Chất liệu gấm dệt nổi họa tiết phượng hoàng lộng lẫy và hoa mẫu đơn quý phái.",
                    Description = "Được may và dệt tỉ mỉ từng chi tiết, tạo độ đứng form tuyệt đối cho các tà áo dạ tiệc, áo dài cao cấp.",
                    Price = 2950000,
                    OriginalPrice = 3500000,
                    StockQuantity = 28,
                    ImageUrl = "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800",
                    CategoryId = catGam.Id,
                    IsFeatured = true,
                    IsActive = true
                },
                new()
                {
                    Name = "Áo Dài Lụa Hà Đông Sắc Mây Hồng",
                    Slug = "ao-dai-lua-ha-dong-sac-may-hong",
                    Sku = "DSH-AD-003",
                    ShortDescription = "Áo dài truyền thống dệt từ lụa tơ sống Hà Đông thanh khiết.",
                    Description = "Mang lại nét duyên dáng, bay bổng cho người phụ nữ Việt Nam trong những dịp trọng đại.",
                    Price = 4200000,
                    OriginalPrice = 4800000,
                    StockQuantity = 15,
                    ImageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
                    CategoryId = catAoDai.Id,
                    IsFeatured = true,
                    IsActive = true
                },
                new()
                {
                    Name = "Khăn Lụa Vuông Hoa Cúc Mùa Thu",
                    Slug = "khan-lua-vuong-hoa-cuc-mua-thu",
                    Sku = "DSH-KHAN-004",
                    ShortDescription = "Khăn choàng lụa satin 90x90cm in họa tiết hoa cúc cổ truyền.",
                    Description = "Bề mặt mềm mượt óng ả, phụ kiện lý tưởng tôn vinh phong cách thanh lịch.",
                    Price = 850000,
                    OriginalPrice = 1100000,
                    StockQuantity = 60,
                    ImageUrl = "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
                    CategoryId = catKhan.Id,
                    IsFeatured = false,
                    IsActive = true
                },
                new()
                {
                    Name = "Vải Lụa Vân Mây Dạ Nguyệt",
                    Slug = "vai-lua-van-may-da-nguyet",
                    Sku = "DSH-LUA-005",
                    ShortDescription = "Lụa dệt vân mây cổ điển với sắc xanh dạ nguyệt huyền bí.",
                    Description = "Chất vải rủ nhẹ, tạo cảm giác êm ái mát lạnh ngay khi chạm vào da.",
                    Price = 1600000,
                    OriginalPrice = 1900000,
                    StockQuantity = 0, // Hết hàng demo
                    ImageUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
                    CategoryId = catLua.Id,
                    IsFeatured = false,
                    IsActive = true
                }
            };
            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

        // 5. Seed Feedbacks
        if (!await context.Feedbacks.AnyAsync())
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == "lananh");

            var feedbacks = new List<Feedback>
            {
                new()
                {
                    CustomerName = "Nguyễn Thị Lan Anh",
                    CustomerEmail = "lananh@gmail.com",
                    CustomerPhone = "0987654321",
                    Rating = 5,
                    Subject = "Chất lượng lụa quá tuyệt vời!",
                    Content = "Mình đã đặt may áo dài cưới bằng tấm lụa sen vàng hoàng cung. Vải mềm, mát và óng ánh dưới ánh nắng. Rất hài lòng với sự tư vấn tận tình của Dệt Sắc Hoa.",
                    Status = "Approved",
                    AdminReply = "Dệt Sắc Hoa xin chân thành cảm ơn chị Lan Anh! Chúc chị luôn xinh đẹp và rạng ngời hạnh phúc trong ngày trọng đại.",
                    RepliedAt = DateTime.UtcNow.AddDays(-2),
                    UserId = user?.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new()
                {
                    CustomerName = "Trần Hoàng Minh",
                    CustomerEmail = "hoangminh@gmail.com",
                    CustomerPhone = "0911223344",
                    Rating = 5,
                    Subject = "Quà tặng mẹ rất ý nghĩa",
                    Content = "Chiếc khăn choàng hoa cúc được đóng hộp gỗ sơn mài rất tinh tế và sang trọng. Mẹ mình rất thích chất lụa mịn mát này.",
                    Status = "Approved",
                    AdminReply = "Cảm ơn bạn Hoàng Minh đã tin tưởng lựa chọn Dệt Sắc Hoa làm món quà trao gửi yêu thương đến Mẹ!",
                    RepliedAt = DateTime.UtcNow.AddDays(-1),
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new()
                {
                    CustomerName = "Vũ Đình Trọng",
                    CustomerEmail = "trongvu@outlook.com",
                    CustomerPhone = "0908776655",
                    Rating = 4,
                    Subject = "Giao hàng nhanh, đóng gói cẩn thận",
                    Content = "Sản phẩm gấm đẹp chuẩn như hình ảnh. Hy vọng cửa hàng sẽ sớm mở thêm chi nhánh tại Đà Nẵng để khách ghé trải nghiệm trực tiếp.",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow.AddHours(-10)
                },
                new()
                {
                    CustomerName = "Phạm Thu Hà",
                    CustomerEmail = "thuha.pham@gmail.com",
                    CustomerPhone = "0933445566",
                    Rating = 5,
                    Subject = "Nét đẹp truyền thống thăng hoa",
                    Content = "Rất trân trọng cách Dệt Sắc Hoa giữ gìn tinh hoa làng nghề kết hợp mỹ thuật hiện đại. Chắc chắn sẽ ủng hộ thương hiệu lâu dài.",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                }
            };
            await context.Feedbacks.AddRangeAsync(feedbacks);
            await context.SaveChangesAsync();
        }
    }
}

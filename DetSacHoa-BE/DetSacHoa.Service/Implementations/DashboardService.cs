using DetSacHoa.Repository.Interfaces;
using DetSacHoa.Service.DTOs.Auth;
using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Dashboard;
using DetSacHoa.Service.DTOs.Feedbacks;
using DetSacHoa.Service.DTOs.Products;
using DetSacHoa.Service.Interfaces;

namespace DetSacHoa.Service.Implementations;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
    {
        var users = (await _unitOfWork.Users.GetAllAsync()).ToList();
        var products = (await _unitOfWork.Products.GetWithCategoryAsync()).ToList();
        var feedbacks = (await _unitOfWork.Feedbacks.GetAllAsync()).ToList();

        var stats = new DashboardStatsDto
        {
            TotalUsers = users.Count,
            TotalProducts = products.Count,
            ActiveProducts = products.Count(p => p.IsActive),
            TotalFeedbacks = feedbacks.Count,
            PendingFeedbacks = feedbacks.Count(f => f.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase)),
            AverageRating = feedbacks.Any() ? Math.Round(feedbacks.Average(f => f.Rating), 1) : 5.0,

            RecentUsers = users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToList(),

            RecentProducts = products
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    ImageUrl = p.ImageUrl,
                    CategoryName = p.Category?.Name ?? "Chưa phân loại",
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToList(),

            RecentFeedbacks = feedbacks
                .OrderByDescending(f => f.CreatedAt)
                .Take(5)
                .Select(f => new FeedbackDto
                {
                    Id = f.Id,
                    CustomerName = f.CustomerName,
                    CustomerEmail = f.CustomerEmail,
                    Rating = f.Rating,
                    Subject = f.Subject,
                    Content = f.Content,
                    Status = f.Status,
                    AdminReply = f.AdminReply,
                    CreatedAt = f.CreatedAt
                })
                .ToList()
        };

        return ApiResponse<DashboardStatsDto>.Ok(stats);
    }
}

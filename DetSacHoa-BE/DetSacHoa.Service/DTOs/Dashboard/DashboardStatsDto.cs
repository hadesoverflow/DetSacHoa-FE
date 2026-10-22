using DetSacHoa.Service.DTOs.Auth;
using DetSacHoa.Service.DTOs.Feedbacks;
using DetSacHoa.Service.DTOs.Products;

namespace DetSacHoa.Service.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalProducts { get; set; }
    public int TotalFeedbacks { get; set; }
    public int PendingFeedbacks { get; set; }
    public double AverageRating { get; set; }
    public int ActiveProducts { get; set; }
    public IEnumerable<UserDto> RecentUsers { get; set; } = new List<UserDto>();
    public IEnumerable<ProductDto> RecentProducts { get; set; } = new List<ProductDto>();
    public IEnumerable<FeedbackDto> RecentFeedbacks { get; set; } = new List<FeedbackDto>();
}

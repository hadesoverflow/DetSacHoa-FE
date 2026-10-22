using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Dashboard;

namespace DetSacHoa.Service.Interfaces;

public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
}

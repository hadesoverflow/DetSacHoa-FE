using DetSacHoa.Service.DTOs.Auth;
using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Users;

namespace DetSacHoa.Service.Interfaces;

public interface IUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(string? search, string? role, bool? isActive, int page = 1, int pageSize = 10);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto request);
    Task<ApiResponse<bool>> ToggleUserStatusAsync(int id);
    Task<ApiResponse<bool>> DeleteUserAsync(int id);
}

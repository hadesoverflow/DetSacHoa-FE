using DetSacHoa.Service.DTOs.Auth;
using DetSacHoa.Service.DTOs.Common;

namespace DetSacHoa.Service.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<UserDto>> GetProfileAsync(int userId);
    Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordDto request);
}

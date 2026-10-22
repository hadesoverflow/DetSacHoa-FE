using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using DetSacHoa.Service.DTOs.Auth;
using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Users;
using DetSacHoa.Service.Interfaces;

namespace DetSacHoa.Service.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(string? search, string? role, bool? isActive, int page = 1, int pageSize = 10)
    {
        var allUsers = await _unitOfWork.Users.GetAllAsync();
        var query = allUsers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(s) ||
                u.Email.ToLower().Contains(s) ||
                u.FullName.ToLower().Contains(s) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(s))
            );
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "All")
        {
            query = query.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var totalItems = query.Count();
        var items = query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToList();

        var result = new PagedResult<UserDto>(items, totalItems, page, pageSize);
        return ApiResponse<PagedResult<UserDto>>.Ok(result);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy người dùng.");
        }

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        });
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request)
    {
        if (await _unitOfWork.Users.ExistsUsernameAsync(request.Username))
        {
            return ApiResponse<UserDto>.Fail("Tên đăng nhập này đã được sử dụng.");
        }

        if (await _unitOfWork.Users.ExistsEmailAsync(request.Email))
        {
            return ApiResponse<UserDto>.Fail("Địa chỉ email này đã được sử dụng.");
        }

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Address = request.Address?.Trim(),
            AvatarUrl = request.AvatarUrl ?? $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(request.FullName)}",
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Customer" : request.Role,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        };

        return ApiResponse<UserDto>.Ok(userDto, "Tạo tài khoản người dùng thành công!");
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy người dùng.");
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.Address = request.Address?.Trim();
        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        // Safeguard: Do not revoke Admin role or deactivate the primary admin
        if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
        {
            user.Role = "Admin";
            user.IsActive = true;
        }
        else
        {
            user.Role = request.Role;
            user.IsActive = request.IsActive;
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        };

        return ApiResponse<UserDto>.Ok(userDto, "Cập nhật người dùng thành công!");
    }

    public async Task<ApiResponse<bool>> ToggleUserStatusAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy người dùng.");
        }

        if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<bool>.Fail("Không thể khóa tài khoản Quản trị viên tối cao (admin).");
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.Ok(user.IsActive, user.IsActive ? "Đã kích hoạt lại tài khoản người dùng." : "Đã khóa tài khoản người dùng.");
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy người dùng.");
        }

        if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<bool>.Fail("Không thể xóa tài khoản Quản trị viên tối cao.");
        }

        _unitOfWork.Users.Remove(user);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.Ok(true, "Xóa người dùng thành công!");
    }
}

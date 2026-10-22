using System.ComponentModel.DataAnnotations;

namespace DetSacHoa.Service.DTOs.Users;

public class UpdateUserDto
{
    [Required(ErrorMessage = "Họ và tên không được để trống")]
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "Customer";
    public bool IsActive { get; set; } = true;
    public string? NewPassword { get; set; }
}

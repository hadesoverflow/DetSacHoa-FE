using System.ComponentModel.DataAnnotations;

namespace DetSacHoa.Service.DTOs.Feedbacks;

public class CreateFeedbackDto
{
    [Required(ErrorMessage = "Tên khách hàng không được để trống")]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string CustomerEmail { get; set; } = string.Empty;

    public string? CustomerPhone { get; set; }

    [Range(1, 5, ErrorMessage = "Đánh giá từ 1 đến 5 sao")]
    public int Rating { get; set; } = 5;

    [Required(ErrorMessage = "Tiêu đề feedback không được để trống")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nội dung phản hồi không được để trống")]
    public string Content { get; set; } = string.Empty;

    public int? UserId { get; set; }
}

public class UpdateFeedbackStatusDto
{
    [Required(ErrorMessage = "Trạng thái không được để trống")]
    public string Status { get; set; } = "Approved"; // Pending, Approved, Hidden
}

public class ReplyFeedbackDto
{
    [Required(ErrorMessage = "Nội dung trả lời không được để trống")]
    public string ReplyMessage { get; set; } = string.Empty;
}

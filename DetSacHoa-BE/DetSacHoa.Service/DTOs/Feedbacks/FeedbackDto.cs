namespace DetSacHoa.Service.DTOs.Feedbacks;

public class FeedbackDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public int Rating { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Hidden
    public string? AdminReply { get; set; }
    public DateTime? RepliedAt { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

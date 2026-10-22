namespace DetSacHoa.Repository.Entities;

public class Feedback
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public int Rating { get; set; } = 5; // 1 to 5 stars
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Hidden
    public string? AdminReply { get; set; }
    public DateTime? RepliedAt { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User? User { get; set; }
}

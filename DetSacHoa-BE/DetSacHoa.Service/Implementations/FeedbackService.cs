using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Feedbacks;
using DetSacHoa.Service.Interfaces;

namespace DetSacHoa.Service.Implementations;

public class FeedbackService : IFeedbackService
{
    private readonly IUnitOfWork _unitOfWork;

    public FeedbackService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PagedResult<FeedbackDto>>> GetFeedbacksAsync(string? search, string? status, int? rating, int page = 1, int pageSize = 10)
    {
        var feedbacks = await _unitOfWork.Feedbacks.GetAllAsync();
        var query = feedbacks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(f =>
                f.CustomerName.ToLower().Contains(s) ||
                f.CustomerEmail.ToLower().Contains(s) ||
                f.Subject.ToLower().Contains(s) ||
                f.Content.ToLower().Contains(s)
            );
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(f => f.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        if (rating.HasValue && rating.Value > 0)
        {
            query = query.Where(f => f.Rating == rating.Value);
        }

        var totalItems = query.Count();
        var items = query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                CustomerName = f.CustomerName,
                CustomerEmail = f.CustomerEmail,
                CustomerPhone = f.CustomerPhone,
                Rating = f.Rating,
                Subject = f.Subject,
                Content = f.Content,
                Status = f.Status,
                AdminReply = f.AdminReply,
                RepliedAt = f.RepliedAt,
                UserId = f.UserId,
                CreatedAt = f.CreatedAt
            })
            .ToList();

        var result = new PagedResult<FeedbackDto>(items, totalItems, page, pageSize);
        return ApiResponse<PagedResult<FeedbackDto>>.Ok(result);
    }

    public async Task<ApiResponse<FeedbackDto>> GetFeedbackByIdAsync(int id)
    {
        var f = await _unitOfWork.Feedbacks.GetByIdAsync(id);
        if (f == null)
        {
            return ApiResponse<FeedbackDto>.Fail("Không tìm thấy phản hồi này.");
        }

        return ApiResponse<FeedbackDto>.Ok(new FeedbackDto
        {
            Id = f.Id,
            CustomerName = f.CustomerName,
            CustomerEmail = f.CustomerEmail,
            CustomerPhone = f.CustomerPhone,
            Rating = f.Rating,
            Subject = f.Subject,
            Content = f.Content,
            Status = f.Status,
            AdminReply = f.AdminReply,
            RepliedAt = f.RepliedAt,
            UserId = f.UserId,
            CreatedAt = f.CreatedAt
        });
    }

    public async Task<ApiResponse<FeedbackDto>> CreateFeedbackAsync(CreateFeedbackDto request)
    {
        var feedback = new Feedback
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail.Trim().ToLower(),
            CustomerPhone = request.CustomerPhone?.Trim(),
            Rating = Math.Clamp(request.Rating, 1, 5),
            Subject = request.Subject.Trim(),
            Content = request.Content.Trim(),
            Status = "Pending",
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Feedbacks.AddAsync(feedback);
        await _unitOfWork.CompleteAsync();

        return await GetFeedbackByIdAsync(feedback.Id);
    }

    public async Task<ApiResponse<FeedbackDto>> UpdateStatusAsync(int id, string status)
    {
        var feedback = await _unitOfWork.Feedbacks.GetByIdAsync(id);
        if (feedback == null)
        {
            return ApiResponse<FeedbackDto>.Fail("Không tìm thấy phản hồi.");
        }

        var validStatuses = new[] { "Pending", "Approved", "Hidden" };
        var normalized = validStatuses.FirstOrDefault(s => s.Equals(status, StringComparison.OrdinalIgnoreCase));
        if (normalized == null)
        {
            return ApiResponse<FeedbackDto>.Fail("Trạng thái không hợp lệ. Chỉ chấp nhận: Pending, Approved, Hidden.");
        }

        feedback.Status = normalized;
        _unitOfWork.Feedbacks.Update(feedback);
        await _unitOfWork.CompleteAsync();

        return await GetFeedbackByIdAsync(feedback.Id);
    }

    public async Task<ApiResponse<FeedbackDto>> ReplyFeedbackAsync(int id, string reply)
    {
        var feedback = await _unitOfWork.Feedbacks.GetByIdAsync(id);
        if (feedback == null)
        {
            return ApiResponse<FeedbackDto>.Fail("Không tìm thấy phản hồi.");
        }

        feedback.AdminReply = reply.Trim();
        feedback.RepliedAt = DateTime.UtcNow;
        if (feedback.Status == "Pending")
        {
            feedback.Status = "Approved"; // Automatically approve when replying
        }

        _unitOfWork.Feedbacks.Update(feedback);
        await _unitOfWork.CompleteAsync();

        return await GetFeedbackByIdAsync(feedback.Id);
    }

    public async Task<ApiResponse<bool>> DeleteFeedbackAsync(int id)
    {
        var feedback = await _unitOfWork.Feedbacks.GetByIdAsync(id);
        if (feedback == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy phản hồi.");
        }

        _unitOfWork.Feedbacks.Remove(feedback);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.Ok(true, "Xóa phản hồi thành công!");
    }
}

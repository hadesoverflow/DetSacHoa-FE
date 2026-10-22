using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Feedbacks;

namespace DetSacHoa.Service.Interfaces;

public interface IFeedbackService
{
    Task<ApiResponse<PagedResult<FeedbackDto>>> GetFeedbacksAsync(string? search, string? status, int? rating, int page = 1, int pageSize = 10);
    Task<ApiResponse<FeedbackDto>> GetFeedbackByIdAsync(int id);
    Task<ApiResponse<FeedbackDto>> CreateFeedbackAsync(CreateFeedbackDto request);
    Task<ApiResponse<FeedbackDto>> UpdateStatusAsync(int id, string status);
    Task<ApiResponse<FeedbackDto>> ReplyFeedbackAsync(int id, string reply);
    Task<ApiResponse<bool>> DeleteFeedbackAsync(int id);
}

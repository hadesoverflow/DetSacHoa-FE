using DetSacHoa.Service.DTOs.Feedbacks;
using DetSacHoa.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DetSacHoa.API.Controllers;

public class FeedbacksController : BaseApiController
{
    private readonly IFeedbackService _feedbackService;

    public FeedbacksController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetFeedbacks(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? rating,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _feedbackService.GetFeedbacksAsync(search, status, rating, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetFeedbackById(int id)
    {
        var result = await _feedbackService.GetFeedbackByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto request)
    {
        // If authenticated user submits feedback, link UserId automatically
        if (CurrentUserId.HasValue && (!request.UserId.HasValue || request.UserId.Value == 0))
        {
            request.UserId = CurrentUserId.Value;
        }

        var result = await _feedbackService.CreateFeedbackAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetFeedbackById), new { id = result.Data!.Id }, result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateFeedbackStatusDto request)
    {
        var result = await _feedbackService.UpdateStatusAsync(id, request.Status);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id}/reply")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> ReplyFeedback(int id, [FromBody] ReplyFeedbackDto request)
    {
        var result = await _feedbackService.ReplyFeedbackAsync(id, request.ReplyMessage);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        var result = await _feedbackService.DeleteFeedbackAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

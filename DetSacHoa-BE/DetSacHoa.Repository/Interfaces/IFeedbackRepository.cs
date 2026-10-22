using DetSacHoa.Repository.Entities;

namespace DetSacHoa.Repository.Interfaces;

public interface IFeedbackRepository : IGenericRepository<Feedback>
{
    Task<IEnumerable<Feedback>> GetWithUserAsync();
    Task<Feedback?> GetWithUserByIdAsync(int id);
    Task<IEnumerable<Feedback>> GetApprovedAsync();
}

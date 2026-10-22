using DetSacHoa.Repository.Data;
using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DetSacHoa.Repository.Implementations;

public class FeedbackRepository : GenericRepository<Feedback>, IFeedbackRepository
{
    public FeedbackRepository(DetSacHoaDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Feedback>> GetWithUserAsync()
    {
        return await _dbSet
            .Include(f => f.User)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<Feedback?> GetWithUserByIdAsync(int id)
    {
        return await _dbSet
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<Feedback>> GetApprovedAsync()
    {
        return await _dbSet
            .Include(f => f.User)
            .Where(f => f.Status == "Approved")
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }
}

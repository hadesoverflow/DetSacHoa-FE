using DetSacHoa.Repository.Data;
using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DetSacHoa.Repository.Implementations;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(DetSacHoaDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string identifier)
    {
        string normalized = identifier.Trim().ToLower();
        return await _dbSet
            .Include(u => u.RoleNavigation)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == normalized || u.Email.ToLower() == normalized);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        string normalized = username.Trim().ToLower();
        return await _dbSet
            .Include(u => u.RoleNavigation)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == normalized);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        string normalized = email.Trim().ToLower();
        return await _dbSet
            .Include(u => u.RoleNavigation)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
    }

    public async Task<bool> ExistsUsernameAsync(string username, int? excludeUserId = null)
    {
        string normalized = username.Trim().ToLower();
        return await _dbSet.AnyAsync(u => u.Username.ToLower() == normalized && (!excludeUserId.HasValue || u.Id != excludeUserId.Value));
    }

    public async Task<bool> ExistsEmailAsync(string email, int? excludeUserId = null)
    {
        string normalized = email.Trim().ToLower();
        return await _dbSet.AnyAsync(u => u.Email.ToLower() == normalized && (!excludeUserId.HasValue || u.Id != excludeUserId.Value));
    }

    public override async Task<User?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(u => u.RoleNavigation)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}

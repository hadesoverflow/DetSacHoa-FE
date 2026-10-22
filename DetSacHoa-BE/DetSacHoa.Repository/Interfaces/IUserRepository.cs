using DetSacHoa.Repository.Entities;

namespace DetSacHoa.Repository.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameOrEmailAsync(string identifier);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsUsernameAsync(string username, int? excludeUserId = null);
    Task<bool> ExistsEmailAsync(string email, int? excludeUserId = null);
}

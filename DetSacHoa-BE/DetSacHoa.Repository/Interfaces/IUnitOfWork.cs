using DetSacHoa.Repository.Entities;

namespace DetSacHoa.Repository.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IProductRepository Products { get; }
    IFeedbackRepository Feedbacks { get; }
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Role> Roles { get; }

    Task<int> CompleteAsync();
}

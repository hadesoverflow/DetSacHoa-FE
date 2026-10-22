using DetSacHoa.Repository.Data;
using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;

namespace DetSacHoa.Repository.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly DetSacHoaDbContext _context;
    private IUserRepository? _users;
    private IProductRepository? _products;
    private IFeedbackRepository? _feedbacks;
    private IGenericRepository<Category>? _categories;
    private IGenericRepository<Role>? _roles;

    public UnitOfWork(DetSacHoaDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IProductRepository Products => _products ??= new ProductRepository(_context);
    public IFeedbackRepository Feedbacks => _feedbacks ??= new FeedbackRepository(_context);
    public IGenericRepository<Category> Categories => _categories ??= new GenericRepository<Category>(_context);
    public IGenericRepository<Role> Roles => _roles ??= new GenericRepository<Role>(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}

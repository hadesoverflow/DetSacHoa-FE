using DetSacHoa.Repository.Entities;

namespace DetSacHoa.Repository.Interfaces;

public interface IProductRepository : IGenericRepository<Product>
{
    Task<IEnumerable<Product>> GetWithCategoryAsync();
    Task<Product?> GetWithCategoryByIdAsync(int id);
    Task<Product?> GetBySlugAsync(string slug);
    Task<IEnumerable<Product>> GetByCategorySlugAsync(string categorySlug);
    Task<bool> ExistsSlugAsync(string slug, int? excludeId = null);
}

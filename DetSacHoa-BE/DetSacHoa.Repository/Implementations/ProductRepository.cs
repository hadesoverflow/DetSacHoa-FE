using DetSacHoa.Repository.Data;
using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DetSacHoa.Repository.Implementations;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(DetSacHoaDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetWithCategoryAsync()
    {
        return await _dbSet
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Product?> GetWithCategoryByIdAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product?> GetBySlugAsync(string slug)
    {
        return await _dbSet
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());
    }

    public async Task<IEnumerable<Product>> GetByCategorySlugAsync(string categorySlug)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Where(p => p.Category.Slug.ToLower() == categorySlug.ToLower() && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> ExistsSlugAsync(string slug, int? excludeId = null)
    {
        string normalized = slug.Trim().ToLower();
        return await _dbSet.AnyAsync(p => p.Slug.ToLower() == normalized && (!excludeId.HasValue || p.Id != excludeId.Value));
    }
}

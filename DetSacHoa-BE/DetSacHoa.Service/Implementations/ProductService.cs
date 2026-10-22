using System.Text.RegularExpressions;
using DetSacHoa.Repository.Entities;
using DetSacHoa.Repository.Interfaces;
using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Products;
using DetSacHoa.Service.Interfaces;

namespace DetSacHoa.Service.Implementations;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(string? search, int? categoryId, bool? isActive, int page = 1, int pageSize = 10)
    {
        var products = await _unitOfWork.Products.GetWithCategoryAsync();
        var query = products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                (p.Sku != null && p.Sku.ToLower().Contains(s)) ||
                (p.Description != null && p.Description.ToLower().Contains(s))
            );
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        var totalItems = query.Count();
        var items = query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Sku = p.Sku,
                ShortDescription = p.ShortDescription,
                Description = p.Description,
                Price = p.Price,
                OriginalPrice = p.OriginalPrice,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                SecondaryImages = p.SecondaryImages,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "Chưa phân loại",
                IsFeatured = p.IsFeatured,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToList();

        var result = new PagedResult<ProductDto>(items, totalItems, page, pageSize);
        return ApiResponse<PagedResult<ProductDto>>.Ok(result);
    }

    public async Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id)
    {
        var p = await _unitOfWork.Products.GetWithCategoryByIdAsync(id);
        if (p == null)
        {
            return ApiResponse<ProductDto>.Fail("Không tìm thấy sản phẩm.");
        }

        return ApiResponse<ProductDto>.Ok(new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Sku = p.Sku,
            ShortDescription = p.ShortDescription,
            Description = p.Description,
            Price = p.Price,
            OriginalPrice = p.OriginalPrice,
            StockQuantity = p.StockQuantity,
            ImageUrl = p.ImageUrl,
            SecondaryImages = p.SecondaryImages,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? "Chưa phân loại",
            IsFeatured = p.IsFeatured,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });
    }

    public async Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto request)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            return ApiResponse<ProductDto>.Fail("Danh mục được chọn không tồn tại.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? GenerateSlug(request.Name) : request.Slug.Trim();
        if (await _unitOfWork.Products.ExistsSlugAsync(slug))
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
        }

        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Sku = request.Sku?.Trim(),
            ShortDescription = request.ShortDescription?.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl?.Trim(),
            SecondaryImages = request.SecondaryImages?.Trim(),
            CategoryId = request.CategoryId,
            IsFeatured = request.IsFeatured,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.CompleteAsync();

        return await GetProductByIdAsync(product.Id);
    }

    public async Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, UpdateProductDto request)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
        {
            return ApiResponse<ProductDto>.Fail("Không tìm thấy sản phẩm.");
        }

        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            return ApiResponse<ProductDto>.Fail("Danh mục được chọn không tồn tại.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? GenerateSlug(request.Name) : request.Slug.Trim();
        if (await _unitOfWork.Products.ExistsSlugAsync(slug, id))
        {
            slug = $"{slug}-{id}";
        }

        product.Name = request.Name.Trim();
        product.Slug = slug;
        product.Sku = request.Sku?.Trim();
        product.ShortDescription = request.ShortDescription?.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.StockQuantity = request.StockQuantity;
        product.ImageUrl = request.ImageUrl?.Trim();
        product.SecondaryImages = request.SecondaryImages?.Trim();
        product.CategoryId = request.CategoryId;
        product.IsFeatured = request.IsFeatured;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();

        return await GetProductByIdAsync(product.Id);
    }

    public async Task<ApiResponse<bool>> DeleteProductAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy sản phẩm.");
        }

        _unitOfWork.Products.Remove(product);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.Ok(true, "Xóa sản phẩm thành công!");
    }

    public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetCategoriesAsync()
    {
        var categories = await _unitOfWork.Categories.GetAllAsync();
        var products = await _unitOfWork.Products.GetAllAsync();

        var result = categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                ProductCount = products.Count(p => p.CategoryId == c.Id)
            })
            .ToList();

        return ApiResponse<IEnumerable<CategoryDto>>.Ok(result);
    }

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "san-pham";
        var str = text.ToLowerInvariant();
        str = Regex.Replace(str, @"[áàảãạâấầẩẫậăắằẳẵặ]", "a");
        str = Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
        str = Regex.Replace(str, @"[íìỉĩị]", "i");
        str = Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
        str = Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
        str = Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
        str = Regex.Replace(str, @"đ", "d");
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", "-").Trim('-');
        return str;
    }
}

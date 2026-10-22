using DetSacHoa.Service.DTOs.Common;
using DetSacHoa.Service.DTOs.Products;

namespace DetSacHoa.Service.Interfaces;

public interface IProductService
{
    Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(string? search, int? categoryId, bool? isActive, int page = 1, int pageSize = 10);
    Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id);
    Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto request);
    Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, UpdateProductDto request);
    Task<ApiResponse<bool>> DeleteProductAsync(int id);
    Task<ApiResponse<IEnumerable<CategoryDto>>> GetCategoriesAsync();
}

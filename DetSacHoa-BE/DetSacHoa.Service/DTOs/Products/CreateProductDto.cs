using System.ComponentModel.DataAnnotations;

namespace DetSacHoa.Service.DTOs.Products;

public class CreateProductDto
{
    [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
    [MaxLength(200, ErrorMessage = "Tên sản phẩm không quá 200 ký tự")]
    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }
    public string? Sku { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }

    [Required(ErrorMessage = "Giá sản phẩm không được để trống")]
    [Range(0, double.MaxValue, ErrorMessage = "Giá sản phẩm phải lớn hơn hoặc bằng 0")]
    public decimal Price { get; set; }

    public decimal? OriginalPrice { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")]
    public int StockQuantity { get; set; } = 0;

    public string? ImageUrl { get; set; }
    public string? SecondaryImages { get; set; }

    [Required(ErrorMessage = "Danh mục sản phẩm không được để trống")]
    public int CategoryId { get; set; }

    public bool IsFeatured { get; set; } = false;
    public bool IsActive { get; set; } = true;
}

namespace PriceTrackerApi.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string PriceChange { get; set; } = "same"; // "up", "down", or "same"
} 
using System.Timers;
using Microsoft.AspNetCore.SignalR;
using PriceTrackerApi.Hubs;
using PriceTrackerApi.Models;

namespace PriceTrackerApi.Services;

public class PriceUpdateService(
    IHubContext<PriceHub> hubContext,
    ILogger<PriceUpdateService> logger) : IPriceUpdateService, IDisposable
{
    private readonly IHubContext<PriceHub> _hubContext = hubContext;
    private readonly ILogger<PriceUpdateService> _logger = logger;
    private readonly List<Item> _items = InitializeItems();
    private readonly Random _random = new();
    private System.Timers.Timer? _timer;
    private bool _isSubscribed = false;
    private readonly Lock _lock = new();

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Price Update Service is starting.");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Price Update Service is stopping.");
        _timer?.Stop();
        return Task.CompletedTask;
    }

    public void Dispose() => _timer?.Dispose();

    public void Subscribe()
    {
        lock (_lock)
        {
            _logger.LogInformation("Subscribed value is {IsSubscribed}", _isSubscribed);
            if (!_isSubscribed)
            {
                _isSubscribed = true;
                _timer = new System.Timers.Timer(1000);
                _timer.Elapsed += async (sender, e) => await UpdatePrices();
                _timer.AutoReset = true;
                _timer.Enabled = true;
                _logger.LogInformation("Price updates subscribed");
            }
        }
    }

    public void Unsubscribe()
    {
        lock (_lock)
        {
            if (_isSubscribed)
            {
                _isSubscribed = false;
                _timer?.Stop();
                _timer?.Dispose();
                _timer = null;
                _logger.LogInformation("Price updates unsubscribed");
            }
        }
    }

    public IEnumerable<Item> GetItems() => _items;

    private static List<Item> InitializeItems() => [.. Enumerable.Range(1, 10)
            .Select(i => new Item
            {
                Id = i,
                Name = $"Item {i}",
                Price = i * 100,
                UpdatedAt = DateTime.UtcNow,
                PriceChange = "same"
            })];

    private async Task UpdatePrices()
    {
        try
        {
            _logger.LogInformation("Updating prices for {Count} items", _items.Count);
            foreach (var item in _items)
            {
                var oldPrice = item.Price;
                var change = _random.Next(2) == 0 ? 1 : -1;
                var newPrice = item.Price + (change * _random.Next(1, 10));


                if (newPrice > oldPrice)
                    item.PriceChange = "up";
                else if (newPrice < oldPrice)
                    item.PriceChange = "down";
                else
                    item.PriceChange = "same";

                item.Price = newPrice;
                item.UpdatedAt = DateTime.UtcNow;
            }

            await _hubContext.Clients.All.SendAsync("ReceivePriceUpdate", _items);
            _logger.LogInformation("Sent price update for {Count} items", _items.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating prices");
        }
    }
}
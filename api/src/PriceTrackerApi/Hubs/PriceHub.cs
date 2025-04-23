using Microsoft.AspNetCore.SignalR;
using PriceTrackerApi.Models;

namespace PriceTrackerApi.Hubs;

public class PriceHub : Hub
{
    public async Task SendPriceUpdate(List<Item> items)
    {
        await Clients.All.SendAsync("ReceivePriceUpdate", items);
    }
} 
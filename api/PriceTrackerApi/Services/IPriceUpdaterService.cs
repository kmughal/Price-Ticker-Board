using System;
using PriceTrackerApi.Models;

namespace PriceTrackerApi.Services;

public interface IPriceUpdateService: IHostedService
{
    void Subscribe();
    void Unsubscribe();
    IEnumerable<Item> GetItems();
}

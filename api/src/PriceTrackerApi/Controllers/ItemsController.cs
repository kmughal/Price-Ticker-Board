using Microsoft.AspNetCore.Mvc;
using PriceTrackerApi.Models;
using PriceTrackerApi.Services;

namespace PriceTrackerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController(PriceUpdateService priceUpdateService) : ControllerBase
{
    private readonly PriceUpdateService _priceUpdateService = priceUpdateService;

    [HttpGet]
    public ActionResult<IEnumerable<Item>> GetItems() => Ok(_priceUpdateService.GetItems());


    [HttpGet("health")]
    public IActionResult Health() => Ok();


    [HttpPost("subscribe")]
    public IActionResult Subscribe()
    {
        _priceUpdateService.Subscribe();
        return Ok();
    }

    [HttpPost("unsubscribe")]
    public IActionResult Unsubscribe()
    {
        _priceUpdateService.Unsubscribe();
        return Ok();
    }
}
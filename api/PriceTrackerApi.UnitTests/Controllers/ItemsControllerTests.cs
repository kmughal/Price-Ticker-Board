using Microsoft.AspNetCore.Mvc;
using Moq;
using PriceTrackerApi.Controllers;
using PriceTrackerApi.Models;
using PriceTrackerApi.Services;
using System.Collections.Generic;
using Xunit;

namespace PriceTrackerApi.UnitTests.Controllers;

public class ItemsControllerTests
{
    private readonly Mock<IPriceUpdateService> _mockPriceUpdateService;
    private readonly ItemsController _controller;

    public ItemsControllerTests()
    {
        _mockPriceUpdateService = new Mock<IPriceUpdateService>();
        _controller = new ItemsController(_mockPriceUpdateService.Object);
    }

    [Fact]
    public void GetItems_ReturnsOk_WithItemList()
    {
        // Arrange
        var items = new List<Item>
            {
                new() { Id = 1, Name = "Item 1", Price = 100 }
            };
        _mockPriceUpdateService.Setup(s => s.GetItems()).Returns(items);

        // Act
        var result = _controller.GetItems();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedItems = Assert.IsAssignableFrom<IEnumerable<Item>>(okResult.Value);
        Assert.Single(returnedItems);
    }

    [Fact]
    public void Health_ReturnsOk()
    {
        // Act
        var result = _controller.Health();

        // Assert
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void Subscribe_CallsServiceAndReturnsOk()
    {
        // Act
        var result = _controller.Subscribe();

        // Assert
        _mockPriceUpdateService.Verify(s => s.Subscribe(), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void Unsubscribe_CallsServiceAndReturnsOk()
    {
        // Act
        var result = _controller.Unsubscribe();

        // Assert
        _mockPriceUpdateService.Verify(s => s.Unsubscribe(), Times.Once);
        Assert.IsType<OkResult>(result);
    }
}


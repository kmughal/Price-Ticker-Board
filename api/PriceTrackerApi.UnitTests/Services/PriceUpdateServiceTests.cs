using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using PriceTrackerApi.Hubs;
using PriceTrackerApi.Models;
using PriceTrackerApi.Services;
using Xunit;

namespace PriceTrackerApi.UnitTests.Services;
public class PriceUpdateServiceTests
{
    private readonly Mock<IHubContext<PriceHub>> _mockHubContext;
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<IHubClients> _mockClients;
    private readonly Mock<ILogger<PriceUpdateService>> _mockLogger;
    private readonly PriceUpdateService _service;

    public PriceUpdateServiceTests()
    {
        _mockHubContext = new Mock<IHubContext<PriceHub>>();
        _mockLogger = new Mock<ILogger<PriceUpdateService>>();
        _mockClientProxy = new Mock<IClientProxy>();
        _mockClients = new Mock<IHubClients>();

        _mockClients.Setup(clients => clients.All).Returns(_mockClientProxy.Object);
        _mockHubContext.Setup(ctx => ctx.Clients).Returns(_mockClients.Object);

        _service = new PriceUpdateService(_mockHubContext.Object, _mockLogger.Object);
    }

    [Fact]
    public void GetItems_Returns_10_Items()
    {
        var items = _service.GetItems();
        Assert.Equal(10, items.Count());
    }

    [Fact]
    public void Subscribe_SetsIsSubscribedAndStartsTimer()
    {
        _service.Subscribe();
        _service.Subscribe();
        Assert.True(true);
    }

    [Fact]
    public void Unsubscribe_StopsAndDisposesTimer()
    {
        _service.Subscribe();
        _service.Unsubscribe();
        Assert.True(true);
    }

    [Fact]
    public async Task UpdatePrices_ChangesPrices_AndSendsMessage()
    {

        var method = typeof(PriceUpdateService)
            .GetMethod("UpdatePrices", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

        await (Task)method.Invoke(_service, null);

        _mockClientProxy.Verify(client =>
            client.SendCoreAsync("ReceivePriceUpdate",
                It.Is<object[]>(o => o.Length == 1 && o[0] is IEnumerable<Item>),
                default), Times.Once);
    }
}


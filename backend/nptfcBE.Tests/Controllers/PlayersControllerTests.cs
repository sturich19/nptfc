using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Controllers;
using nptfcBE.Models;

namespace nptfcBE.Tests.Controllers;

public class PlayersControllerTests : TestBase
{
    private PlayersController _controller;

    public PlayersControllerTests()
    {
        _controller = new PlayersController(Context);
    }

    [Fact]
    public async Task GetPlayers_Should_Return_Only_Active_Players()
    {
        // Arrange
        Context.Players.Add(new Player { Id = 4, Firstname = "Inactive", Surname = "Player", Position = Position.GK, Active = false });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetPlayers();

        // Assert
        result.Should().NotBeNull();
        var players = result.Value.Should().BeAssignableTo<List<Player>>().Subject;

        players.Should().HaveCount(3); // Only active players from seed data
        players.Should().OnlyContain(p => p.Active);
    }

    [Fact]
    public async Task GetPlayers_Should_Return_Empty_List_When_No_Active_Players()
    {
        // Arrange
        var allPlayers = await Context.Players.ToListAsync();
        foreach (var player in allPlayers)
        {
            player.Active = false;
        }
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetPlayers();

        // Assert
        result.Should().NotBeNull();
        var players = result.Value.Should().BeAssignableTo<List<Player>>().Subject;

        players.Should().BeEmpty();
    }

    [Theory]
    [InlineData(1, "John", "Doe")]
    [InlineData(2, "Jane", "Smith")]
    [InlineData(3, "Bob", "Wilson")]
    public async Task GetPlayer_Should_Return_Correct_Active_Player(int playerId, string expectedFirstname, string expectedSurname)
    {
        // Act
        var result = await _controller.GetPlayer(playerId);

        // Assert
        result.Should().NotBeNull();
        var player = result.Value.Should().BeOfType<Player>().Subject;

        player.Id.Should().Be(playerId);
        player.Firstname.Should().Be(expectedFirstname);
        player.Surname.Should().Be(expectedSurname);
        player.Active.Should().BeTrue();
    }

    [Fact]
    public async Task GetPlayer_Should_Return_NotFound_For_Nonexistent_Player()
    {
        // Act
        var result = await _controller.GetPlayer(999);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task PostPlayer_Should_Create_New_Player()
    {
        // Arrange
        var newPlayer = new Player
        {
            Firstname = "New",
            Surname = "Player",
            Position = Position.Defender,
            Active = true,
            Shirt = 15
        };

        // Act
        var result = await _controller.PostPlayer(newPlayer);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdPlayer = actionResult.Value.Should().BeOfType<Player>().Subject;

        createdPlayer.Firstname.Should().Be("New");
        createdPlayer.Surname.Should().Be("Player");
        createdPlayer.Position.Should().Be(Position.Defender);
        createdPlayer.Active.Should().BeTrue();
        createdPlayer.Id.Should().BeGreaterThan(0);

        // Verify player was saved to database
        var savedPlayer = await Context.Players.FindAsync(createdPlayer.Id);
        savedPlayer.Should().NotBeNull();
        savedPlayer!.Firstname.Should().Be("New");
        savedPlayer.Surname.Should().Be("Player");
    }

    [Theory]
    [InlineData(Position.GK)]
    [InlineData(Position.Defender)]
    [InlineData(Position.Midfielder)]
    [InlineData(Position.Striker)]
    public async Task PostPlayer_Should_Accept_All_Valid_Positions(Position position)
    {
        // Arrange
        var newPlayer = new Player
        {
            Firstname = "Test",
            Surname = "Player",
            Position = position,
            Active = true,
            Shirt = 99
        };

        // Act
        var result = await _controller.PostPlayer(newPlayer);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdPlayer = actionResult.Value.Should().BeOfType<Player>().Subject;

        createdPlayer.Position.Should().Be(position);
    }

    [Fact]
    public async Task PostPlayer_Should_Return_CreatedAtAction_With_Correct_Route_Values()
    {
        // Arrange
        var newPlayer = new Player
        {
            Firstname = "Route",
            Surname = "Test",
            Position = Position.Midfielder,
            Active = true
        };

        // Act
        var result = await _controller.PostPlayer(newPlayer);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;

        actionResult.ActionName.Should().Be(nameof(PlayersController.GetPlayer));
        actionResult.RouteValues.Should().ContainKey("id");
        actionResult.RouteValues!["id"].Should().Be(((Player)actionResult.Value!).Id);
    }

    [Fact]
    public async Task Multiple_Operations_Should_Maintain_Data_Integrity()
    {
        // Arrange
        var initialCount = await Context.Players.CountAsync();

        var newPlayer1 = new Player { Firstname = "Player", Surname = "One", Position = Position.Striker, Active = true };
        var newPlayer2 = new Player { Firstname = "Player", Surname = "Two", Position = Position.Midfielder, Active = true };

        // Act
        var result1 = await _controller.PostPlayer(newPlayer1);
        var result2 = await _controller.PostPlayer(newPlayer2);
        var getAllResult = await _controller.GetPlayers();

        // Assert
        result1.Should().NotBeNull();
        result2.Should().NotBeNull();
        getAllResult.Should().NotBeNull();

        var finalCount = await Context.Players.CountAsync();
        finalCount.Should().Be(initialCount + 2);

        var allPlayers = getAllResult.Value.Should().BeAssignableTo<List<Player>>().Subject;
        allPlayers.Should().HaveCount(initialCount + 2);
    }
}
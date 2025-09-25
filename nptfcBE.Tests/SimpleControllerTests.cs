using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using nptfcBE.Controllers;
using nptfcBE.Models;

namespace nptfcBE.Tests;

public class SimpleControllerTests : TestBase
{
    [Fact]
    public async Task TeamsController_GetTeams_Should_Return_Success()
    {
        // Arrange
        var controller = new TeamsController(Context);

        // Act
        var result = await controller.GetTeams();

        // Assert
        result.Should().NotBeNull();
        var teams = result.Value.Should().BeAssignableTo<IEnumerable<Team>>().Subject;
        teams.Should().NotBeNull();
    }

    [Fact]
    public async Task TeamsController_GetTeam_Should_Return_Team_By_Id()
    {
        // Arrange
        var controller = new TeamsController(Context);

        // Act
        var result = await controller.GetTeam(1);

        // Assert
        result.Should().NotBeNull();
        var team = result.Value.Should().BeOfType<Team>().Subject;
        team.Id.Should().Be(1);
        team.Name.Should().Be("Tigers FC");
    }

    [Fact]
    public async Task TeamsController_PostTeam_Should_Create_New_Team()
    {
        // Arrange
        var controller = new TeamsController(Context);
        var newTeam = new Team
        {
            Name = "Test Team FC",
            IsTigers = false,
            IsLions = false,
            IsPanthers = false
        };

        // Act
        var result = await controller.PostTeam(newTeam);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var actionResult = result.Result.As<CreatedAtActionResult>();
        var createdTeam = actionResult.Value.Should().BeOfType<Team>().Subject;
        createdTeam.Name.Should().Be("Test Team FC");
        createdTeam.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task PlayersController_GetPlayers_Should_Return_Active_Players()
    {
        // Arrange
        var controller = new PlayersController(Context);

        // Act
        var result = await controller.GetPlayers();

        // Assert
        result.Should().NotBeNull();
        var players = result.Value.Should().BeAssignableTo<IEnumerable<Player>>().Subject;
        players.Should().HaveCount(3);
        players.Should().OnlyContain(p => p.Active);
    }

    [Fact]
    public async Task PlayersController_PostPlayer_Should_Create_New_Player()
    {
        // Arrange
        var controller = new PlayersController(Context);
        var newPlayer = new Player
        {
            Firstname = "John",
            Surname = "Test",
            Nickname = "JT",
            Position = Position.Striker,
            Active = true,
            Shirt = 10
        };

        // Act
        var result = await controller.PostPlayer(newPlayer);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var actionResult = result.Result.As<CreatedAtActionResult>();
        var createdPlayer = actionResult.Value.Should().BeOfType<Player>().Subject;
        createdPlayer.Firstname.Should().Be("John");
        createdPlayer.Surname.Should().Be("Test");
        createdPlayer.Position.Should().Be(Position.Striker);
        createdPlayer.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task SeasonsController_GetSeasons_Should_Return_Ordered_Seasons()
    {
        // Arrange
        var controller = new SeasonsController(Context);

        // Act
        var result = await controller.GetSeasons();

        // Assert
        result.Should().NotBeNull();
        var seasons = result.Value.Should().BeAssignableTo<IEnumerable<Season>>().Subject;
        seasons.Should().HaveCount(2);
        seasons.Should().BeInDescendingOrder(s => s.EndYear);
    }

    [Fact]
    public async Task AgeGroupsController_Get_Should_Return_Highest_Age_Group()
    {
        // Arrange
        var controller = new AgeGroupsController(Context);

        // Act
        var result = await controller.Get();

        // Assert
        result.Should().NotBeNull();
        var ageGroup = result.Value.Should().BeOfType<AgeGroup>().Subject;
        ageGroup.Age.Should().Be(20); // Highest age from seed data
    }

    [Fact]
    public async Task AgeGroupsController_GetAgeGroups_Should_Return_All_Age_Groups()
    {
        // Arrange
        var controller = new AgeGroupsController(Context);

        // Act
        var result = await controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<IEnumerable<AgeGroup>>().Subject;
        ageGroups.Should().HaveCount(3);
        ageGroups.Should().BeInDescendingOrder(ag => ag.Age);
    }
}
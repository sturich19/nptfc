using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Controllers;
using nptfcBE.Models;

namespace nptfcBE.Tests.Controllers;

public class TeamsControllerTests : TestBase
{
    private TeamsController _controller;

    public TeamsControllerTests()
    {
        _controller = new TeamsController(Context);
    }

    [Fact]
    public async Task GetTeams_Should_Return_All_Teams_Ordered_By_Name()
    {
        // Arrange
        Context.Teams.Add(new Team { Id = 4, Name = "Ants FC", IsTigers = false, IsLions = false, IsPanthers = false });
        Context.Teams.Add(new Team { Id = 5, Name = "Zebras FC", IsTigers = false, IsLions = false, IsPanthers = false });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetTeams();

        // Assert
        result.Should().NotBeNull();
        var teams = result.Value.Should().BeAssignableTo<List<Team>>().Subject;

        teams.Should().HaveCount(5);
        teams.Should().BeInAscendingOrder(t => t.Name);
        teams[0].Name.Should().Be("Ants FC"); // First alphabetically
        teams[4].Name.Should().Be("Zebras FC"); // Last alphabetically
    }

    [Theory]
    [InlineData(1, "Tigers FC")]
    [InlineData(2, "Lions FC")]
    [InlineData(3, "Eagles FC")]
    public async Task GetTeam_Should_Return_Correct_Team_By_Id(int teamId, string expectedName)
    {
        // Act
        var result = await _controller.GetTeam(teamId);

        // Assert
        result.Should().NotBeNull();
        var team = result.Value.Should().BeOfType<Team>().Subject;

        team.Id.Should().Be(teamId);
        team.Name.Should().Be(expectedName);
    }

    [Fact]
    public async Task GetTeam_Should_Return_NotFound_For_Nonexistent_Team()
    {
        // Act
        var result = await _controller.GetTeam(999);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task PostTeam_Should_Create_New_Team()
    {
        // Arrange
        var newTeam = new Team
        {
            Name = "New Team FC",
            IsTigers = false,
            IsLions = false,
            IsPanthers = true
        };

        // Act
        var result = await _controller.PostTeam(newTeam);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdTeam = actionResult.Value.Should().BeOfType<Team>().Subject;

        createdTeam.Name.Should().Be("New Team FC");
        createdTeam.IsPanthers.Should().BeTrue();
        createdTeam.IsTigers.Should().BeFalse();
        createdTeam.IsLions.Should().BeFalse();
        createdTeam.Id.Should().BeGreaterThan(0);

        // Verify team was saved to database
        var savedTeam = await Context.Teams.FindAsync(createdTeam.Id);
        savedTeam.Should().NotBeNull();
        savedTeam!.Name.Should().Be("New Team FC");
    }

    [Fact]
    public async Task PostTeam_Should_Handle_Tigers_Team()
    {
        // Arrange
        var tigersTeam = new Team
        {
            Name = "Another Tigers Team",
            IsTigers = true,
            IsLions = false,
            IsPanthers = false
        };

        // Act
        var result = await _controller.PostTeam(tigersTeam);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdTeam = actionResult.Value.Should().BeOfType<Team>().Subject;

        createdTeam.IsTigers.Should().BeTrue();
        createdTeam.IsLions.Should().BeFalse();
        createdTeam.IsPanthers.Should().BeFalse();
    }

    [Fact]
    public async Task PutTeam_Should_Update_Existing_Team()
    {
        // Arrange
        var teamId = 1;

        // Detach existing entity to avoid tracking conflicts
        var existingTeam = await Context.Teams.FindAsync(teamId);
        Context.Entry(existingTeam!).State = EntityState.Detached;

        var updatedTeam = new Team
        {
            Id = teamId,
            Name = "Updated Tigers FC",
            IsTigers = true,
            IsLions = false,
            IsPanthers = true // Changed from false
        };

        // Act
        var result = await _controller.PutTeam(teamId, updatedTeam);

        // Assert
        result.Should().BeOfType<NoContentResult>();

        // Verify team was updated in database
        var savedTeam = await Context.Teams.FindAsync(teamId);
        savedTeam.Should().NotBeNull();
        savedTeam!.Name.Should().Be("Updated Tigers FC");
        savedTeam.IsPanthers.Should().BeTrue();
    }

    [Fact]
    public async Task PutTeam_Should_Return_BadRequest_When_Id_Mismatch()
    {
        // Arrange
        var urlId = 1;
        var team = new Team
        {
            Id = 2, // Different from URL ID
            Name = "Updated Team",
            IsTigers = false,
            IsLions = true,
            IsPanthers = false
        };

        // Act
        var result = await _controller.PutTeam(urlId, team);

        // Assert
        result.Should().BeOfType<BadRequestResult>();

        // Verify original team was not changed
        var originalTeam = await Context.Teams.FindAsync(1);
        originalTeam.Should().NotBeNull();
        originalTeam!.Name.Should().Be("Tigers FC"); // Original name
    }

    [Fact]
    public async Task DeleteTeam_Should_Remove_Existing_Team()
    {
        // Arrange
        var teamId = 1;
        var initialCount = await Context.Teams.CountAsync();

        // Act
        var result = await _controller.DeleteTeam(teamId);

        // Assert
        result.Should().BeOfType<NoContentResult>();

        // Verify team was deleted from database
        var deletedTeam = await Context.Teams.FindAsync(teamId);
        deletedTeam.Should().BeNull();

        var finalCount = await Context.Teams.CountAsync();
        finalCount.Should().Be(initialCount - 1);
    }

    [Fact]
    public async Task DeleteTeam_Should_Return_NotFound_For_Nonexistent_Team()
    {
        // Arrange
        var teamId = 999;
        var initialCount = await Context.Teams.CountAsync();

        // Act
        var result = await _controller.DeleteTeam(teamId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();

        // Verify no teams were deleted
        var finalCount = await Context.Teams.CountAsync();
        finalCount.Should().Be(initialCount);
    }

    [Theory]
    [InlineData(true, false, false, "Tigers")]
    [InlineData(false, true, false, "Lions")]
    [InlineData(false, false, true, "Panthers")]
    [InlineData(false, false, false, "Generic")]
    public async Task Team_Should_Handle_Different_Type_Combinations(bool isTigers, bool isLions, bool isPanthers, string namePrefix)
    {
        // Arrange
        var newTeam = new Team
        {
            Name = $"{namePrefix} Test Team",
            IsTigers = isTigers,
            IsLions = isLions,
            IsPanthers = isPanthers
        };

        // Act
        var result = await _controller.PostTeam(newTeam);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdTeam = actionResult.Value.Should().BeOfType<Team>().Subject;

        createdTeam.IsTigers.Should().Be(isTigers);
        createdTeam.IsLions.Should().Be(isLions);
        createdTeam.IsPanthers.Should().Be(isPanthers);
        createdTeam.Name.Should().Be($"{namePrefix} Test Team");
    }

    [Fact]
    public async Task Full_CRUD_Workflow_Should_Work_Correctly()
    {
        // Arrange
        var initialCount = await Context.Teams.CountAsync();

        // Create
        var newTeam = new Team
        {
            Name = "CRUD Test Team",
            IsTigers = false,
            IsLions = false,
            IsPanthers = true
        };

        // Act - Create
        var createResult = await _controller.PostTeam(newTeam);
        var createdTeam = ((CreatedAtActionResult)createResult.Result!).Value as Team;

        // Act - Read
        var readResult = await _controller.GetTeam(createdTeam!.Id);

        // Act - Update
        createdTeam.Name = "CRUD Updated Team";
        createdTeam.IsTigers = true;
        var updateResult = await _controller.PutTeam(createdTeam.Id, createdTeam);

        // Act - Delete
        var deleteResult = await _controller.DeleteTeam(createdTeam.Id);

        // Assert
        createResult.Should().NotBeNull();
        readResult.Should().NotBeNull();
        updateResult.Should().BeOfType<NoContentResult>();
        deleteResult.Should().BeOfType<NoContentResult>();

        var finalCount = await Context.Teams.CountAsync();
        finalCount.Should().Be(initialCount); // Same as initial after create and delete
    }
}
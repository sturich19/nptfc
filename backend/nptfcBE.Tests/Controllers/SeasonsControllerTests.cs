using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Controllers;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Tests.Controllers;

public class SeasonsControllerTests : TestBase
{
    private SeasonsController _controller;

    public SeasonsControllerTests()
    {
        _controller = new SeasonsController(Context);
    }

    [Fact]
    public async Task GetSeasons_Should_Return_Seasons_Ordered_By_EndYear_Descending()
    {
        // Arrange
        Context.Seasons.Add(new Season
        {
            Id = 3,
            StartYear = 2022,
            EndYear = 2023,
            AgeGroupId = 1,
            MonthStart = "9",
            MonthEnd = "5",
            Division = 2,
            Active = true
        });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetSeasons();

        // Assert
        result.Should().NotBeNull();
        var seasons = result.Value.Should().BeAssignableTo<List<Season>>().Subject;

        seasons.Should().HaveCount(3);
        seasons.Should().BeInDescendingOrder(s => s.EndYear);
        seasons[0].EndYear.Should().Be(2025); // Latest season first
        seasons[2].EndYear.Should().Be(2023); // Earliest season last
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    public async Task GetSeason_Should_Return_Correct_Season_By_Id(int seasonId)
    {
        // Act
        var result = await _controller.GetSeason(seasonId);

        // Assert
        result.Should().NotBeNull();
        var season = result.Value.Should().BeOfType<Season>().Subject;

        season.Id.Should().Be(seasonId);
    }

    [Fact]
    public async Task GetSeason_Should_Return_NotFound_For_Nonexistent_Season()
    {
        // Act
        var result = await _controller.GetSeason(999);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetSeasonsForAgeGroup_Should_Return_Seasons_For_Specific_AgeGroup()
    {
        // Arrange
        Context.Seasons.Add(new Season
        {
            Id = 3,
            StartYear = 2023,
            EndYear = 2024,
            AgeGroupId = 2, // Different age group
            MonthStart = "9",
            MonthEnd = "5",
            Division = 1,
            Active = true
        });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetSeasonsForAgeGroup(1);

        // Assert
        result.Should().NotBeNull();
        var seasons = result.Value.Should().BeAssignableTo<List<Season>>().Subject;

        seasons.Should().HaveCount(2); // Only seasons for age group 1
        seasons.Should().OnlyContain(s => s.AgeGroupId == 1);
    }

    [Fact]
    public async Task PostSeason_Should_Create_New_Season()
    {
        // Arrange
        var newSeason = new Season
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 2,
            MonthStart = "8",
            MonthEnd = "6",
            Division = 2,
            Active = true
        };

        // Act
        var result = await _controller.PostSeason(newSeason);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.StartYear.Should().Be(2025);
        createdSeason.EndYear.Should().Be(2026);
        createdSeason.AgeGroupId.Should().Be(2);
        createdSeason.Division.Should().Be(2);
        createdSeason.MonthStart.Should().Be("8");
        createdSeason.MonthEnd.Should().Be("6");
        createdSeason.Id.Should().BeGreaterThan(0);

        // Verify season was saved to database
        var savedSeason = await Context.Seasons.FindAsync(createdSeason.Id);
        savedSeason.Should().NotBeNull();
        savedSeason!.Division.Should().Be(2);
    }

    [Fact]
    public async Task PostSeasonSetup_Should_Create_New_Season_With_Teams()
    {
        // Arrange
        var seasonSetup = new SeasonSetupDTO
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 1,
            MonthStart = "9",
            MonthEnd = "5",
            Division = 1,
            Active = true,
            TeamIds = [1, 2] // Valid team IDs from seed data
        };

        // Act
        var result = await _controller.PostSeasonSetup(seasonSetup);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.StartYear.Should().Be(2025);
        createdSeason.EndYear.Should().Be(2026);
        createdSeason.Division.Should().Be(1);
    }

    [Fact]
    public async Task PostSeasonSetup_Should_Return_BadRequest_When_No_Teams_Selected()
    {
        // Arrange
        var seasonSetup = new SeasonSetupDTO
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 1,
            MonthStart = "9",
            MonthEnd = "5",
            Division = 1,
            Active = true,
            TeamIds = [] // No teams selected
        };

        // Act
        var result = await _controller.PostSeasonSetup(seasonSetup);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().Be("At least one team must be selected for the season");
    }

    [Theory]
    [InlineData("9", "5")] // September to May
    [InlineData("8", "6")] // August to June
    [InlineData("1", "12")] // January to December
    public async Task Season_Should_Accept_Valid_Month_Strings(string monthStart, string monthEnd)
    {
        // Arrange
        var newSeason = new Season
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 1,
            MonthStart = monthStart,
            MonthEnd = monthEnd,
            Division = 1,
            Active = true
        };

        // Act
        var result = await _controller.PostSeason(newSeason);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.MonthStart.Should().Be(monthStart);
        createdSeason.MonthEnd.Should().Be(monthEnd);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public async Task Season_Should_Accept_Different_Division_Numbers(int division)
    {
        // Arrange
        var newSeason = new Season
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 1,
            MonthStart = "9",
            MonthEnd = "5",
            Division = division,
            Active = true
        };

        // Act
        var result = await _controller.PostSeason(newSeason);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.Division.Should().Be(division);
    }

    [Fact]
    public async Task Season_Should_Handle_Cross_Year_Seasons()
    {
        // Arrange - Season that crosses year boundary (Sept to May)
        var newSeason = new Season
        {
            StartYear = 2024,
            EndYear = 2025,
            AgeGroupId = 1,
            MonthStart = "9", // September
            MonthEnd = "5", // May (next year)
            Division = 1,
            Active = true
        };

        // Act
        var result = await _controller.PostSeason(newSeason);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.MonthStart.Should().Be("9");
        createdSeason.MonthEnd.Should().Be("5");
        createdSeason.StartYear.Should().Be(2024);
        createdSeason.EndYear.Should().Be(2025);

        // Business logic: Cross-year seasons are valid
        int.Parse(createdSeason.MonthStart).Should().BeGreaterThan(int.Parse(createdSeason.MonthEnd));
        createdSeason.EndYear.Should().BeGreaterThan(createdSeason.StartYear);
    }

    [Fact]
    public async Task Season_Active_Status_Should_Be_Manageable()
    {
        // Arrange - Create inactive season
        var inactiveSeason = new Season
        {
            StartYear = 2025,
            EndYear = 2026,
            AgeGroupId = 1,
            MonthStart = "9",
            MonthEnd = "5",
            Division = 1,
            Active = false // Inactive
        };

        // Act
        var result = await _controller.PostSeason(inactiveSeason);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var createdSeason = actionResult.Value.Should().BeOfType<Season>().Subject;

        createdSeason.Active.Should().BeFalse();

        // Verify it's saved as inactive
        var savedSeason = await Context.Seasons.FindAsync(createdSeason.Id);
        savedSeason.Should().NotBeNull();
        savedSeason!.Active.Should().BeFalse();
    }
}
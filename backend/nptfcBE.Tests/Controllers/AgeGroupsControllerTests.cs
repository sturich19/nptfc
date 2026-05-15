using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Controllers;
using nptfcBE.Models;

namespace nptfcBE.Tests.Controllers;

public class AgeGroupsControllerTests : TestBase
{
    private AgeGroupsController _controller;

    public AgeGroupsControllerTests()
    {
        _controller = new AgeGroupsController(Context);
    }

    [Fact]
    public async Task Get_Should_Return_AgeGroup_With_Highest_Age()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        result.Should().NotBeNull();
        var ageGroup = result.Value.Should().BeOfType<AgeGroup>().Subject;

        ageGroup.Age.Should().Be(20); // Highest age from seed data
        ageGroup.Id.Should().Be(3);
        ageGroup.StartYear.Should().Be(2005);
        ageGroup.EndYear.Should().Be(2006);
    }

    [Fact]
    public async Task Get_Should_Return_First_AgeGroup_When_Multiple_Have_Same_Highest_Age()
    {
        // Arrange
        Context.AgeGroups.Add(new AgeGroup
        {
            Id = 4,
            StartYear = 2004,
            EndYear = 2005,
            Age = 20 // Same as existing highest
        });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.Get();

        // Assert
        result.Should().NotBeNull();
        var ageGroup = result.Value.Should().BeOfType<AgeGroup>().Subject;

        ageGroup.Age.Should().Be(20);
        // Should return first one in the result set (depending on database ordering)
        ageGroup.Id.Should().BeOneOf(3, 4);
    }

    [Fact]
    public async Task Get_Should_Throw_Exception_When_No_AgeGroups_Exist()
    {
        // Arrange
        var allAgeGroups = await Context.AgeGroups.ToListAsync();
        Context.AgeGroups.RemoveRange(allAgeGroups);
        await Context.SaveChangesAsync();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await _controller.Get();
        });
    }

    [Fact]
    public async Task GetAgeGroups_Should_Return_All_AgeGroups_Ordered_By_Age_Descending()
    {
        // Arrange
        Context.AgeGroups.Add(new AgeGroup
        {
            Id = 4,
            StartYear = 2008,
            EndYear = 2009,
            Age = 15
        });
        Context.AgeGroups.Add(new AgeGroup
        {
            Id = 5,
            StartYear = 2004,
            EndYear = 2005,
            Age = 21
        });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        ageGroups.Should().HaveCount(5);
        ageGroups.Should().BeInDescendingOrder(ag => ag.Age);
        ageGroups[0].Age.Should().Be(21); // Highest age first
        ageGroups[4].Age.Should().Be(15); // Lowest age last
    }

    [Fact]
    public async Task GetAgeGroups_Should_Return_Empty_List_When_No_AgeGroups_Exist()
    {
        // Arrange
        var allAgeGroups = await Context.AgeGroups.ToListAsync();
        Context.AgeGroups.RemoveRange(allAgeGroups);
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        ageGroups.Should().BeEmpty();
    }

    [Theory]
    [InlineData(2020, 2021, 4)]
    [InlineData(2019, 2020, 5)]
    [InlineData(2018, 2019, 6)]
    public async Task AgeGroup_Should_Accept_Various_Year_Ranges(int startYear, int endYear, int age)
    {
        // Arrange
        var newAgeGroup = new AgeGroup
        {
            StartYear = startYear,
            EndYear = endYear,
            Age = age
        };
        Context.AgeGroups.Add(newAgeGroup);
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        ageGroups.Should().Contain(ag =>
            ag.StartYear == startYear &&
            ag.EndYear == endYear &&
            ag.Age == age);
    }

    [Fact]
    public async Task AgeGroups_Should_Handle_Same_Age_Groups_With_Different_Years()
    {
        // Arrange
        Context.AgeGroups.Add(new AgeGroup
        {
            Id = 4,
            StartYear = 2020,
            EndYear = 2021,
            Age = 18
        });
        Context.AgeGroups.Add(new AgeGroup
        {
            Id = 5,
            StartYear = 2021,
            EndYear = 2022,
            Age = 18
        });
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        var age18Groups = ageGroups.Where(ag => ag.Age == 18).ToList();
        age18Groups.Should().HaveCount(3); // Original + 2 new
        age18Groups.Should().Contain(ag => ag.StartYear == 2006 && ag.EndYear == 2007);
        age18Groups.Should().Contain(ag => ag.StartYear == 2020 && ag.EndYear == 2021);
        age18Groups.Should().Contain(ag => ag.StartYear == 2021 && ag.EndYear == 2022);
    }

    [Fact]
    public async Task Get_And_GetAgeGroups_Should_Be_Consistent()
    {
        // Act
        var getResult = await _controller.Get();
        var getAllResult = await _controller.GetAgeGroups();

        // Assert
        getResult.Should().NotBeNull();
        getAllResult.Should().NotBeNull();

        var singleAgeGroup = getResult.Value;
        var allAgeGroups = getAllResult.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        singleAgeGroup.Should().NotBeNull();
        allAgeGroups.Should().NotBeNull();

        // The single age group should be the first one in the ordered list (highest age)
        singleAgeGroup!.Id.Should().Be(allAgeGroups![0].Id);
        singleAgeGroup.Age.Should().Be(allAgeGroups[0].Age);
        singleAgeGroup.Age.Should().Be(allAgeGroups.Max(ag => ag.Age));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(100)]
    public async Task AgeGroup_Should_Accept_Edge_Case_Ages(int age)
    {
        // Arrange
        var newAgeGroup = new AgeGroup
        {
            StartYear = 2023,
            EndYear = 2024,
            Age = age
        };
        Context.AgeGroups.Add(newAgeGroup);
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        ageGroups.Should().Contain(ag => ag.Age == age);
    }

    [Fact]
    public async Task AgeGroup_Should_Handle_Year_Range_Edge_Cases()
    {
        // Arrange
        var edgeCases = new[]
        {
            new AgeGroup { StartYear = 1900, EndYear = 1901, Age = 25 },
            new AgeGroup { StartYear = 2099, EndYear = 2100, Age = 10 },
            new AgeGroup { StartYear = 2023, EndYear = 2023, Age = 1 } // Same year
        };

        Context.AgeGroups.AddRange(edgeCases);
        await Context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAgeGroups();

        // Assert
        result.Should().NotBeNull();
        var ageGroups = result.Value.Should().BeAssignableTo<List<AgeGroup>>().Subject;

        // All edge cases should be present
        ageGroups.Should().Contain(ag => ag.StartYear == 1900 && ag.EndYear == 1901);
        ageGroups.Should().Contain(ag => ag.StartYear == 2099 && ag.EndYear == 2100);
        ageGroups.Should().Contain(ag => ag.StartYear == 2023 && ag.EndYear == 2023);
    }
}
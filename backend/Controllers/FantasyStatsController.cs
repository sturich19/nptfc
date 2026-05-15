using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

public class IdsRequest
{
    public List<int> Ids { get; set; }
}

[ApiController]
[Route("api/FantasyFootball")]
public class FantasyStatsController : ControllerBase
{
    private readonly DatabaseContext _context;

    public FantasyStatsController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    // <summary>
    // Gets the fantasy stats for the current season.
    // </summary>
    // <param name="seasonId"></param>
    // <returns></returns>
    [HttpGet("season/{seasonId}", Name = "GetFantasyStats")]
    public async Task<IOrderedEnumerable<FantasyStatDTO>> GetFantasyStats(int seasonId)
    {
        // load all the stats for the season passed in - group by the player
        var gameStatsPerPlayer = await _context.GameStats
                    .Join(_context.Players,
                        gs => gs.PlayerId,
                        p => p.Id,
                        (gs, p) => new { gs, p })
                    .Where(g => g.gs.SeasonId == seasonId && g.p.Active)
                    .GroupBy(x => x.gs.PlayerId)
                    .Select(gameStatGroup => new GameStatDTO
                    {
                        Id = gameStatGroup.Key,
                        Goals = gameStatGroup.Sum(x => x.gs.Goals),
                        GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                        GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                        GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                        Apps = gameStatGroup.Count(),
                        Assists = gameStatGroup.Sum(x => x.gs.Assists),
                        GSO = gameStatGroup.Sum(x => x.gs.GSO),
                        Shots = gameStatGroup.Sum(x => x.gs.Shots),
                        PlayerId = gameStatGroup.First().p.Id,
                        SeasonId = gameStatGroup.First().gs.SeasonId,
                        PlayerName = gameStatGroup.First().p.Nickname,
                        CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                        Saves = gameStatGroup.Sum(x => x.gs.Saves),
                        PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                    })
                    .ToListAsync();

        List<FantasyStatDTO> fantasyStats = new List<FantasyStatDTO>();
        foreach (GameStatDTO gameStat in gameStatsPerPlayer)
        {
            Player player = _context.Players.Find(gameStat.PlayerId);
            if (player == null || !player.Active)
                continue;

            fantasyStats.Add(FantasyStatDTO.Create(player, gameStat));
        }

        return fantasyStats.OrderByDescending(f => f.TotalPoints);
    }

    /// <summary>
    /// Gets the fantasy stats by age group.
    /// </summary>
    /// <param name="ageGroup"></param>
    /// <returns></returns>
    [HttpGet("ageGroup/{ageGroupID}", Name = "GetFantasyStatsByAgeGroup")]
    public async Task<IOrderedEnumerable<FantasyStatDTO>> GetFantasyStatsByAgeGroup(int ageGroupId)
    {
        var seasonIds = _context.Seasons
            .Where(s => s.AgeGroupId == ageGroupId)
            .Select(s => s.Id);

        // load all the stats for the season passed in - group by the player
        var gameStatsPerPlayer = await _context.GameStats
                    .Join(_context.Players,
                        gs => gs.PlayerId,
                        p => p.Id,
                        (gs, p) => new { gs, p })
                    .Where(g => seasonIds.Contains(g.gs.SeasonId) && g.p.Active)
                    .GroupBy(x => x.gs.PlayerId)
                    .Select(gameStatGroup => new GameStatDTO
                    {
                        Id = gameStatGroup.Key,
                        Goals = gameStatGroup.Sum(x => x.gs.Goals),
                        GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                        GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                        GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                        Apps = gameStatGroup.Count(),
                        Assists = gameStatGroup.Sum(x => x.gs.Assists),
                        GSO = gameStatGroup.Sum(x => x.gs.GSO),
                        Shots = gameStatGroup.Sum(x => x.gs.Shots),
                        PlayerId = gameStatGroup.First().p.Id,
                        SeasonId = gameStatGroup.First().gs.SeasonId,
                        PlayerName = gameStatGroup.First().p.Nickname,
                        CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                        Saves = gameStatGroup.Sum(x => x.gs.Saves),
                        PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                    })
                    .ToListAsync();

        List<FantasyStatDTO> fantasyStats = new List<FantasyStatDTO>();
        foreach (GameStatDTO gameStat in gameStatsPerPlayer)
        {
            Player player = _context.Players.Find(gameStat.PlayerId);
            if (player == null || !player.Active)
                continue;

            fantasyStats.Add(FantasyStatDTO.Create(player, gameStat));
        }

        return fantasyStats.OrderByDescending(f => f.TotalPoints);
    }

    [HttpGet("fixture/{fixtureId}", Name = "GetFantasyStatsForFixture")]
    public async Task<IOrderedEnumerable<FantasyStatDTO>> GetFantasyStatsForFixture(int fixtureId)
    {
        var gameStatsPerPlayer = await _context.GameStats
                    .Join(_context.Players,
                        gs => gs.PlayerId,
                        p => p.Id,
                        (gs, p) => new { gs, p })
                    .Where(g => g.gs.FixtureId == fixtureId && g.p.Active)
                    .GroupBy(x => x.gs.PlayerId)
                    .Select(gameStatGroup => new GameStatDTO
                    {
                        Id = gameStatGroup.Key,
                        Goals = gameStatGroup.Sum(x => x.gs.Goals),
                        GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                        GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                        GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                        Apps = gameStatGroup.Count(),
                        Assists = gameStatGroup.Sum(x => x.gs.Assists),
                        GSO = gameStatGroup.Sum(x => x.gs.GSO),
                        Shots = gameStatGroup.Sum(x => x.gs.Shots),
                        PlayerId = gameStatGroup.First().p.Id,
                        SeasonId = gameStatGroup.First().gs.SeasonId,
                        PlayerName = gameStatGroup.First().p.Nickname,
                        CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                        Saves = gameStatGroup.Sum(x => x.gs.Saves),
                        PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                    })
                    .ToListAsync();

        List<FantasyStatDTO> fantasyStats = new List<FantasyStatDTO>();
        foreach (GameStatDTO gameStat in gameStatsPerPlayer)
        {
            Player player = _context.Players.Find(gameStat.PlayerId);
            if (player == null || !player.Active)
                continue;

            fantasyStats.Add(FantasyStatDTO.Create(player, gameStat));
        }

        return fantasyStats.OrderByDescending(f => f.TotalPoints);
    }
}
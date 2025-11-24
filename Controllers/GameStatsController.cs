using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/GameStats")]
public class GameStatsController : ControllerBase
{
    private readonly DatabaseContext _context;

    public GameStatsController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    [HttpGet("{id}", Name = "GetGameStat")]
    public async Task<ActionResult<GameStatDTO>> GetGameStat(int id)
    {
        var gameStat = await _context.GameStats
                       .Where(f => f.Id == id)
                       .Include(f => f.Season)
                       .Include(f => f.Player)
                       .Include(f => f.Fixture)
                       .Where(f => f.Player.Active)
                       .FirstOrDefaultAsync();

        if (gameStat == null)
        {
            return NotFound();
        }

        return new GameStatDTO
        {
            Id = gameStat.Id,
            Apps = gameStat.Played ? 1 : 0,
            Goals = gameStat.Goals,
            GoalsLeft = gameStat.GoalsLeft,
            GoalsRight = gameStat.GoalsRight,
            GoalsOther = gameStat.GoalsOther,
            Assists = gameStat.Assists,
            GSO = gameStat.GSO,
            Shots = gameStat.Shots,
            PlayerId = gameStat.PlayerId,
            SeasonId = gameStat.SeasonId,
            FixtureId = gameStat.FixtureId,
            PlayerName = gameStat.Player.Nickname,
            ShotsOnTarget = gameStat.ShotsOnTarget,
            ShotsOffTarget = gameStat.ShotsOffTarget,
            Saves = gameStat.Saves,
            CleanSheets = gameStat.CleanSheets,
            PenSaves = gameStat.PenSaves,
            ShotsLeft = gameStat.ShotsLeft,
            ShotsRight = gameStat.ShotsRight,
            Played = gameStat.Played
        };
    }

    [HttpGet(Name = "GetGameStats")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStats()
    {
        return await _context.GameStats
                  .Join(_context.Players,
                      gs => gs.PlayerId,
                      p => p.Id,
                      (gs, p) => new { gs, p })
                  .Where(x => x.p.Active)
                  .GroupBy(x => x.gs.PlayerId)
                  .Select(gameStatGroup => new GameStatDTO
                  {
                      Id = gameStatGroup.Key,
                      Goals = gameStatGroup.Sum(x => x.gs.Goals),
                      GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                      GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                      GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                      Apps = gameStatGroup.Count(x => x.gs.Played),
                      Assists = gameStatGroup.Sum(x => x.gs.Assists),
                      GSO = gameStatGroup.Sum(x => x.gs.GSO),
                      Shots = gameStatGroup.Sum(x => x.gs.Shots),
                      PlayerId = gameStatGroup.First().p.Id,
                      SeasonId = gameStatGroup.First().gs.SeasonId,
                      PlayerName = gameStatGroup.First().p.Nickname,
                      ShotsOnTarget = gameStatGroup.Sum(x => x.gs.ShotsOnTarget),
                      ShotsOffTarget = gameStatGroup.Sum(x => x.gs.ShotsOffTarget),
                      Saves = gameStatGroup.Sum(x => x.gs.Saves),
                      CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                      PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                      ShotsLeft = gameStatGroup.Sum(x => x.gs.ShotsLeft),
                      ShotsRight = gameStatGroup.Sum(x => x.gs.ShotsRight)
                  })
                  .ToListAsync();

    }

    [HttpGet("player/{playerId}", Name = "GetGameStatsForPlayer")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForPlayer(int playerId)
    {
        return await _context.GameStats
                  .Include(gs => gs.Player)
                  .Where(gs => gs.Player.Active)
                  .Select(gameStat => new GameStatDTO
                  {
                      Id = gameStat.Id,
                      Apps = gameStat.Played ? 1 : 0,
                      Goals = gameStat.Goals,
                      GoalsLeft = gameStat.GoalsLeft,
                      GoalsRight = gameStat.GoalsRight,
                      GoalsOther = gameStat.GoalsOther,
                      Assists = gameStat.Assists,
                      GSO = gameStat.GSO,
                      Shots = gameStat.Shots,
                      PlayerId = gameStat.PlayerId,
                      SeasonId = gameStat.SeasonId,
                      FixtureId = gameStat.FixtureId,
                      PlayerName = gameStat.Player.Nickname,
                      ShotsOnTarget = gameStat.ShotsOnTarget,
                      ShotsOffTarget = gameStat.ShotsOffTarget,
                      Saves = gameStat.Saves,
                      CleanSheets = gameStat.CleanSheets,
                      PenSaves = gameStat.PenSaves,
                      ShotsLeft = gameStat.ShotsLeft,
                      ShotsRight = gameStat.ShotsRight,
                      Played = gameStat.Played
                  })
                  .Where(g => g.PlayerId == playerId)
                  .ToListAsync();
    }

    [HttpGet("season/{seasonId}", Name = "GetGameStatsForSeason")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForSeason(int seasonId)
    {
        // This is joining game stat with the players based on the season passed. Then summing up the data points for each "player"
        return await _context.GameStats
                .Where(g => g.SeasonId == seasonId)
                .Join(_context.Players,
                    gs => gs.PlayerId,
                    p => p.Id,
                    (gs, p) => new { gs, p })
                .Where(x => x.p.Active)
                .GroupBy(x => x.gs.PlayerId)
                .Select(gameStatGroup => new GameStatDTO
                {
                    Id = gameStatGroup.Key,
                    Apps = gameStatGroup.Count(x => x.gs.Played),
                    Goals = gameStatGroup.Sum(x => x.gs.Goals),
                    GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                    GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                    GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                    Assists = gameStatGroup.Sum(x => x.gs.Assists),
                    GSO = gameStatGroup.Sum(x => x.gs.GSO),
                    Shots = gameStatGroup.Sum(x => x.gs.Shots),
                    PlayerId = gameStatGroup.First().p.Id,
                    SeasonId = gameStatGroup.First().gs.SeasonId,
                    PlayerName = gameStatGroup.First().p.Nickname,
                    ShotsOnTarget = gameStatGroup.Sum(x => x.gs.ShotsOnTarget),
                    ShotsOffTarget = gameStatGroup.Sum(x => x.gs.ShotsOffTarget),
                    Saves = gameStatGroup.Sum(x => x.gs.Saves),
                    CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                    PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                    ShotsLeft = gameStatGroup.Sum(x => x.gs.ShotsLeft),
                    ShotsRight = gameStatGroup.Sum(x => x.gs.ShotsRight),
                })
                .ToListAsync();
    }

    [HttpGet("fixture/{fixtureId}", Name = "GetGameStatsForFixture")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForFixture(int fixtureId)
    {
        return await _context.GameStats
                  .Include(gs => gs.Player)
                  .Where(gs => gs.Player.Active)
                  .Select(gameStat => new GameStatDTO
                  {
                      Id = gameStat.Id,
                      Apps = gameStat.Played ? 1 : 0,
                      Goals = gameStat.Goals,
                      GoalsLeft = gameStat.GoalsLeft,
                      GoalsRight = gameStat.GoalsRight,
                      GoalsOther = gameStat.GoalsOther,
                      Assists = gameStat.Assists,
                      GSO = gameStat.GSO,
                      Shots = gameStat.Shots,
                      PlayerId = gameStat.PlayerId,
                      SeasonId = gameStat.SeasonId,
                      FixtureId = gameStat.FixtureId,
                      PlayerName = gameStat.Player.Nickname,
                      ShotsOnTarget = gameStat.ShotsOnTarget,
                      ShotsOffTarget = gameStat.ShotsOffTarget,
                      Saves = gameStat.Saves,
                      CleanSheets = gameStat.CleanSheets,
                      PenSaves = gameStat.PenSaves,
                      ShotsLeft = gameStat.ShotsLeft,
                      ShotsRight = gameStat.ShotsRight,
                      Played = gameStat.Played
                  })
                  .Where(g => g.FixtureId == fixtureId)
                  .ToListAsync();
    }

    [HttpGet("{playerId}, {seasonId}", Name = "GetGameStatsForPlayerPerSeason")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForPlayerPerSeason(int playerId, int seasonId)
    {
        return await _context.GameStats
                  .Include(gs => gs.Player)
                  .Where(gs => gs.Player.Active)
                  .Select(gameStat => new GameStatDTO
                  {
                      Id = gameStat.Id,
                      Apps = gameStat.Played ? 1 : 0,
                      Goals = gameStat.Goals,
                      GoalsLeft = gameStat.GoalsLeft,
                      GoalsRight = gameStat.GoalsRight,
                      GoalsOther = gameStat.GoalsOther,
                      Assists = gameStat.Assists,
                      GSO = gameStat.GSO,
                      Shots = gameStat.Shots,
                      PlayerId = gameStat.PlayerId,
                      SeasonId = gameStat.SeasonId,
                      FixtureId = gameStat.FixtureId,
                      PlayerName = gameStat.Player.Nickname,
                      ShotsOnTarget = gameStat.ShotsOnTarget,
                      ShotsOffTarget = gameStat.ShotsOffTarget,
                      Saves = gameStat.Saves,
                      CleanSheets = gameStat.CleanSheets,
                      PenSaves = gameStat.PenSaves,
                      ShotsLeft = gameStat.ShotsLeft,
                      ShotsRight = gameStat.ShotsRight,
                      Played = gameStat.Played
                  })
                  .Where(g => playerId == g.PlayerId)
                  .Where(g => g.SeasonId == seasonId)
                  .ToListAsync();
    }

    [HttpGet("ageGroup/{ageGroupId}", Name = "GetGameStatsForAgeGroup")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForAgeGroup(int ageGroupId)
    {

        List<int> seasonsForAgeGroup = await _context.Seasons.Where(s => s.AgeGroupId == ageGroupId).Select(season => season.Id).ToListAsync();

        // This is joining game stat with the players based on the season passed. Then summing up the data points for each "player"
        return await _context.GameStats
                .Where(gameStat => seasonsForAgeGroup.Contains(gameStat.SeasonId))
                .Join(_context.Players,
                    gs => gs.PlayerId,
                    p => p.Id,
                    (gs, p) => new { gs, p })
                .Where(x => x.p.Active)
                .GroupBy(x => x.gs.PlayerId)
                .Select(gameStatGroup => new GameStatDTO
                {
                    Id = gameStatGroup.Key,
                    Apps = gameStatGroup.Count(x => x.gs.Played),
                    Goals = gameStatGroup.Sum(x => x.gs.Goals),
                    GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                    GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                    GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                    Assists = gameStatGroup.Sum(x => x.gs.Assists),
                    GSO = gameStatGroup.Sum(x => x.gs.GSO),
                    Shots = gameStatGroup.Sum(x => x.gs.Shots),
                    PlayerId = gameStatGroup.First().p.Id,
                    SeasonId = gameStatGroup.First().gs.SeasonId,
                    PlayerName = gameStatGroup.First().p.Nickname,
                    ShotsOnTarget = gameStatGroup.Sum(x => x.gs.ShotsOnTarget),
                    ShotsOffTarget = gameStatGroup.Sum(x => x.gs.ShotsOffTarget),
                    Saves = gameStatGroup.Sum(x => x.gs.Saves),
                    CleanSheets = gameStatGroup.Sum(x => x.gs.CleanSheets),
                    PenSaves = gameStatGroup.Sum(x => x.gs.PenSaves),
                    ShotsLeft = gameStatGroup.Sum(x => x.gs.ShotsLeft),
                    ShotsRight = gameStatGroup.Sum(x => x.gs.ShotsRight)
                })
                .ToListAsync();
    }


    // POST: api/GameStat
    [HttpPost]
    public async Task<ActionResult<GameStat>> PostGameStat(GameStatDTO gameStatDTO)
    {
        var fixture = await _context.TigersFixtures
           .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.FixtureId);

        var player = await _context.Players
            .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.PlayerId);

        var season = await _context.Seasons
            .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.SeasonId);

        if (fixture == null || player == null || season == null)
            return BadRequest();

        GameStat gameStatToAdd = GameStat.Create(gameStatDTO, fixture, player, season);
        EntityEntry<GameStat> addedGameStat = _context.GameStats.Add(gameStatToAdd);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(PostGameStat), new { id = addedGameStat.Entity.Id }, gameStatDTO);
    }

    // POST: api/GameStat/bulk
    [HttpPost("bulk")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> PostGameStatsBulk(List<GameStatDTO> gameStatDTOs)
    {
        if (gameStatDTOs == null || !gameStatDTOs.Any())
            return BadRequest("No game stats provided");

        var processedGameStats = new List<GameStatDTO>();
        var errors = new List<string>();

        foreach (var gameStatDTO in gameStatDTOs)
        {
            var fixture = await _context.TigersFixtures
                .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.FixtureId);

            var player = await _context.Players
                .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.PlayerId);

            var season = await _context.Seasons
                .FirstOrDefaultAsync(lt => lt.Id == gameStatDTO.SeasonId);

            if (fixture == null || player == null || season == null)
            {
                errors.Add($"Invalid data for game stat: PlayerId={gameStatDTO.PlayerId}, FixtureId={gameStatDTO.FixtureId}, SeasonId={gameStatDTO.SeasonId}");
                continue;
            }

            // Check if a game stat already exists for this player/fixture/season combination
            var existingGameStat = await _context.GameStats
                .FirstOrDefaultAsync(gs =>
                    gs.PlayerId == gameStatDTO.PlayerId &&
                    gs.FixtureId == gameStatDTO.FixtureId &&
                    gs.SeasonId == gameStatDTO.SeasonId);

            if (existingGameStat != null)
            {
                // Update existing record
                existingGameStat.Goals = gameStatDTO.Goals;
                existingGameStat.GoalsLeft = gameStatDTO.GoalsLeft;
                existingGameStat.GoalsRight = gameStatDTO.GoalsRight;
                existingGameStat.GoalsOther = gameStatDTO.GoalsOther;
                existingGameStat.Assists = gameStatDTO.Assists;
                existingGameStat.GSO = gameStatDTO.GSO;
                existingGameStat.Shots = gameStatDTO.Shots;
                existingGameStat.ShotsOnTarget = gameStatDTO.ShotsOnTarget;
                existingGameStat.ShotsOffTarget = gameStatDTO.ShotsOffTarget;
                existingGameStat.ShotsLeft = gameStatDTO.ShotsLeft;
                existingGameStat.ShotsRight = gameStatDTO.ShotsRight;
                existingGameStat.CleanSheets = gameStatDTO.CleanSheets;
                existingGameStat.Saves = gameStatDTO.Saves;
                existingGameStat.PenSaves = gameStatDTO.PenSaves;
                existingGameStat.Played = gameStatDTO.Played;

                _context.GameStats.Update(existingGameStat);
            }
            else
            {
                // Add new record
                GameStat gameStatToAdd = GameStat.Create(gameStatDTO, fixture, player, season);
                _context.GameStats.Add(gameStatToAdd);
            }

            processedGameStats.Add(gameStatDTO);
        }

        if (processedGameStats.Any())
        {
            await _context.SaveChangesAsync();
        }

        if (errors.Any() && !processedGameStats.Any())
        {
            return BadRequest(new { errors });
        }

        if (errors.Any())
        {
            return Ok(new { processedGameStats, errors });
        }

        return Ok(processedGameStats);
    }
}
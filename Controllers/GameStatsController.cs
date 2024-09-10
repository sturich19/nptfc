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
                        .Where(f=> f.Id == id)
                        .Include(f => f.Season)
                        .Include(f => f.Player)
                        .Include(f => f.Fixture)
                        .FirstOrDefaultAsync();

        if (gameStat == null)
        {
            return NotFound();
        }

        return new GameStatDTO
        {
            Id = gameStat.Id,
            Apps = 1,
            Goals = gameStat.Goals,
            GoalsLeft = gameStat.GoalsLeft,
            GoalsRight = gameStat.GoalsRight,
            GoalsOther = gameStat.GoalsOther,
            Assists = gameStat.Assists,
            GSO = gameStat.GSO,
            Shots = gameStat.Shots,            
            PlayerId =  gameStat.PlayerId,
            SeasonId = gameStat.SeasonId,
            FixtureId = gameStat.FixtureId,
            PlayerName = gameStat.Player.Nickname,
            ShotsOnTarget = gameStat.ShotsOnTarget,
            ShotsOffTarget = gameStat.ShotsOffTarget,
            Saves = gameStat.Saves,
            CleanSheets = gameStat.CleanSheets,
            PenSaves = gameStat.PenSaves,
            ShotsLeft = gameStat.ShotsLeft,
            ShotsRight = gameStat.ShotsRight
        };                   
    }       

    [HttpGet(Name = "GetGameStats")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStats()
    {
          return await _context.GameStats                    
                    .Join(_context.Players,
                        gs => gs.PlayerId, 
                        p => p.Id,
                        (gs, p) => new {gs, p})
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
                        PlayerId =  gameStatGroup.First().p.Id,
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
                    .Select(gameStat => new GameStatDTO
                    {
                        Id = gameStat.Id,
                        Apps = 1,
                        Goals = gameStat.Goals,
                        GoalsLeft = gameStat.GoalsLeft,
                        GoalsRight = gameStat.GoalsRight,
                        GoalsOther = gameStat.GoalsOther,
                        Assists = gameStat.Assists,
                        GSO = gameStat.GSO,
                        Shots = gameStat.Shots,                        
                        PlayerId =  gameStat.PlayerId,
                        SeasonId = gameStat.SeasonId,
                        FixtureId = gameStat.FixtureId,
                        PlayerName = gameStat.Player.Nickname,
                        ShotsOnTarget = gameStat.ShotsOnTarget,
                        ShotsOffTarget = gameStat.ShotsOffTarget,
                        Saves = gameStat.Saves,
                        CleanSheets = gameStat.CleanSheets,
                        PenSaves = gameStat.PenSaves   ,
                        ShotsLeft = gameStat.ShotsLeft,
                        ShotsRight = gameStat.ShotsRight                     
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
                        (gs, p) => new {gs, p})
                    .GroupBy(x => x.gs.PlayerId)                    
                    .Select(gameStatGroup => new GameStatDTO
                    {
                        Id = gameStatGroup.Key,
                        Apps = gameStatGroup.Count(),
                        Goals = gameStatGroup.Sum(x => x.gs.Goals),
                        GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                        GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                        GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                        Assists = gameStatGroup.Sum(x => x.gs.Assists),
                        GSO = gameStatGroup.Sum(x => x.gs.GSO),
                        Shots = gameStatGroup.Sum(x => x.gs.Shots),                        
                        PlayerId =  gameStatGroup.First().p.Id,
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
                    .Select(gameStat => new GameStatDTO
                    {
                        Id = gameStat.Id,
                        Apps = 1,
                        Goals = gameStat.Goals,
                        GoalsLeft = gameStat.GoalsLeft,
                        GoalsRight = gameStat.GoalsRight,
                        GoalsOther = gameStat.GoalsOther,
                        Assists = gameStat.Assists,
                        GSO = gameStat.GSO,
                        Shots = gameStat.Shots,                        
                        PlayerId =  gameStat.PlayerId,
                        SeasonId = gameStat.SeasonId,
                        FixtureId = gameStat.FixtureId,
                        PlayerName = gameStat.Player.Nickname,
                        ShotsOnTarget = gameStat.ShotsOnTarget,
                        ShotsOffTarget = gameStat.ShotsOffTarget,
                        Saves = gameStat.Saves,
                        CleanSheets = gameStat.CleanSheets,
                        PenSaves = gameStat.PenSaves,
                        ShotsLeft = gameStat.ShotsLeft,
                        ShotsRight = gameStat.ShotsRight
                    })        
                    .Where(g => g.FixtureId == fixtureId)                                                                
                    .ToListAsync();                   
    }   

    [HttpGet("{playerId}, {seasonId}", Name = "GetGameStatsForPlayerPerSeason")]
    public async Task<ActionResult<IEnumerable<GameStatDTO>>> GetGameStatsForPlayerPerSeason(int playerId, int seasonId)
    {
          return await _context.GameStats
                    .Select(gameStat => new GameStatDTO
                    {
                        Id = gameStat.Id,
                        Apps = 1,
                        Goals = gameStat.Goals,
                        GoalsLeft = gameStat.GoalsLeft,
                        GoalsRight = gameStat.GoalsRight,
                        GoalsOther = gameStat.GoalsOther,
                        Assists = gameStat.Assists,
                        GSO = gameStat.GSO,
                        Shots = gameStat.Shots,                        
                        PlayerId =  gameStat.PlayerId,
                        SeasonId = gameStat.SeasonId,
                        FixtureId = gameStat.FixtureId,
                        PlayerName = gameStat.Player.Nickname,
                        ShotsOnTarget = gameStat.ShotsOnTarget,
                        ShotsOffTarget = gameStat.ShotsOffTarget,
                        Saves = gameStat.Saves,
                        CleanSheets = gameStat.CleanSheets,
                        PenSaves = gameStat.PenSaves,
                        ShotsLeft = gameStat.ShotsLeft,
                        ShotsRight = gameStat.ShotsRight
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
                        (gs, p) => new {gs, p})
                    .GroupBy(x => x.gs.PlayerId)                    
                    .Select(gameStatGroup => new GameStatDTO
                    {
                        Id = gameStatGroup.Key,
                        Apps = gameStatGroup.Count(),
                        Goals = gameStatGroup.Sum(x => x.gs.Goals),
                        GoalsLeft = gameStatGroup.Sum(x => x.gs.GoalsLeft),
                        GoalsRight = gameStatGroup.Sum(x => x.gs.GoalsRight),
                        GoalsOther = gameStatGroup.Sum(x => x.gs.GoalsOther),
                        Assists = gameStatGroup.Sum(x => x.gs.Assists),
                        GSO = gameStatGroup.Sum(x => x.gs.GSO),
                        Shots = gameStatGroup.Sum(x => x.gs.Shots),                        
                        PlayerId =  gameStatGroup.First().p.Id,
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
}
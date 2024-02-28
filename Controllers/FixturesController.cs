using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/Fixtures")]
public class FixturesController : ControllerBase
{
    private readonly DatabaseContext _context;
    private LeagueController _leagueController;

    public FixturesController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
        _leagueController = new LeagueController(databaseContext);
    }    

    [HttpGet(Name = "GetFixtures")]
    public async Task<ActionResult<IEnumerable<FixtureDTO>>> GetFixtures()
    {
        return await _context.Fixtures
                    .Select(fixture => new FixtureDTO
                    {
                        Id = fixture.Id,
                        Date = fixture.Date,
                        AwayTeam = fixture.AwayTeam.Name,
                        AwayTeamId = fixture.AwayTeam.Id,
                        AwayTeamScore = fixture.AwayTeamScore,
                        HomeTeam = fixture.HomeTeam.Name,
                        HomeTeamId = fixture.HomeTeam.Id,
                        HomeTeamScore = fixture.HomeTeamScore,
                        SeasonId = fixture.SeasonId,
                        KnownScore = fixture.KnownScore         
                    })
                    .OrderBy(f  => f.Date)                    
                    .ToListAsync();

            
    }

     [HttpGet("{id}")]
    public async Task<ActionResult<FixtureDTO>> GetFixture(int id)
    {
             var fixture = await _context.Fixtures
                        .Where(f=> f.Id == id)
                        .Include(f => f.AwayTeam)
                        .Include(f => f.HomeTeam)                        
                        .Include(f => f.Season) 
                        .FirstOrDefaultAsync();

            if (fixture == null)
            {
                return NotFound();
            }

            return FixtureDTO.Create(fixture);                    
    }

    [HttpGet("grid/{seasonId}", Name = "GetFixtureGrid")]
    public async Task<ActionResult<IEnumerable<FixtureGridDTO>>> GetFixtureGrid(int seasonId)
    {
        List<FixtureGridDTO> grid = new List<FixtureGridDTO>();

        // Get the teams from the league.
        List<LeagueDTO> leagueTeams = await _context.League
                    .Select(leagueTeam => new LeagueDTO
                    {
                        Id = leagueTeam.Id,
                        Pld = leagueTeam.Won + leagueTeam.Drawn + leagueTeam.Lost,
                        TeamName = leagueTeam.Team.Name,
                        TeamId = leagueTeam.TeamId,
                        SeasonId = leagueTeam.SeasonId,
                        Won = leagueTeam.Won,                
                        Lost = leagueTeam.Lost,                
                        Drawn = leagueTeam.Drawn,                
                        Points = leagueTeam.Won * 3 + leagueTeam.Drawn,
                        GlsFor = leagueTeam.GlsFor,
                        GlsA = leagueTeam.GlsA,    
                        GD = leagueTeam.GlsFor - leagueTeam.GlsA,
                        AchieveablePoints = 33 - (leagueTeam.Lost * 3) - (leagueTeam.Drawn * 2)
                    })
                    .Where(l => l.SeasonId == seasonId)
                    .OrderBy(l => l.TeamName)
                    .ToListAsync();

        
        // Get me all the fixtures. For each fixture - add a new team and row element into the grid.
        List<FixtureDTO> fixtures =  _context.Fixtures
                        .Select(fixture => new FixtureDTO
                        {
                            Id = fixture.Id,
                            Date = fixture.Date,
                            AwayTeam = fixture.AwayTeam.Name,
                            AwayTeamId = fixture.AwayTeam.Id,
                            AwayTeamScore = fixture.AwayTeamScore,
                            HomeTeam = fixture.HomeTeam.Name,
                            HomeTeamId = fixture.HomeTeam.Id,
                            HomeTeamScore = fixture.HomeTeamScore,
                            KnownScore = fixture.KnownScore,
                            SeasonId = fixture.SeasonId                      
                        })
                        .OrderBy(f  => f.HomeTeam)                                        
                        .Where(f => f.SeasonId == seasonId).ToList();

        foreach (LeagueDTO leagueTeam in leagueTeams)
        {
            FixtureGridDTO fixtureItem = new FixtureGridDTO()
            {
                Id = leagueTeam.Id,
                HomeTeamName = leagueTeam.TeamName,
                SeasonId = seasonId,
                Items = new List<FixtureGridItemDTO>()
                
            };

            List<FixtureDTO> homeTeamFixtures = fixtures.Where(f => f.HomeTeamId == leagueTeam.TeamId).ToList();
            
            // Go through all the teams again - add a 
            foreach (var opposition in leagueTeams)
            {
                if (leagueTeam.Id == opposition.Id)
                {
                    // If we are playing ourself then ignore.
                    fixtureItem.Items.Add(new FixtureGridItemDTO(){ AwayTeamName = opposition.TeamName, NoGame = true});
                    continue;
                }
                
                // See if the oposition appear as an away team.
                FixtureDTO? fixture = homeTeamFixtures.Where(f => f.AwayTeamId == opposition.TeamId).FirstOrDefault();
                if (fixture == null)
                {
                    // We dont play this team at home.
                    fixtureItem.Items.Add(new FixtureGridItemDTO(){ AwayTeamName = opposition.TeamName, NoGame = true});
                    continue;
                }                
                
                fixtureItem.Items.Add(new FixtureGridItemDTO()
                {
                    Id = fixture.Id,
                    AwayTeamId = fixture.AwayTeamId,
                    AwayTeamName = fixture.AwayTeam,
                    AwayTeamScore = fixture.AwayTeamScore,
                    Date = fixture.Date,
                    HomeTeamScore = fixture.HomeTeamScore ,                    
                    HomeTeamId = fixture.HomeTeamId ,
                    HomeTeamName = fixture.HomeTeam,
                    KnownScore = fixture.KnownScore
                });
            } 

            grid.Add(fixtureItem);
        }

        return grid;      
    }
     
    [HttpGet("season/{seasonId}", Name = "GetFixturesBySeasonId")]
    public async Task<ActionResult<IEnumerable<FixtureDTO>>> GetFixturesBySeasonId(int seasonId)
    {
        return await _context.Fixtures
                    .Select(fixture => new FixtureDTO
                    {
                        Id = fixture.Id,
                        Date = fixture.Date,
                        AwayTeam = fixture.AwayTeam.Name,
                        AwayTeamId = fixture.AwayTeam.Id,
                        AwayTeamScore = fixture.AwayTeamScore,
                        HomeTeam = fixture.HomeTeam.Name,
                        HomeTeamId = fixture.HomeTeam.Id,
                        HomeTeamScore = fixture.HomeTeamScore,
                        KnownScore = fixture.KnownScore,
                        SeasonId = fixture.SeasonId  
                    })
                    .OrderBy(f  => f.Date)
                    .Where(f=> seasonId == f.SeasonId)                    
                    .ToListAsync();
    }    

    [HttpGet("results/{seasonId},{teamId}", Name = "GetResultsForTeam")]
    public async Task<ActionResult<IEnumerable<FixtureDTO>>> GetResultsForTeam(int seasonId, int teamId)
    {
        return await _context.Fixtures
                    .Select(fixture => new FixtureDTO
                    {
                        Id = fixture.Id,
                        Date = fixture.Date,
                        AwayTeam = fixture.AwayTeam.Name,
                        AwayTeamId = fixture.AwayTeam.Id,
                        AwayTeamScore = fixture.AwayTeamScore,
                        HomeTeam = fixture.HomeTeam.Name,
                        HomeTeamId = fixture.HomeTeam.Id,
                        HomeTeamScore = fixture.HomeTeamScore,
                        KnownScore = fixture.KnownScore,
                        SeasonId = fixture.SeasonId  
                    })
                    .OrderBy(f  => f.Date)
                    .Where(f=> seasonId == f.SeasonId)  
                    .Where(f=> teamId == f.HomeTeamId || teamId == f.AwayTeamId)                  
                    .ToListAsync();
    }    

    // POST: api/Fixtures
    [HttpPost]
    public async Task<ActionResult<Fixture>> PostFixture(FixtureDTO fixture)
    {
        var homeTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == fixture.HomeTeamId);

        var awayTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == fixture.AwayTeamId);

        var season = await _context.Seasons
            .FirstOrDefaultAsync(lt => lt.Id == fixture.SeasonId);

        if (homeTeam == null || awayTeam == null || season == null)
            return BadRequest();
       
        Fixture fixtureToAdd = Fixture.Create(fixture, homeTeam, awayTeam, season);      
        EntityEntry<Fixture> addedFixture = _context.Fixtures.Add(fixtureToAdd);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(PostFixture), new { id = addedFixture.Entity.Id }, fixture);
    }

    // PUT: api/Fixture
    [HttpPut]
    public async Task<IActionResult> PutFixture(FixtureDTO fixture)
    {
        var homeTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == fixture.HomeTeamId);

        var awayTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == fixture.AwayTeamId);

        var season = await _context.Seasons
            .FirstOrDefaultAsync(lt => lt.Id == fixture.SeasonId);

        if (homeTeam == null || awayTeam == null || season == null)
            return BadRequest();

        Fixture fixtureToUpdate = Fixture.Create(fixture, homeTeam, awayTeam, season);  
        fixtureToUpdate.Id = fixture.Id;
        fixtureToUpdate.KnownScore = true;
        _context.Entry(fixtureToUpdate).State = EntityState.Modified;

        try
        {
            // Update the laague with the result.
            _leagueController.UpdateLeagueWithResult(fixture, homeTeam, awayTeam);

            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!FixtureExists(fixtureToUpdate.Id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }   

    private bool FixtureExists(int id)
    {
        return _context.Fixtures.Any(e => e.Id == id);
    }
}
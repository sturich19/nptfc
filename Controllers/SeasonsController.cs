using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Models;
using nptfcBE.DTO;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/Seasons")]
public class SeasonsController : ControllerBase
{
    private readonly DatabaseContext _context;

    public SeasonsController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    #region Get Methods
    // GET: api/Seasons
    [HttpGet(Name = "GetSeasons")]
    public async Task<ActionResult<IEnumerable<Season>>> GetSeasons()
    {
        return await _context.Seasons.OrderByDescending(s => s.EndYear).ToListAsync();
    }  
    
    // GET: api/Seasons/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Season>> GetSeason(int id)
    {
        var season = await _context.Seasons.FindAsync(id);
        if (season == null)
            return NotFound();        

        return season;
    }

      // GET: api/AgeGroups/5
    [HttpGet("ageGroup/{id}")]
    public async Task<ActionResult<IEnumerable<Season>>> GetSeasonsForAgeGroup(int id)
    {
        return await _context.Seasons.Where(s => s.AgeGroupId == id).ToListAsync();
    }
    #endregion Get Methods

    #region Post Methods
    // POST: api/Seasons
    [HttpPost]
    public async Task<ActionResult<Season>> PostSeason(Season season)
    {
        _context.Seasons.Add(season);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSeason), new { id = season.Id }, season);
    }

    // POST: api/Seasons/setup
    [HttpPost("setup")]
    public async Task<ActionResult<Season>> PostSeasonSetup(SeasonSetupDTO seasonSetup)
    {
        if (seasonSetup.TeamIds == null || !seasonSetup.TeamIds.Any())
        {
            return BadRequest("At least one team must be selected for the season");
        }

        // Validate that all teams exist
        var validTeamIds = await _context.Teams
            .Where(t => seasonSetup.TeamIds.Contains(t.Id))
            .Select(t => t.Id)
            .ToListAsync();

        if (validTeamIds.Count != seasonSetup.TeamIds.Count)
        {
            return BadRequest("One or more selected teams do not exist");
        }

        Season season;

        // Check if we're updating an existing season or creating a new one
        if (seasonSetup.Id.HasValue && seasonSetup.Id > 0)
        {
            // Update existing season
            season = await _context.Seasons.FindAsync(seasonSetup.Id.Value);
            if (season == null)
            {
                return NotFound($"Season with ID {seasonSetup.Id} not found");
            }

            // Update season properties
            season.StartYear = seasonSetup.StartYear;
            season.EndYear = seasonSetup.EndYear;
            season.AgeGroup = seasonSetup.AgeGroup;
            season.MonthStart = seasonSetup.MonthStart;
            season.MonthEnd = seasonSetup.MonthEnd;
            season.AgeGroupId = seasonSetup.AgeGroupId;
            season.Division = seasonSetup.Division;
            season.Active = seasonSetup.Active;

            _context.Entry(season).State = EntityState.Modified;
        }
        else
        {
            // Create new season
            season = new Season
            {
                StartYear = seasonSetup.StartYear,
                EndYear = seasonSetup.EndYear,
                AgeGroup = seasonSetup.AgeGroup,
                MonthStart = seasonSetup.MonthStart,
                MonthEnd = seasonSetup.MonthEnd,
                AgeGroupId = seasonSetup.AgeGroupId,
                Division = seasonSetup.Division,
                Active = seasonSetup.Active
            };

            _context.Seasons.Add(season);
        }

        await _context.SaveChangesAsync();

        // Get existing league entries for this season
        var existingLeagueTeamIds = await _context.League
            .Where(l => l.SeasonId == season.Id)
            .Select(l => l.TeamId)
            .ToListAsync();

        // Find teams that need to be added (not already in league)
        var teamsToAdd = seasonSetup.TeamIds
            .Where(teamId => !existingLeagueTeamIds.Contains(teamId))
            .ToList();

        // Add new league entries only for teams not already in the season
        if (teamsToAdd.Any())
        {
            var leagueEntries = teamsToAdd.Select(teamId => new League
            {
                TeamId = teamId,
                SeasonId = season.Id,
                Won = 0,
                Lost = 0,
                Drawn = 0,
                GlsFor = 0,
                GlsA = 0
            }).ToList();

            _context.League.AddRange(leagueEntries);
        }

        // Remove teams that are no longer selected
        var teamsToRemove = existingLeagueTeamIds
            .Where(teamId => !seasonSetup.TeamIds.Contains(teamId))
            .ToList();

        if (teamsToRemove.Any())
        {
            var leagueEntriesToRemove = await _context.League
                .Where(l => l.SeasonId == season.Id && teamsToRemove.Contains(l.TeamId))
                .ToListAsync();

            _context.League.RemoveRange(leagueEntriesToRemove);
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSeason), new { id = season.Id }, season);
    }
    #endregion Post Methods

    #region Put Methods
    // PUT: api/Seasons/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutSeason(int id, Season season)
    {
        if (id != season.Id)
        {
            return BadRequest();
        }

        _context.Entry(season).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SeasonExists(id))
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
    #endregion Put Methods 

    #region Delete Methods
    // DELETE: api/Seasons/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSeason(int id)
    {
        var season = await _context.Seasons.FindAsync(id);
        if (season == null)
        {
            return NotFound();
        }

        _context.Seasons.Remove(season);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    #endregion Delete Methods

    private bool SeasonExists(int id)
    {
        return _context.Seasons.Any(e => e.Id == id);
    }
}
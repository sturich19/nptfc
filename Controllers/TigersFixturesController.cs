using System.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/TigersFixtures")]
public class TigersFixturesController : ControllerBase
{
    private readonly DatabaseContext _context;

    public TigersFixturesController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }    

    [HttpGet(Name = "GetTigersFixtures")]
    public async Task<ActionResult<IEnumerable<TigersFixtureDTO>>> GetTigersFixtures()    
    {
        return await _context.TigersFixtures
                    .Select(fixture => new TigersFixtureDTO
                    {
                        Id = fixture.Id,
                        Date = fixture.Date,
                        AwayTeam = fixture.AwayTeam.Name,
                        AwayTeamScore = fixture.AwayTeamScore,
                        HomeTeam = fixture.HomeTeam.Name,
                        HomeTeamScore = fixture.HomeTeamScore,
                        Location = fixture.Location,
                        Result = fixture.Result,
                        SeasonId = fixture.SeasonId,
                        Type = fixture.Type,
                        Pts = fixture.Pts,
                        GlsFor = fixture.GlsFor,
                        GlsA = fixture.GlsA,
                        SeasonName = "U" + fixture.Season.AgeGroup + " " + fixture.Season.StartYear
                    })
                    .OrderBy(f  => f.Date)                    
                    .ToListAsync();

            
    }
     
    [HttpGet("season/{seasonId}", Name = "GetTigersFixturesBySeasonId")]
    public async Task<ActionResult<IEnumerable<TigersFixtureDTO>>> GetTigersFixturesBySeasonId(int seasonId)
    {
        return await _context.TigersFixtures
                    .Select(fixture => new TigersFixtureDTO
                    {
                        Id = fixture.Id,
                        Date = fixture.Date,
                        AwayTeam = fixture.AwayTeam.Name,
                        AwayTeamScore = fixture.AwayTeamScore,
                        HomeTeam = fixture.HomeTeam.Name,
                        HomeTeamScore = fixture.HomeTeamScore,
                        Location = fixture.Location,
                        Result = fixture.Result,
                        SeasonId = fixture.SeasonId,
                        Type = fixture.Type,
                        Pts = fixture.Pts,
                        GlsFor = fixture.GlsFor,
                        GlsA = fixture.GlsA,
                        SeasonName = "U" + fixture.Season.AgeGroup + " " + fixture.Season.StartYear
                    })
                    .OrderBy(f  => f.Date)
                    .Where(f=> seasonId == f.SeasonId)                    
                    .ToListAsync();

            
    }

    // GET: api/Fixtures/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TigersFixtureDTO>> GetTigersFixture(int id)
    {
         var fixture = await _context.TigersFixtures
                        .Where(f=> f.Id == id)
                        .Include(f => f.HomeTeam)
                        .Include(f => f.AwayTeam)
                        .FirstOrDefaultAsync();

        if (fixture == null)
        {
            return NotFound();
        }

        return new TigersFixtureDTO()
        {
            Id = fixture.Id,
            Date = fixture.Date,
            AwayTeam = fixture.AwayTeam.Name,
            AwayTeamScore = fixture.AwayTeamScore,
            HomeTeam = fixture.HomeTeam.Name,
            HomeTeamScore = fixture.HomeTeamScore,
            Location = fixture.Location,
            Result = fixture.Result,
            SeasonId = fixture.SeasonId,
            Type = fixture.Type,
            Pts = fixture.Pts,
            GlsFor = fixture.GlsFor,
            GlsA = fixture.GlsA,
            SeasonName = "U" + fixture.Season.AgeGroup + " " + fixture.Season.StartYear
        };    
    }

    // POST: api/Fixtures
    [HttpPost]
    public async Task<ActionResult<TigersFixture>> PostTigersFixture(TigersFixtureDTO fixture)
    {
        var homeTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == int.Parse(fixture.HomeTeam));

        var awayTeam = await _context.Teams
            .FirstOrDefaultAsync(lt => lt.Id == int.Parse(fixture.AwayTeam));

        var season = await _context.Seasons
            .FirstOrDefaultAsync(lt => lt.Id == fixture.SeasonId);

        if (homeTeam == null || awayTeam == null || season == null)
            return BadRequest();
       
        TigersFixture fixtureToAdd = TigersFixture.Create(fixture, homeTeam, awayTeam, season);      
        EntityEntry<TigersFixture> addedFixture = _context.TigersFixtures.Add(fixtureToAdd);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(PostTigersFixture), new { id = addedFixture.Entity.Id }, fixture);
    }

    // PUT: api/Fixtures/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTigersFixture(int id, TigersFixture fixture)
    {
        if (id != fixture.Id)
        {
            return BadRequest();
        }

        _context.Entry(fixture).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!FixtureExists(id))
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

    // DELETE: api/Fixtures/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTigersFixture(int id)
    {
        var fixture = await _context.TigersFixtures.FindAsync(id);
        if (fixture == null)
        {
            return NotFound();
        }

        _context.TigersFixtures.Remove(fixture);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool FixtureExists(int id)
    {
        return _context.TigersFixtures.Any(e => e.Id == id);
    }
}
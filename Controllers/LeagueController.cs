using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.DTO;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/League")]
public class LeagueController : ControllerBase
{
    private readonly DatabaseContext _context;

    public LeagueController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }    
     
    [HttpGet("{seasonId}", Name = "GetLeagueTable")]
    public async Task<ActionResult<IEnumerable<LeagueDTO>>> GetLeagueTable(int seasonId)
    {
        return await _context.League
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
            .OrderByDescending(f  => f.Points)
            .Where(f=> seasonId == f.SeasonId)                    
            .ToListAsync();
    }   

    // Post: api/League
    [HttpPost()]
    public async Task<IActionResult> PutLeague(League leagueResult)
    {
        var existingEntry = await _context.League
            .FirstOrDefaultAsync(lt => lt.TeamId == leagueResult.TeamId);

        if (existingEntry == null)
            return NotFound();

        existingEntry.Won += leagueResult.Won;
        existingEntry.Drawn += leagueResult.Drawn;
        existingEntry.Lost += leagueResult.Lost;
        existingEntry.GlsFor += leagueResult.GlsFor;
        existingEntry.GlsA += leagueResult.GlsA;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!LeagueTeamExists(leagueResult.TeamId))
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

    private bool LeagueTeamExists(int id)
    {
        return _context.League.Any(e => e.Id == id);
    }

    internal async void UpdateLeagueWithResult(FixtureDTO fixture, Team homeTeam, Team awayTeam)
    {
        // Its a score we already know - we dont need to add a league result for this.
        if (fixture.KnownScore)
            return;

        var existingHomeTeam  = await _context.League.FirstOrDefaultAsync(lt => lt.TeamId == homeTeam.Id);
        if (existingHomeTeam == null)
            return;

        var existingAwayTeam  = await _context.League.FirstOrDefaultAsync(lt => lt.TeamId == awayTeam.Id);
        if (existingAwayTeam == null)
            return;

        _context.Entry(existingHomeTeam).State = EntityState.Modified;
        _context.Entry(existingAwayTeam).State = EntityState.Modified;

        existingHomeTeam.GlsFor += fixture.HomeTeamScore;
        existingHomeTeam.GlsA += fixture.AwayTeamScore;
        existingAwayTeam.GlsFor += fixture.AwayTeamScore;
        existingAwayTeam.GlsA += fixture.HomeTeamScore;       

        // Work out who won.
        if (fixture.HomeTeamScore > fixture.AwayTeamScore)
        {
            existingHomeTeam.Won++; 
            existingAwayTeam.Lost++;
        }
        else if (fixture.HomeTeamScore < fixture.AwayTeamScore)
        {
            existingHomeTeam.Lost++;
            existingAwayTeam.Won++;
        }
        else
        {
            existingHomeTeam.Drawn++;
            existingAwayTeam.Drawn++;
        }

        
    }    
}
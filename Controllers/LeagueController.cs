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
            .Include(t => t.Team)
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
            .FirstOrDefaultAsync(lt => (lt.TeamId == leagueResult.TeamId) && (lt.SeasonId == leagueResult.SeasonId));

        if (existingEntry == null)
        {
            _context.League.Add(new League() {
                TeamId = leagueResult.TeamId,
                SeasonId = leagueResult.SeasonId
            });            
        }
        else
        {
            existingEntry.Won += leagueResult.Won;
            existingEntry.Drawn += leagueResult.Drawn;
            existingEntry.Lost += leagueResult.Lost;
            existingEntry.GlsFor += leagueResult.GlsFor;
            existingEntry.GlsA += leagueResult.GlsA;
            _context.League.Attach(existingEntry);
            _context.Entry(existingEntry).State = EntityState.Modified;
        }

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

    internal async Task UpdateLeagueWithResult(FixtureDTO fixture, Team homeTeam, Team awayTeam)
    {
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

    internal async Task UpdateLeagueAfterScrewUp(FixtureDTO fixture, Team homeTeam, Team awayTeam, Fixture existingFixture)
    {
        var homeTeamLeagueStats  = await _context.League.FirstOrDefaultAsync(lt => lt.TeamId == homeTeam.Id);
        if (homeTeamLeagueStats == null)
            return;

        var awayTeamLeagueStats  = await _context.League.FirstOrDefaultAsync(lt => lt.TeamId == awayTeam.Id);
        if (awayTeamLeagueStats == null)
            return;

        _context.Entry(homeTeamLeagueStats).State = EntityState.Modified;
        _context.Entry(awayTeamLeagueStats).State = EntityState.Modified;   

        // Reset the goals for the game. Then add on the goals from the updated fixture.
        homeTeamLeagueStats.GlsFor -= existingFixture.HomeTeamScore;
        homeTeamLeagueStats.GlsA -= existingFixture.AwayTeamScore;
        awayTeamLeagueStats.GlsFor -= existingFixture.AwayTeamScore;
        awayTeamLeagueStats.GlsA -= existingFixture.HomeTeamScore;    

        homeTeamLeagueStats.GlsFor += fixture.HomeTeamScore;
        homeTeamLeagueStats.GlsA += fixture.AwayTeamScore;
        awayTeamLeagueStats.GlsFor += fixture.AwayTeamScore;
        awayTeamLeagueStats.GlsA += fixture.HomeTeamScore;     

        // Goals are updated - we now need to set the WLD correctly.
        switch (WhoWonTheGame(existingFixture.HomeTeamScore, existingFixture.AwayTeamScore))
        {
            case WhoWon.Home:
            {
                // Originally the home team won. If thats still the same. Do nothing - could just be a score update.
                if (fixture.HomeTeamScore > fixture.AwayTeamScore)
                    break;

                // Originally the home team won. Its now a loss.
                if (fixture.HomeTeamScore < fixture.AwayTeamScore)
                {
                    homeTeamLeagueStats.Won--;
                    homeTeamLeagueStats.Lost++;
                    awayTeamLeagueStats.Won++;
                    awayTeamLeagueStats.Lost--;
                    break;
                }
                    
                // Originally the home team won. Its now a draw.
                homeTeamLeagueStats.Won--;
                homeTeamLeagueStats.Drawn++;
                awayTeamLeagueStats.Lost--;
                awayTeamLeagueStats.Drawn++;
                break;
            }

            case WhoWon.Away:
            {
                 // Originally the away team won. If thats still the same. Do nothing. Could just be a score update.
                if (fixture.HomeTeamScore < fixture.AwayTeamScore)
                    break;

                // Originally the away team won. Its now a loss.
                if (fixture.HomeTeamScore > fixture.AwayTeamScore)
                {
                    awayTeamLeagueStats.Won--;
                    awayTeamLeagueStats.Lost++;
                    homeTeamLeagueStats.Won++;
                    homeTeamLeagueStats.Lost--;
                    break;
                }
                    
                // Originally the away team won. Its now a draw.
                awayTeamLeagueStats.Won--;
                awayTeamLeagueStats.Drawn++;
                homeTeamLeagueStats.Lost--;
                homeTeamLeagueStats.Drawn++;
                break;
            }

            case WhoWon.Draw:
            {
                 // Originally it was a draw. If thats still the same. Do nothing.
                if (fixture.HomeTeamScore == fixture.AwayTeamScore)
                    break;

                // Originally it was a draw. Its now a home team win
                if (fixture.HomeTeamScore > fixture.AwayTeamScore)
                {
                    homeTeamLeagueStats.Drawn--;
                    homeTeamLeagueStats.Won++;   
                    awayTeamLeagueStats.Drawn--;                 
                    awayTeamLeagueStats.Lost++;  
                    break;
                }
                    
                // Originally it was a draw. Its now a away team win
                awayTeamLeagueStats.Won++;
                awayTeamLeagueStats.Drawn--;
                homeTeamLeagueStats.Lost++;
                homeTeamLeagueStats.Drawn--;
                break;
            }
        }   
    }    

    private WhoWon WhoWonTheGame(int homeScore, int awayScore)
    {
        if (homeScore> awayScore)
            return WhoWon.Home;

        if (awayScore > homeScore)
            return WhoWon.Away;

        return WhoWon.Draw;        
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/Teams")]
public class TeamsController : ControllerBase
{
    private readonly DatabaseContext _context;

    public TeamsController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    // GET: api/Teams}
    [HttpGet(Name = "GetTeams")]
    public async Task<ActionResult<IEnumerable<Team>>> GetTeams()
    {
        return await _context.Teams.OrderBy(t => t.Name).ToListAsync();
    }

    // GET: api/Teams/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Team>> GetTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team == null)
        {
            return NotFound();
        }

        return team;
    }

    // POST: api/Teams
    [HttpPost]
    public async Task<ActionResult<Team>> PostTeam(Team team)
    {
        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
    }

    // GET: api/Teams/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTeam(int id, Team team)
    {
        if (id != team.Id)
        {
            return BadRequest();
        }

        _context.Entry(team).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TeamExists(id))
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

    // DELETE: api/Teams/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team == null)
        {
            return NotFound();
        }

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TeamExists(int id)
    {
        return _context.Teams.Any(e => e.Id == id);
    }
}
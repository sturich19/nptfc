using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/Players")]
public class PlayersController : ControllerBase
{
    private readonly DatabaseContext _context;

    public PlayersController(DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    // GET: api/Players}
    [HttpGet(Name = "GetPlayers")]
    public async Task<ActionResult<IEnumerable<Player>>> GetPlayers()
    {
        return await _context.Players.ToListAsync();
    }

    // GET: api/Players/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Player>> GetPlayer(int id)
    {
        var player = await _context.Players.FindAsync(id);

        if (player == null)
        {
            return NotFound();
        }

        return player;
    }

    // POST: api/Players
    [HttpPost]
    public async Task<ActionResult<Player>> PostPlayer(Player player)
    {
        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, player);
    }

    // GET: api/Players/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPlayer(int id, Player player)
    {
        if (id != player.Id)
        {
            return BadRequest();
        }

        _context.Entry(player).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PlayerExists(id))
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

    // DELETE: api/Players/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlayer(int id)
    {
        var player = await _context.Players.FindAsync(id);
        if (player == null)
        {
            return NotFound();
        }

        _context.Players.Remove(player);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PlayerExists(int id)
    {
        return _context.Players.Any(e => e.Id == id);
    }
}
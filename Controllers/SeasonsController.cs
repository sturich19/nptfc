using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Models;

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
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nptfcBE.Models;

namespace nptfcBE.Controllers;

[ApiController]
[Route("api/AgeGroups")]
public class AgeGroupsController  : ControllerBase
{
    private readonly DatabaseContext _context;

    public AgeGroupsController (DatabaseContext databaseContext)
    {
        _context = databaseContext;
    }

    #region Get Methods
    // GET: api/AgeGroup
    [HttpGet( Name = "Get")]
    public async Task<ActionResult<AgeGroup>> Get()
    {   
        return await _context.AgeGroups.OrderByDescending(a => a.Age).FirstAsync();
    }  

    // GET: api/AgeGroups
    [HttpGet("all", Name = "GetAgeGroups")]
    public async Task<ActionResult<IEnumerable<AgeGroup>>> GetAgeGroups()
    {   
        return await _context.AgeGroups.OrderByDescending(a => a.Age).ToListAsync();
    }  
    #endregion Get Methods
}
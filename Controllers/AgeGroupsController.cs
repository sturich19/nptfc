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
    // GET: api/AgeGroups
    [HttpGet(Name = "GetAgeGroups")]
    public async Task<ActionResult<IEnumerable<AgeGroup>>> GetAgeGroups()
    {   
        return await _context.AgeGroups.ToListAsync();
    }  
    #endregion Get Methods
}
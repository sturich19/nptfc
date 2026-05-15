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


    [HttpGet("history/{id}")]
    public async Task<ActionResult<IEnumerable<FixtureDTO>>> GetFixtureHistory(int id)
    {
        var fixture = await _context.Fixtures
                .Where(f => f.Id == id)
                .Include(f => f.AwayTeam)
                .Include(f => f.HomeTeam)
                .FirstOrDefaultAsync();

        if (fixture == null)
        {
            return NotFound();
        }

        // Get all league fixtures between the two teams
        var leagueFixtures = await _context.Fixtures
                .Where(f => (f.HomeTeamId == fixture.HomeTeamId && f.AwayTeamId == fixture.AwayTeamId) || (f.HomeTeamId == fixture.AwayTeamId && f.AwayTeamId == fixture.HomeTeamId))
                .Include(f => f.AwayTeam)
                .Include(f => f.HomeTeam)
                .Include(f => f.Season)
                .Select(f => new FixtureDTO
                {
                    Id = f.Id,
                    Date = f.Date,
                    AwayTeam = f.AwayTeam.Name,
                    AwayTeamId = f.AwayTeam.Id,
                    AwayTeamScore = f.AwayTeamScore,
                    HomeTeam = f.HomeTeam.Name,
                    HomeTeamId = f.HomeTeam.Id,
                    HomeTeamScore = f.HomeTeamScore,
                    SeasonId = f.SeasonId,
                    KnownScore = f.KnownScore
                })
                .ToListAsync();

        // If Tigers (id=1) are involved, also load friendlies from TigersFixtures
        if (fixture.HomeTeamId == 1 || fixture.AwayTeamId == 1)
        {
            var leagueDates = leagueFixtures.Select(f => f.Date.Date).ToHashSet();

            var tigersFixtures = await _context.TigersFixtures
                    .Where(f => (f.HomeTeamId == fixture.HomeTeamId && f.AwayTeamId == fixture.AwayTeamId) || (f.HomeTeamId == fixture.AwayTeamId && f.AwayTeamId == fixture.HomeTeamId))
                    .Include(f => f.AwayTeam)
                    .Include(f => f.HomeTeam)
                    .ToListAsync();

            var friendlies = tigersFixtures
                    .Where(f => !leagueDates.Contains(f.Date.Date))
                    .Select(f =>
                    {
                        // Tigers are always home team id=1; work out scores relative to Tigers
                        int tigersScore = f.HomeTeamId == 1 ? f.HomeTeamScore : f.AwayTeamScore;
                        int opponentScore = f.HomeTeamId == 1 ? f.AwayTeamScore : f.HomeTeamScore;

                        return new FixtureDTO
                        {
                            Id = f.Id,
                            Date = f.Date,
                            AwayTeam = f.AwayTeam.Name,
                            AwayTeamId = f.AwayTeam.Id,
                            AwayTeamScore = f.AwayTeamScore,
                            HomeTeam = f.HomeTeam.Name,
                            HomeTeamId = f.HomeTeam.Id,
                            HomeTeamScore = f.HomeTeamScore,
                            SeasonId = f.SeasonId,
                            KnownScore = tigersScore > 0 || opponentScore > 0
                        };
                    });

            return leagueFixtures.Concat(friendlies).OrderBy(f => f.Date).ToList();
        }

        return leagueFixtures.OrderBy(f => f.Date).ToList();
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
                    .OrderBy(f => f.Date)
                    .ToListAsync();


    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FixtureDTO>> GetFixture(int id)
    {
        var fixture = await _context.Fixtures
                   .Where(f => f.Id == id)
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
                        AchieveablePoints = 36 - (leagueTeam.Lost * 3) - (leagueTeam.Drawn * 2),
                        WinPercentage = leagueTeam.WinPercentage
                    })
                    .Where(l => l.SeasonId == seasonId)
                    .OrderBy(l => l.TeamName)
                    .ToListAsync();


        // Get me all the fixtures. For each fixture - add a new team and row element into the grid.
        List<FixtureDTO> fixtures = _context.Fixtures
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
                        .OrderBy(f => f.HomeTeam)
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
                    fixtureItem.Items.Add(new FixtureGridItemDTO() { AwayTeamName = opposition.TeamName, NoGame = true });
                    continue;
                }

                // See if the oposition appear as an away team.
                FixtureDTO? fixture = homeTeamFixtures.Where(f => f.AwayTeamId == opposition.TeamId).FirstOrDefault();
                if (fixture == null)
                {
                    // We dont play this team at home.
                    fixtureItem.Items.Add(new FixtureGridItemDTO() { AwayTeamName = opposition.TeamName, NoGame = true });
                    continue;
                }

                fixtureItem.Items.Add(new FixtureGridItemDTO()
                {
                    Id = fixture.Id,
                    AwayTeamId = fixture.AwayTeamId,
                    AwayTeamName = fixture.AwayTeam,
                    AwayTeamScore = fixture.AwayTeamScore,
                    Date = fixture.Date,
                    HomeTeamScore = fixture.HomeTeamScore,
                    HomeTeamId = fixture.HomeTeamId,
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
                    .OrderBy(f => f.Date)
                    .Where(f => seasonId == f.SeasonId)
                    .ToListAsync();
    }


    [HttpGet("date/{seasonId},{date}", Name = "GetFixturesForDate")]
    public async Task<ActionResult<IEnumerable<FixtureDTO>>> GetFixturesForDate(int seasonId, DateTime date)
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
                .Where(f => seasonId == f.SeasonId)
                .Where(f => date.Date == f.Date.Date)
                .ToListAsync();
    }


    [HttpGet("results/{seasonId},{teamId}", Name = "GetResultsForTeam")]
    public async Task<ActionResult<TeamsFixturesDTO>> GetResultsForTeam(int seasonId, int teamId)
    {
        var team = await _context.Teams
           .FirstOrDefaultAsync(lt => lt.Id == teamId);

        if (team == null)
            return BadRequest();

        List<FixtureDTO> fixtures = await _context.Fixtures
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
                    .OrderBy(f => f.Date)
                    .Where(f => seasonId == f.SeasonId)
                    .Where(f => teamId == f.HomeTeamId || teamId == f.AwayTeamId)
                    .ToListAsync();

        return new TeamsFixturesDTO() { Id = team.Id, Fixtures = fixtures, TeamName = team.Name };
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

        Fixture originalFixture = await _context.Fixtures.FirstOrDefaultAsync(f => f.Id == fixture.Id);

        if (fixture.KnownScore)
        {
            // Its a score we already know - we dont need to add a league result for this. We need to update it.
            await _leagueController.UpdateLeagueAfterScrewUp(fixture, homeTeam, awayTeam, originalFixture);
        }
        else
        {
            await _leagueController.UpdateLeagueWithResult(fixture, homeTeam, awayTeam);
        }

        await _context.SaveChangesAsync();

        // Now ensure the fixture object itself is updated.
        Fixture fixtureToUpdate = Fixture.Create(fixture, homeTeam, awayTeam, season);
        fixtureToUpdate.Id = fixture.Id;

        try
        {
            fixtureToUpdate.KnownScore = true;
            var existingEntity = _context.Fixtures.Find(fixtureToUpdate.Id);
            if (existingEntity != null)
                _context.Entry(existingEntity).State = EntityState.Detached;

            _context.Fixtures.Attach(fixtureToUpdate);
            _context.Entry(fixtureToUpdate).State = EntityState.Modified;

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

    // POST: api/Fixtures/bulk
    [HttpPost("bulk")]
    public async Task<ActionResult> PostBulkFixtures(BulkFixtureDTO bulkOperation)
    {
        if (bulkOperation?.Fixtures == null || !bulkOperation.Fixtures.Any())
        {
            return BadRequest("No fixtures provided");
        }

        // Get all fixture IDs that have an Id to check if they exist
        var fixtureIdsToCheck = bulkOperation.Fixtures
            .Where(f => f.Id > 0)
            .Select(f => f.Id)
            .ToList();

        var existingFixtureIds = (await _context.Fixtures
            .Where(f => fixtureIdsToCheck.Contains(f.Id))
            .Select(f => f.Id)
            .ToListAsync()).ToHashSet();

        // Validate all teams and seasons exist upfront
        var teamIds = bulkOperation.Fixtures.SelectMany(f => new[] { f.HomeTeamId, f.AwayTeamId }).Distinct().ToList();
        var seasonIds = bulkOperation.Fixtures.Select(f => f.SeasonId).Distinct().ToList();

        var existingTeams = await _context.Teams
            .Where(t => teamIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t);

        var existingSeasons = await _context.Seasons
            .Where(s => seasonIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s);

        // Process each fixture
        foreach (var fixtureDTO in bulkOperation.Fixtures)
        {
            // Validate teams and season exist
            if (!existingTeams.ContainsKey(fixtureDTO.HomeTeamId) ||
                !existingTeams.ContainsKey(fixtureDTO.AwayTeamId) ||
                !existingSeasons.ContainsKey(fixtureDTO.SeasonId))
            {
                return BadRequest($"Invalid team or season IDs for fixture: HomeTeam={fixtureDTO.HomeTeamId}, AwayTeam={fixtureDTO.AwayTeamId}, Season={fixtureDTO.SeasonId}");
            }

            var homeTeam = existingTeams[fixtureDTO.HomeTeamId];
            var awayTeam = existingTeams[fixtureDTO.AwayTeamId];
            var season = existingSeasons[fixtureDTO.SeasonId];

            // Auto-detect operation type
            if (fixtureDTO.Id == 0)
            {
                // No ID provided - it's a new fixture (ADD)
                var newFixture = new Fixture
                {
                    HomeTeamId = fixtureDTO.HomeTeamId,
                    AwayTeamId = fixtureDTO.AwayTeamId,
                    HomeTeamScore = fixtureDTO.HomeTeamScore,
                    AwayTeamScore = fixtureDTO.AwayTeamScore,
                    Date = fixtureDTO.Date,
                    SeasonId = fixtureDTO.SeasonId,
                    KnownScore = fixtureDTO.KnownScore
                };

                _context.Fixtures.Add(newFixture);
                await _context.SaveChangesAsync(); // Save to get the ID

                // Update league if score is known
                if (fixtureDTO.KnownScore)
                {
                    fixtureDTO.Id = newFixture.Id; // Set ID for league update
                    await _leagueController.UpdateLeagueWithResult(fixtureDTO, homeTeam, awayTeam);
                }
            }
            else if (existingFixtureIds.Contains(fixtureDTO.Id))
            {
                // ID provided and exists in database - it's an update (UPDATE)
                var existingFixture = await _context.Fixtures.FindAsync(fixtureDTO.Id);

                // Store original for league update
                var originalFixture = new Fixture
                {
                    HomeTeamScore = existingFixture.HomeTeamScore,
                    AwayTeamScore = existingFixture.AwayTeamScore
                };

                // Update fixture
                existingFixture.HomeTeamId = fixtureDTO.HomeTeamId;
                existingFixture.AwayTeamId = fixtureDTO.AwayTeamId;
                existingFixture.HomeTeamScore = fixtureDTO.HomeTeamScore;
                existingFixture.AwayTeamScore = fixtureDTO.AwayTeamScore;
                existingFixture.Date = fixtureDTO.Date;
                existingFixture.SeasonId = fixtureDTO.SeasonId;
                existingFixture.KnownScore = fixtureDTO.KnownScore;

                _context.Entry(existingFixture).State = EntityState.Modified;

                // Update league if score is known
                if (fixtureDTO.KnownScore)
                {
                    await _leagueController.UpdateLeagueAfterScrewUp(fixtureDTO, homeTeam, awayTeam, originalFixture);
                }
            }
            else
            {
                // ID provided but doesn't exist - error
                return BadRequest($"Fixture with ID {fixtureDTO.Id} not found for update");
            }
        }

        // Save all changes
        await _context.SaveChangesAsync();

        return Ok();
    }

    private bool FixtureExists(int id)
    {
        return _context.Fixtures.Any(e => e.Id == id);
    }

    // DELETE: api/Fixtures/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFixture(int id)
    {
        var fixture = await _context.Fixtures.FindAsync(id);
        if (fixture == null)
        {
            return NotFound();
        }

        _context.Fixtures.Remove(fixture);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
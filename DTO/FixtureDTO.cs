using nptfcBE.Models;

namespace nptfcBE.DTO
{
    public class FixtureDTO
    {
        public int Id { get; set; }
        public int HomeTeamId { get; set; }
        public string? HomeTeam { get; set; }
        public string? AwayTeam { get; set; }
        public int AwayTeamId { get; set; }
        public int HomeTeamScore { get; set; }
        public int AwayTeamScore { get; set; }
        public DateTime Date { get; set; }
        public int SeasonId { get; set; }
        public bool KnownScore { get; set; }

        public static FixtureDTO Create(Fixture fixture)
        {
            return new FixtureDTO()
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
            };
        }
    }
}
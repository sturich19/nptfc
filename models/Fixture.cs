using nptfcBE.DTO;

namespace nptfcBE.Models
{
    public class Fixture
    {
        public int Id {get; set;}
        public int HomeTeamId {get; set;}
        public int AwayTeamId  {get; set;}
        public int HomeTeamScore {get; set;}
        public int AwayTeamScore  {get; set;}
        public DateTime Date {get; set;}
        public int SeasonId {get; set;}
        public Team HomeTeam {get; set;}
        public Team AwayTeam {get; set;}
        public Season Season {get; set;}
        public bool KnownScore {get; set;}

        public Fixture()
        {
            this.HomeTeam = new Team();
            this.AwayTeam = new Team();
            this.Season = new Season();            
        }

        public static Fixture Create(FixtureDTO dto, Team homeTeam, Team awayTeam, Season season)
        {
            return new Fixture()
            {
                AwayTeam = awayTeam, 
                AwayTeamId = awayTeam.Id, 
                HomeTeam = homeTeam, 
                HomeTeamId = homeTeam.Id,
                SeasonId = dto.SeasonId,
                Date = dto.Date,               
                HomeTeamScore = dto.HomeTeamScore,
                AwayTeamScore = dto.AwayTeamScore,
                Season = season,
                KnownScore = dto.KnownScore
            };
        }
    }
}
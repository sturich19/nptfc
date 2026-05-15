using nptfcBE.DTO;

namespace nptfcBE.Models
{
    public class TigersFixture
    {
        public int Id { get; set; }
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public int HomeTeamScore { get; set; }
        public int AwayTeamScore { get; set; }
        public DateTime Date { get; set; }
        public ResultType Result { get; set; }
        public GameLocation Location { get; set; }
        public int SeasonId { get; set; }
        public GameType Type { get; set; }
        public int Pts { get; set; }
        public Team HomeTeam { get; set; }
        public Team AwayTeam { get; set; }
        public int GlsFor { get; set; }
        public int GlsA { get; set; }
        public Season Season { get; set; }
        public string? VideoUrl { get; set; }

        public ICollection<GameStat> GameStats { get; set; }

        public TigersFixture()
        {
            this.HomeTeam = new Team();
            this.AwayTeam = new Team();
            this.Season = new Season();
            this.GameStats = new List<GameStat>();
        }

        public static TigersFixture Create(TigersFixtureDTO dto, Team homeTeam, Team awayTeam, Season season)
        {
            int pts = 0;
            if (dto.Result == ResultType.Win)
                pts = 3;
            else if (dto.Result == ResultType.Draw)
                pts = 1;

            return new TigersFixture()
            {
                AwayTeam = awayTeam,
                AwayTeamId = awayTeam.Id,
                HomeTeam = homeTeam,
                HomeTeamId = homeTeam.Id,
                SeasonId = dto.SeasonId,
                Date = dto.Date,
                Result = dto.Result,
                Location = dto.Location,
                Type = dto.Type,
                Pts = pts,
                GlsFor = dto.GlsFor,
                GlsA = dto.GlsA,
                HomeTeamScore = dto.HomeTeamScore,
                AwayTeamScore = dto.AwayTeamScore,
                Season = season,
                VideoUrl = dto.VideoUrl
            };
        }
    }
}
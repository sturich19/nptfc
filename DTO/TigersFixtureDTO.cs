namespace nptfcBE.DTO
{
    public class TigersFixtureDTO
    {
        public int Id {get; set;}
        public string? HomeTeam {get; set;}
        public string? AwayTeam {get; set;}
        public int HomeTeamScore {get; set;}
        public int AwayTeamScore  {get; set;}
        public DateTime Date {get; set;}
        public ResultType Result {get; set;}
        public GameLocation Location {get; set;}
        public int SeasonId {get; set;}
        public string? SeasonName {get; set;}
        public GameType Type {get; set;}
        public int Pts {get; set;}
        public int GlsFor {get; set;}
        public int GlsA {get; set;}
        public string? VideoUrl {get; set;}
    }
}
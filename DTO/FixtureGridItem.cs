namespace nptfcBE.DTO
{
    public class FixtureGridItemDTO
    {
        public int Id {get; set;}        
        public int AwayTeamId {get; set;}
        public string? AwayTeamName {get; set;} = "";
        public string? HomeTeamName {get; set;} = "";
        public int HomeTeamId {get; set;}
        public int HomeTeamScore {get; set;}
        public int AwayTeamScore  {get; set;}
        public DateTime Date {get; set;}
        public bool NoGame  { get; set;}
        public bool KnownScore  { get; set;}
    }
}
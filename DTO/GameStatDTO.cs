namespace nptfcBE.DTO
{
    public class GameStatDTO
    {
        public int Id {get; set;}
        public int Apps {get; set;}
        public int PlayerId {get; set;}
        public int FixtureId  {get; set;}
        public int SeasonId  {get; set;}
        public int Goals {get; set;}
        public int Assists  {get; set;}
        public int GSO {get; set;}
        public int Shots {get; set;}
        public int CleanSheets {get; set;}
        public int PenSaves {get; set;}
        public string? PlayerName {get; set;}
        public int ShotsOnTarget { get; set;}
        public int ShotsOffTarget { get; set;}
        public int Saves { get; set;}
    }
}
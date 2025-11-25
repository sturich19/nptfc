namespace nptfcBE.DTO
{
    public class LeagueDTO
    {
        public int Id { get; set; }
        public int Pld { get; set; }
        public int SeasonId { get; set; }
        public int TeamId { get; set; }
        public string? TeamName { get; set; }
        public int Games { get; set; }
        public int Won { get; set; }
        public int Lost { get; set; }
        public int Drawn { get; set; }
        public int Points { get; set; }
        public int GlsFor { get; set; }
        public int GlsA { get; set; }
        public int GD { get; set; }
        public int AchieveablePoints { get; set; }
        public double WinPercentage { get; set; }
    }
}
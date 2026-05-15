namespace nptfcBE.Models
{
    public class Season
    {
        public int Id { get; set; }
        public int StartYear { get; set; }
        public int EndYear { get; set; }
        public int AgeGroup { get; set; }
        public string MonthStart { get; set; }
        public string MonthEnd { get; set; }
        public int AgeGroupId { get; set; }

        public int Division { get; set; }
        public bool Active { get; set; }
        public int? Sequence { get; set; }

        public ICollection<GameStat> GameStats { get; set; }

        public Season()
        {
            this.GameStats = new List<GameStat>();
        }
    }
}
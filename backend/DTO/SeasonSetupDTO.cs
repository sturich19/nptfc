namespace nptfcBE.DTO
{
    public class SeasonSetupDTO
    {
        public int? Id { get; set; } // Optional - if provided, update existing season
        public int StartYear { get; set; }
        public int EndYear { get; set; }
        public int AgeGroup { get; set; }
        public string MonthStart { get; set; }
        public string MonthEnd { get; set; }
        public int AgeGroupId { get; set; }
        public int Division { get; set; }
        public bool Active { get; set; }
        public int? Sequence { get; set; }
        public List<int> TeamIds { get; set; } = new List<int>();
    }
}
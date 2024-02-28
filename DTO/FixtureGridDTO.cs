namespace nptfcBE.DTO
{
    public class FixtureGridDTO
    {
        public int Id {get; set;}               
        public string? HomeTeamName {get; set;} = "";   
        public List<FixtureGridItemDTO> Items {get; set;}
        public int SeasonId {get; set;}

        public FixtureGridDTO()
        {
            this.Items = new List<FixtureGridItemDTO>();
        }

    }
}
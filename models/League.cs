namespace nptfcBE.Models
{
    public class League
    {
        public int Id {get; set;}
        public int TeamId {get; set;}
        public int SeasonId {get; set;}        
        public int Won {get; set;}
        public int Lost {get; set;}
        public int Drawn {get; set;}
        public int GlsFor {get; set;}
        public int GlsA {get; set;}
        public Season Season {get; set;}
        public Team Team {get; set;}

        public League()
        {
            this.Team = new Team();
            this.Season = new Season();            
        }
    }
}
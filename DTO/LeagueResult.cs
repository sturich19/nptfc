namespace nptfcBE.DTO
{
    public class LeagueTableResult
    {
        public int SeasonId {get; set;}
        public int TeamId {get; set;}        
        public int Won  {get; set;}
        public int Lost  {get; set;}
        public int Drawn  {get; set;}        
        public int GlsFor {get; set;}
        public int GlsA {get; set;}        
    }
}
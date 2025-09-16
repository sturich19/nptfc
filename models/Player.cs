namespace nptfcBE.Models
{
    public class Player
    {
        public int Id {get; set;}
        public string? Firstname {get; set;}
        public string? Surname {get; set;}
        public string? Nickname {get; set;}
        public int? Shirt {get; set;}
        public bool Active {get; set;}

        public Position Position {get; set; }
        public ICollection<GameStat> GameStats {get; set;}

        public Player()
        {
            this.GameStats = new List<GameStat>();
        }   
    }
}
using nptfcBE.DTO;

namespace nptfcBE.Models
{
    public class GameStat
    {
        public int Id {get; set;}
        public int PlayerId {get; set;}
        public int FixtureId  {get; set;}
        public int SeasonId  {get; set;}
        public int Goals {get; set;}
        public int Assists  {get; set;}
        public int GSO {get; set;}
        public int Shots {get; set;}
        public int Tackles {get; set;}
        public int CleanSheets {get; set;}
        public TigersFixture Fixture {get; set;}
        public Player Player {get; set;}
        public Season Season {get; set;}
        public int ShotsOnTarget { get; set;}
        public int ShotsOffTarget { get; set;}
        public int Saves { get; set;}

        public GameStat()
        {
            this.Fixture = new TigersFixture();
            this.Player = new Player();
            this.Season = new Season();
        }

        public static GameStat Create(GameStatDTO dto, TigersFixture fixture, Player player, Season season)
        {
            return new GameStat()
            {
                Fixture = fixture, 
                FixtureId = fixture.Id, 
                Player = player, 
                PlayerId = player.Id,
                SeasonId = season.Id,
                Season = season,
                Goals = dto.Goals,
                GSO = dto.GSO,
                Assists = dto.Assists,
                Shots = dto.Shots,
                Tackles = dto.Tackles,  
                ShotsOnTarget = dto.ShotsOnTarget,    
                ShotsOffTarget = dto.ShotsOffTarget,
                Saves = dto.Saves,
                CleanSheets = dto.CleanSheets
            };
        }
    }
}
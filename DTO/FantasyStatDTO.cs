using nptfcBE.Models;

namespace nptfcBE.DTO
{
    public class FantasyStatDTO
    {
        public int Id {get; set;}
        public int PlayerId {get; set;}
        public string? PlayerName {get; set;}
        public int SeasonId  {get; set;}
        public int AppsPts {get; set;}        
        public int Apps {get; set;}     
        public int GoalPts {get; set;}
        public int Goals {get; set;}
        public int AssistsPts  {get; set;}
        public int Assists  {get; set;}
        public int GSOPts {get; set;}
        public int GSO {get; set;}
        public int ShotPts {get; set;}
        public int Shots {get; set;}
        public int TacklePts {get; set;}
        public int Tackles {get; set;}
        public int CleanSheetPoints {get; set;}
        public int CleanSheets {get; set;}
        public int Saves {get; set;}
        public int SavesPts {get; set;}
        public int TotalPoints {get; set;}   
        public Position Position {get; set; }     

        public static FantasyStatDTO Create(Player player, GameStatDTO gameStat)
        {
            int goalPts = CalculateGoalPts(player, gameStat.Goals); 
            int gsoPts = CalculateGSOPts(player, gameStat.GSO);      
            int shotPts = CalculateShotPts(player, gameStat.Shots);  
            int cleanSheetPts = CalculateCleanSheetPts(player, gameStat.CleanSheets);     

            return new FantasyStatDTO(){
                Id = gameStat.Id,
                AppsPts = gameStat.Apps * 2,
                GoalPts = goalPts,
                AssistsPts = gameStat.Assists * 3,
                GSOPts = gsoPts,
                ShotPts = shotPts,
                TacklePts = gameStat.Tackles,
                CleanSheetPoints = cleanSheetPts,
                PlayerId = gameStat.PlayerId,
                PlayerName = gameStat.PlayerName,
                SeasonId = gameStat.SeasonId,
                TotalPoints = (gameStat.Apps * 2) + goalPts + (gameStat.Assists * 3) + gsoPts + shotPts + cleanSheetPts + gameStat.Saves,
                Apps = gameStat.Apps,
                Assists = gameStat.Assists,
                CleanSheets = gameStat.CleanSheets,
                Goals = gameStat.Goals,
                GSO = gameStat.GSO,
                Shots = gameStat.Shots,
                Tackles = gameStat.Tackles,
                Saves = gameStat.Saves,
                SavesPts = gameStat.Saves,
                Position = player.Position
            };
        }

        private static int CalculateGoalPts(Player player, int goals) 
        {
            switch (player.Position)
            {
                case Position.GK:
                    return goals * 6;

                case Position.Defender:
                    return goals * 6;

                case Position.Midfielder:
                    return goals * 5;
                
                case Position.Striker:
                    return goals * 4;
            }  
            return 0;
        }

        private static int CalculateGSOPts(Player player, int gso) 
        {
            switch (player.Position)
            {
                case Position.GK:
                    return gso * 2;

                case Position.Defender:
                    return gso * 2;

                case Position.Midfielder:
                    return gso * 1;
                
                case Position.Striker:
                    return gso * 1;
            }  
            return 0;
        }

        private static int CalculateShotPts(Player player, int shots) 
        {
            switch (player.Position)
            {
                case Position.GK:
                    return shots * 2;

                case Position.Defender:
                    return shots * 2;

                case Position.Midfielder:
                    return shots * 1;
                
                case Position.Striker:
                    return shots * 1;
            }  
            return 0;
        }

        private static int CalculateCleanSheetPts(Player player, int cleanSheets) 
        {
            switch (player.Position)
            {
                case Position.GK:
                    return cleanSheets * 3;

                case Position.Defender:
                    return cleanSheets * 3;

                case Position.Midfielder:
                    return cleanSheets * 3;
                
                case Position.Striker:
                    return cleanSheets * 3;
            }  
            return 0;
        }
        
    }
}
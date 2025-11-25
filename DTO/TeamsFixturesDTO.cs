using nptfcBE.Models;

namespace nptfcBE.DTO
{
    public class TeamsFixturesDTO
    {
        public int Id { get; set; }
        public string? TeamName { get; set; } = "";
        public List<FixtureDTO> Fixtures { get; set; } = new List<FixtureDTO>();
    }
}
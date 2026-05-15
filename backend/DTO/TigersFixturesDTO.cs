using nptfcBE.Models;

namespace nptfcBE.DTO
{
    public class TigersFixturesDTO
    {
        public IEnumerable<TigersFixtureDTO> Fixtures;
        public Season Season;

        public TigersFixturesDTO()
        {
            this.Fixtures = new List<TigersFixtureDTO>();
            this.Season = new Season();
        }
    }
}
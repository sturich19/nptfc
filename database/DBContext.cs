using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Plugins;

namespace nptfcBE.Models;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    {
        
    }

    public DbSet<Season> Seasons { get; set; } = null!;
    public DbSet<TigersFixture> TigersFixtures { get; set; } = null!;
    public DbSet<Player> Players { get; set; } = null!;
    public DbSet<Team> Teams { get; set; } = null!;
    public DbSet<AgeGroup> AgeGroups {get; set;} = null!;
    public DbSet<GameStat> GameStats { get; set; } = null!;
    public DbSet<League> League { get; set; } = null!;

    public DbSet<Fixture> Fixtures { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {        
        modelBuilder.Entity<Season>().ToTable("AgeGroup");
        modelBuilder.Entity<Season>().ToTable("Season");
        modelBuilder.Entity<TigersFixture>().ToTable("TigersFixture")
            .HasOne(f => f.HomeTeam)
            .WithMany()
            .HasForeignKey(f => f.HomeTeamId);
        modelBuilder.Entity<TigersFixture>()        
            .HasOne(f => f.AwayTeam)
            .WithMany()
            .HasForeignKey(f => f.AwayTeamId);  
        modelBuilder.Entity<TigersFixture>()        
            .HasOne(f => f.Season)
            .WithMany()
            .HasForeignKey(f => f.SeasonId);       
        modelBuilder.Entity<Fixture>().ToTable("Fixture")
            .HasOne(f => f.HomeTeam)
            .WithMany()
            .HasForeignKey(f => f.HomeTeamId);
        modelBuilder.Entity<Fixture>()        
            .HasOne(f => f.AwayTeam)
            .WithMany()
            .HasForeignKey(f => f.AwayTeamId);  
        modelBuilder.Entity<Fixture>()        
            .HasOne(f => f.Season)
            .WithMany()
            .HasForeignKey(f => f.SeasonId);            
        modelBuilder.Entity<Player>().ToTable("Player");
        modelBuilder.Entity<Team>().ToTable("Team");
        modelBuilder.Entity<GameStat>().ToTable("GameStat")
            .HasOne(f => f.Fixture)
            .WithMany(s => s.GameStats)
            .HasForeignKey(gs => gs.FixtureId);
        modelBuilder.Entity<GameStat>()            
            .HasOne(f => f.Season)            
            .WithMany(s => s.GameStats)
            .HasForeignKey(gs => gs.SeasonId);
        modelBuilder.Entity<GameStat>()            
            .HasOne(f => f.Player)            
            .WithMany(p => p.GameStats)
            .HasForeignKey(p => p.PlayerId);
        modelBuilder.Entity<League>().ToTable("League");      
    }
}
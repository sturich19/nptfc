using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace nptfcBE.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayedColumnToGameStat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Played",
                table: "GameStat",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Played",
                table: "GameStat");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace nptfcBE.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_League_Season_SeasonId",
                table: "League");

            migrationBuilder.DropIndex(
                name: "IX_League_SeasonId",
                table: "League");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_League_SeasonId",
                table: "League",
                column: "SeasonId");

            migrationBuilder.AddForeignKey(
                name: "FK_League_Season_SeasonId",
                table: "League",
                column: "SeasonId",
                principalTable: "Season",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace nptfcBE.Migrations
{
    /// <inheritdoc />
    public partial class AddActiveColumnToPlayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Active",
                table: "Player",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Active",
                table: "Player");
        }
    }
}

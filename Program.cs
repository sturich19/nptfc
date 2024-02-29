using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using nptfcBE.Models;


//https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0&tabs=visual-studio-code

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<DatabaseContext> (opt=> opt.UseSqlServer("Server=tcp:nptfc-uk.database.windows.net,1433;Initial Catalog=NPTFC;Persist Security Info=False;User ID=nptfc-sa;Password=Alice@123;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;"));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
 builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
/*builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
    builder =>
    {
        builder.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin()
            .AllowAnyHeader();
    });
});

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
  {
    policy
        .WithOrigins("http://localhost:3000")
        .AllowAnyMethod()
        .AllowAnyOrigin()
        .AllowAnyHeader();
  }));*/


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(MyAllowSpecificOrigins);

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

using EduAISystem.Application;
using EduAISystem.Infrastructure;
using EduAISystem.Infrastructure.Persistence.Seed;
using EduAISystem.WebAPI.Middlewares;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region Service registration

// MVC Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Secret"]!)),

            // Do not allow clock skew
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS configuration
// Allow frontend applications to call API (dev-friendly setup)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true); // allow all origins (temporary)
    });
});

// Application & Infrastructure layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

#endregion

var app = builder.Build();

#region Database initialization

// Seed database (DB First)
await DbSeed.SeedAsync(app.Services);

#endregion

#region HTTP request pipeline

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

// HTTPS redirection
app.UseHttpsRedirection();

// Enable CORS before authentication
app.UseCors("AllowFrontend");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Global exception handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Map controllers
app.MapControllers();

#endregion

app.Run();

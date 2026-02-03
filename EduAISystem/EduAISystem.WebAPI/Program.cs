using EduAISystem.Application;
using EduAISystem.Infrastructure;
using EduAISystem.Infrastructure.Persistence.Seed;
using EduAISystem.WebAPI.Middlewares;
using Microsoft.IdentityModel.Tokens;

using Microsoft.OpenApi.Models;
using System.Security.Claims;

using System.Text;

var builder = WebApplication.CreateBuilder(args);
// CHECK CONFIG NGAY SAU KHI BUILD CONFIG
var jwtSection = builder.Configuration.GetSection("Jwt");

Console.WriteLine("===== JWT CONFIG CHECK =====");
Console.WriteLine("Issuer   : " + jwtSection["Issuer"]);
Console.WriteLine("Audience : " + jwtSection["Audience"]);
Console.WriteLine("Secret   : " + jwtSection["Secret"]);
Console.WriteLine("============================");

//  nếu thiếu thì cho chết sớm
if (string.IsNullOrWhiteSpace(jwtSection["Secret"]))
{
    throw new Exception("JWT Secret is missing BEFORE AddAuthentication");
}
#region Service registration

// MVC Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EduAISystem.WebAPI",
        Version = "v1"
    });

    //  Bearer JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT theo dạng: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


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
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role,
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
//await DbSeedRunner.RunAsync(
//    app.Services,
//    app.Environment
//);

#endregion

#region HTTP request pipeline

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

// HTTPS redirection
//app.UseHttpsRedirection();

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

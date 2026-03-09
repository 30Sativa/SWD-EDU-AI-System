using EduAISystem.Application;
using EduAISystem.Application.Common.Models;
using EduAISystem.WebAPI.Converters;
using EduAISystem.Infrastructure;
using EduAISystem.Infrastructure.Persistence.Seed;
using EduAISystem.WebAPI.Middlewares;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
//  CHECK CONFIG NGAY SAU KHI BUILD CONFIG
var jwtSection = builder.Configuration.GetSection("Jwt");
var apiKey = builder.Configuration["Gemini:ApiKey"];
var emailPassword = builder.Configuration["EmailSettings:Password"];
var cloudStorageConnectionString = builder.Configuration["Cloudinary:CloudName"];
var cloudStorageApiKey = builder.Configuration["Cloudinary:ApiKey"];
var cloudStorageApiSecret = builder.Configuration["Cloudinary:ApiSecret"];
Console.WriteLine("===== JWT CONFIG CHECK =====");
Console.WriteLine("Issuer   : " + jwtSection["Issuer"]);
Console.WriteLine("Audience : " + jwtSection["Audience"]);
Console.WriteLine("Secret   : " + jwtSection["Secret"]);
Console.WriteLine("ApiKey   : " + apiKey);
Console.WriteLine("Emaill Setting password:   " + emailPassword);
Console.WriteLine("Cloud Storage Connection String: " + cloudStorageConnectionString);
Console.WriteLine("Cloud Storage ApiKey: " + cloudStorageApiKey);
Console.WriteLine("Cloud Storage ApiSecret:  " + cloudStorageApiSecret);
Console.WriteLine("============================");

//  nếu thiếu thì cho chết sớm
if (string.IsNullOrWhiteSpace(jwtSection["Secret"]))
{
    throw new Exception("JWT Secret is missing BEFORE AddAuthentication");
}
#region Service registration

// MVC Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Xử lý chuỗi rỗng "" cho DateOnly? → tự convert thành null
        options.JsonSerializerOptions.Converters.Add(new NullableDateOnlyJsonConverter());
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EduAISystem.WebAPI",
        Version = "v1"
    });

    // Bật annotation 
    c.EnableAnnotations();

    // 🔐 Bearer JWT
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

    // Schema cho lỗi API (dùng khi 4xx/5xx)
    c.MapType<ApiError>(() => new OpenApiSchema
    {
        Type = "object",
        Properties = new Dictionary<string, OpenApiSchema>
        {
            ["message"] = new() { Type = "string", Description = "Thông báo lỗi" },
            ["errorCode"] = new() { Type = "string", Description = "Mã lỗi (vd: QUIZ_NOT_FOUND, OPTION_TEXT_REQUIRED)" },
            ["statusCode"] = new() { Type = "integer", Description = "HTTP status" },
            ["traceId"] = new() { Type = "string", Description = "Mã trace để debug" },
            ["detail"] = new() { Type = "string", Description = "Chi tiết kỹ thuật (khi có)" },
            ["errors"] = new() { Type = "object", Description = "Lỗi validation theo trường" }
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
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduAISystem.WebAPI v1");
});

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

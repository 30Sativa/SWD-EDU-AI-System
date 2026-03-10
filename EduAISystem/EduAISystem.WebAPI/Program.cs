using EduAISystem.Application;
using EduAISystem.Application.Common.Models;
using EduAISystem.WebAPI.Converters;
using EduAISystem.WebAPI.Services;
using EduAISystem.WebAPI.Hubs;
using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Infrastructure;
using EduAISystem.Infrastructure.Persistence.Seed;
using EduAISystem.WebAPI.Middlewares;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using System.Data;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Serilog.Debugging.SelfLog.Enable(Console.Error);

var configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("DefaultConnection");

// Thiết lập cột cho AuditLogs (Chỉ dùng cho SQL Sink)
var colOptions = new ColumnOptions();
colOptions.Store.Remove(StandardColumn.Id);
colOptions.Store.Remove(StandardColumn.Message);
colOptions.Store.Remove(StandardColumn.MessageTemplate);
colOptions.Store.Remove(StandardColumn.Level);
colOptions.Store.Remove(StandardColumn.Exception);
colOptions.Store.Remove(StandardColumn.Properties);
colOptions.TimeStamp.ColumnName = "CreatedAt";

// Thêm các cột tùy chỉnh
colOptions.AdditionalColumns = new List<SqlColumn>
{
    new SqlColumn { ColumnName = "UserId", DataType = SqlDbType.UniqueIdentifier, AllowNull = true },
    new SqlColumn { ColumnName = "Action", DataType = SqlDbType.NVarChar, DataLength = 100, AllowNull = true },
    new SqlColumn { ColumnName = "Entity", DataType = SqlDbType.NVarChar, DataLength = 50, AllowNull = true },
    new SqlColumn { ColumnName = "EntityId", DataType = SqlDbType.UniqueIdentifier, AllowNull = true },
    new SqlColumn { ColumnName = "OldValues", DataType = SqlDbType.NVarChar, DataLength = -1 },
    new SqlColumn { ColumnName = "NewValues", DataType = SqlDbType.NVarChar, DataLength = -1 },
    new SqlColumn { ColumnName = "IpAddress", DataType = SqlDbType.NVarChar, DataLength = 50 },
    new SqlColumn { ColumnName = "UserAgent", DataType = SqlDbType.NVarChar, DataLength = 255 }
};

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration) // Đọc Console và Level từ appsettings
    .Enrich.FromLogContext()
    .WriteTo.Logger(subLogger => subLogger
        .Filter.ByIncludingOnly(evt => evt.Properties.ContainsKey("Action"))
        .WriteTo.MSSqlServer(
            connectionString: connectionString,
            sinkOptions: new MSSqlServerSinkOptions
            {
                TableName = "AuditLogs",
                AutoCreateSqlTable = false,
                BatchPostingLimit = 1
            },
            columnOptions: colOptions
        ))
    .CreateLogger();

Log.Information("=== SERILOG INITIALIZED ===");
// Test log ngay khi startup
using (Serilog.Context.LogContext.PushProperty("Action", "SYSTEM_STARTUP"))
using (Serilog.Context.LogContext.PushProperty("Entity", "System"))
{
    Log.Information("Hệ thống đang khởi động và kiểm tra Audit Log...");
}

builder.Host.UseSerilog();

builder.Configuration.AddEnvironmentVariables();
//  CHECK CONFIG NGAY SAU KHI BUILD CONFIG
var jwtSection = builder.Configuration.GetSection("Jwt");
var apiKey = builder.Configuration["Gemini:ApiKey"];
var emailPassword = builder.Configuration["EmailSettings:Password"];
var cloudStorageConnectionString = builder.Configuration["Cloudinary:CloudName"];
var cloudStorageApiKey = builder.Configuration["Cloudinary:ApiKey"];
var cloudStorageApiSecret = builder.Configuration["Cloudinary:ApiSecret"];
Console.WriteLine("===== JWT CONFIG CHECK =====");
Console.WriteLine("Issuer   : " +  jwtSection["Issuer"]);
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

// Add SignalR & Notification Service
builder.Services.AddSignalR();
builder.Services.AddSingleton<IImportNotificationService, ImportNotificationService>();



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

// Add Serilog Request Logging
app.UseSerilogRequestLogging();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Global exception handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Map controllers & SignalR Hubs
app.MapControllers();
app.MapHub<ImportHub>("/hubs/import");

#endregion

app.Run();

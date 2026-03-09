using EduAISystem.Application.Abstractions.Security;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace EduAISystem.Infrastructure.Security
{
    /// <summary>
    /// Verify Google id_token bằng Google.Apis.Auth package.
    /// Cần install: Google.Apis.Auth (NuGet)
    /// Cần config: GoogleClientId trong appsettings.json
    /// </summary>
    public class GoogleTokenVerifier : IGoogleTokenVerifier
    {
        private readonly string _clientId;

        public GoogleTokenVerifier(IConfiguration config)
        {
            _clientId = config["Google:ClientId"]
                ?? throw new InvalidOperationException("Google:ClientId is not configured.");
        }

        public async Task<GoogleTokenPayload> VerifyAsync(string idToken, CancellationToken cancellationToken = default)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _clientId }
            };

            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                return new GoogleTokenPayload
                {
                    GoogleId = payload.Subject,       // "sub" claim
                    Email = payload.Email,
                    FullName = payload.Name,
                    AvatarUrl = payload.Picture,
                    EmailVerified = payload.EmailVerified
                };
            }
            catch (InvalidJwtException ex)
            {
                throw new UnauthorizedAccessException($"Invalid Google id_token: {ex.Message}", ex);
            }
        }
    }
}

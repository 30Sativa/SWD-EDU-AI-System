using Microsoft.Extensions.DependencyInjection;


namespace EduAISystem.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Sau này bạn add MediatR, Validator, AutoMapper ở đây
            return services;
        }
    }
}

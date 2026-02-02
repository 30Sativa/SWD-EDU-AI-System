FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY EduAISystem/ ./EduAISystem/
RUN dotnet restore "EduAISystem/EduAISystem.WebAPI/EduAISystem.WebAPI.csproj"
RUN dotnet build "EduAISystem/EduAISystem.WebAPI/EduAISystem.WebAPI.csproj" -c Release -o /app/build
RUN dotnet publish "EduAISystem/EduAISystem.WebAPI/EduAISystem.WebAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "EduAISystem.WebAPI.dll"]
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IQuizRepository
    {
        Task CreateAsync(QuizDomain quiz, CancellationToken cancellationToken);
    }
}

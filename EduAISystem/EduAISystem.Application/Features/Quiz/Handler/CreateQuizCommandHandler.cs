using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Handler
{
    public class CreateQuizCommandHandler : IRequestHandler<CreateQuizCommand, Guid>
    {
        private readonly IQuizRepository _quizRepository;

        public CreateQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Guid> Handle(CreateQuizCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var quiz = QuizDomain.Create(
                lessonId: dto.LessonId,
                title: dto.Title,
                description: dto.Description,
                timeLimit: dto.TimeLimit,
                maxAttempts: dto.MaxAttempts,
                passingScore: dto.PassingScore,
                isPublished: dto.IsPublished,
                isActive: dto.IsActive,
                isRequired: dto.IsRequired,
                showAnswers: dto.ShowAnswers,
                shuffleQuestions: dto.ShuffleQuestions
            );

            await _quizRepository.CreateAsync(quiz, cancellationToken);

            return quiz.Id;
        }
    }
}

using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Quiz.Handler
{
    public class CloneQuestionsFromBankCommandHandler : IRequestHandler<CloneQuestionsFromBankCommand, List<Guid>>
    {
        private readonly IQuizRepository _quizRepository;

        public CloneQuestionsFromBankCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<List<Guid>> Handle(CloneQuestionsFromBankCommand request, CancellationToken cancellationToken)
        {
            // Verify target quiz exists
            var targetQuizWithQuestions = await _quizRepository.GetWithQuestionsAsync(request.TargetQuizId, cancellationToken);
            if (targetQuizWithQuestions == null)
            {
                throw new Exception($"Target Quiz {request.TargetQuizId} not found");
            }

            var sourceQuestions = await _quizRepository.GetQuestionsByIdsAsync(request.SourceQuestionIds, cancellationToken);
            if (!sourceQuestions.Any())
            {
                return new List<Guid>();
            }

            var clonedIds = new List<Guid>();
            int orderIndex = targetQuizWithQuestions.Questions.Count;
            var newQuestions = new List<QuestionDomain>();

            foreach (var sq in sourceQuestions)
            {
                orderIndex++;
                var questionId = Guid.NewGuid();

                var newOptions = sq.Options.Select(o => 
                {
                    // Use Reflection to create internal domain entities
                    return (QuestionOptionDomain)Activator.CreateInstance(
                        typeof(QuestionOptionDomain),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                        null,
                        new object[] { Guid.NewGuid(), questionId, o.OptionText, o.IsCorrect, o.SortOrder },
                        null)!;
                }).ToList();

                var newQ = (QuestionDomain)Activator.CreateInstance(
                    typeof(QuestionDomain),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                    null,
                    new object[] 
                    {
                        questionId, 
                        request.TargetQuizId, 
                        sq.QuestionText, 
                        sq.QuestionType, 
                        sq.CorrectAnswer, 
                        sq.Points, 
                        sq.Explanation, 
                        orderIndex, 
                        newOptions 
                    },
                    null)!;

                newQuestions.Add(newQ);
                clonedIds.Add(questionId);
            }

            await _quizRepository.AddQuestionsAsync(request.TargetQuizId, newQuestions, cancellationToken);

            return clonedIds;
        }
    }
}

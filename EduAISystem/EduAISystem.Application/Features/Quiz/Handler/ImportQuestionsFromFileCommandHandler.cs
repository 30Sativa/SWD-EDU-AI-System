using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Quiz.Handler
{
    public class ImportQuestionsFromFileCommandHandler : IRequestHandler<ImportQuestionsFromFileCommand, Guid>
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ImportQuestionsFromFileCommandHandler(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public async Task<Guid> Handle(ImportQuestionsFromFileCommand request, CancellationToken cancellationToken)
        {
            var jobId = Guid.NewGuid();

            var fileBytes = request.FileBytes;
            var fileName = request.FileName;
            var contentType = request.ContentType;
            var quizId = request.QuizId;

            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<IImportNotificationService>();
                var questionAiService = scope.ServiceProvider.GetRequiredService<IQuestionAiService>();
                var fileTextExtractor = scope.ServiceProvider.GetRequiredService<IFileTextExtractor>();
                var quizRepository = scope.ServiceProvider.GetRequiredService<IQuizRepository>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<ImportQuestionsFromFileCommandHandler>>();

                try
                {
                    var jobIdStr = jobId.ToString();
                    await notificationService.NotifyProgressAsync(jobIdStr, 10, "Bắt đầu đọc file " + fileName);

                    // 1. Kiểm tra Quiz tồn tại (để khỏi mất công gọi AI nếu quiz không có thật)
                    var quiz = await quizRepository.GetWithQuestionsAsync(quizId, CancellationToken.None);
                    if (quiz == null) throw new Exception("Quiz_Not_Found");

                    string rawText = await fileTextExtractor.ExtractAsync(fileBytes, contentType);
                    if (string.IsNullOrWhiteSpace(rawText)) 
                        throw new Exception("File is empty or format not supported.");

                    await notificationService.NotifyProgressAsync(jobIdStr, 40, "Đang gửi nội dung cho AI phân tích...");

                    // 3. Gọi Gemini AI xử lý Text hỗn tạp
                    var aiQuestions = await questionAiService.ExtractQuestionsFromTextAsync(rawText);
                    if (!aiQuestions.Any()) throw new Exception("AI không trích xuất được câu hỏi nào từ file này.");

                    int total = aiQuestions.Count;
                    await notificationService.NotifyProgressAsync(jobIdStr, 80, $"Phân tích xong. Bắt đầu lưu {total} câu hỏi vào Database...");

                    var newQuestions = new List<QuestionDomain>();
                    int maxOrder = quiz.Questions.Count;

                    // 4. Transform DTO thành Entities và Lưu DB
                    foreach (var aiQ in aiQuestions)
                    {
                        maxOrder++;
                        var qId = Guid.NewGuid();

                        var options = new List<QuestionOptionDomain>();
                        int optOrder = 1;

                        foreach (var opt in aiQ.Options) 
                        {
                            options.Add(
                                (QuestionOptionDomain)Activator.CreateInstance(
                                    typeof(QuestionOptionDomain),
                                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                                    null,
                                    new object[] { Guid.NewGuid(), qId, opt.OptionText, opt.IsCorrect, optOrder++ },
                                    null)!
                            );
                        }

                        // Tính CorrectAnswer 
                        string? correctAnswerStr = null;
                        if (aiQ.QuestionType == "TrueFalse" || aiQ.QuestionType == "ShortAnswer")
                        {
                            var correctOption = options.FirstOrDefault(o => o.IsCorrect == true);
                            correctAnswerStr = correctOption?.OptionText ?? "Correct Answer";
                        }

                        var newQ = (QuestionDomain)Activator.CreateInstance(
                            typeof(QuestionDomain),
                            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                            null,
                            new object[] 
                            {
                                qId, 
                                quizId, 
                                quiz.Quiz.LessonId,
                                quiz.Quiz.CourseId,
                                aiQ.QuestionText, 
                                aiQ.QuestionType, 
                                correctAnswerStr, 
                                aiQ.Points > 0 ? aiQ.Points : 1m, 
                                aiQ.Explanation, 
                                maxOrder, 
                                options 
                            },
                            null)!;
                        
                        newQuestions.Add(newQ);
                    }

                    await quizRepository.AddQuestionsAsync(quizId, newQuestions, CancellationToken.None);

                    await notificationService.NotifyCompletedAsync(jobIdStr, total, $"Lưu thành công {total} câu hỏi.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Lỗi background job import câu hỏi");
                    var notificationServiceFail = scope.ServiceProvider.GetRequiredService<IImportNotificationService>();
                    await notificationServiceFail.NotifyErrorAsync(jobId.ToString(), "Lỗi: " + ex.Message);
                }
            });

            return jobId;
        }
    }
}

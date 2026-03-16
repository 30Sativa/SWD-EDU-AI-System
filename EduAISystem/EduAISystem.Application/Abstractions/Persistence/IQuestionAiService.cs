using System.Collections.Generic;
using System.Threading.Tasks;
using EduAISystem.Application.Features.Quiz.DTOs.Request;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IQuestionAiService
    {
        Task<List<AddQuestionRequestDto>> ExtractQuestionsFromTextAsync(string rawText, string aiModel = "gemini-2.5-flash");
    }
}

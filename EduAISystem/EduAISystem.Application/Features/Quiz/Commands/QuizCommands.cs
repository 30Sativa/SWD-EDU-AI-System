using EduAISystem.Application.Features.AIReview.DTOs.Request;
using EduAISystem.Application.Features.AIReview.DTOs.Response;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Commands
{
    // =============================================
    // Flow 1 — Teacher tạo Formative Quiz (gắn Lesson)
    // =============================================
    public record CreateFormativeQuizCommand(CreateFormativeQuizRequestDto Request) : IRequest<Guid>;

    // =============================================
    // Flow 2 — Teacher tạo Summative Quiz (gắn Course)
    // =============================================
    public record CreateSummativeQuizCommand(CreateSummativeQuizRequestDto Request) : IRequest<Guid>;

    // =============================================
    // Teacher thêm câu hỏi vào Quiz
    // =============================================
    public record AddQuestionToQuizCommand(Guid QuizId, AddQuestionRequestDto Request) : IRequest<Guid>;

    // =============================================
    // Student bắt đầu làm bài (Start Attempt)
    // Dùng chung cho cả Flow 1 và Flow 2
    // =============================================
    public record StartQuizAttemptCommand(Guid QuizId) : IRequest<StartAttemptResponseDto>;

    // =============================================
    // Student nộp bài (Submit Attempt)
    // Dùng chung cho cả Flow 1 và Flow 2
    // =============================================
    public record SubmitQuizAttemptCommand(Guid AttemptId, SubmitAttemptRequestDto Request)
        : IRequest<SubmitAttemptResponseDto>;

    // =============================================
    // Student hỏi AI về bài làm (AI Review)
    // =============================================
    public record AskAIReviewCommand(Guid AttemptId, AskAIRequestDto Request)
        : IRequest<AIReviewResponseDto>;

    // =============================================
    // Teacher cập nhật / xoá Quiz
    // =============================================

    public record UpdateQuizCommand(Guid QuizId, UpdateQuizRequestDto Request) : IRequest<Guid>;

    /// <summary>Teacher cập nhật cài đặt attempt của quiz (số lần làm tối đa).</summary>
    public record UpdateQuizAttemptSettingsCommand(Guid QuizId, UpdateQuizAttemptSettingsRequestDto Request) : IRequest<Guid>;

    public record DeleteQuizCommand(Guid QuizId) : IRequest<Unit>;

    // =============================================
    // Teacher cập nhật / xoá Question trong Quiz
    // =============================================

    public record UpdateQuestionInQuizCommand(
        Guid QuizId,
        Guid QuestionId,
        UpdateQuestionRequestDto Request
    ) : IRequest<Unit>;

    public record DeleteQuestionFromQuizCommand(
        Guid QuizId,
        Guid QuestionId
    ) : IRequest<Unit>;

    // =============================================
    // Teacher cập nhật / xoá từng Option riêng lẻ
    // =============================================

    public record UpdateQuestionOptionCommand(
        Guid QuestionId,
        Guid OptionId,
        UpdateSingleOptionRequestDto Request
    ) : IRequest<Unit>;

    public record DeleteQuestionOptionCommand(
        Guid QuestionId,
        Guid OptionId
    ) : IRequest<Unit>;

    // =============================================
    // Flow 1: Import câu hỏi từ file (Excel, Word, PDF) bằng AI
    // =============================================
    public record ImportQuestionsFromFileCommand(
        Guid QuizId, 
        byte[] FileBytes,
        string FileName,
        string ContentType
    ) : IRequest<Guid>; // Trả về Tracking/Job Id

    // =============================================
    // Flow 2: Tái sử dụng câu hỏi từ Ngân hàng (Clone)
    // =============================================
    public record CloneQuestionsFromBankCommand(
        Guid TargetQuizId, 
        List<Guid> SourceQuestionIds
    ) : IRequest<List<Guid>>; // Trả về Danh sách Question Id mới
}

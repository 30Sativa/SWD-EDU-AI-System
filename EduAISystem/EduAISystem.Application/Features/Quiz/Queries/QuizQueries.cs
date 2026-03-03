using EduAISystem.Application.Features.Quiz.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Queries
{
    // =============================================
    // Flow 1 — Lấy danh sách Formative Quiz của Lesson
    // =============================================
    public record GetQuizzesByLessonQuery(Guid LessonId) : IRequest<List<QuizSummaryResponseDto>>;

    // =============================================
    // Flow 2 — Lấy danh sách Summative Quiz của Course
    // =============================================
    public record GetQuizzesByCourseQuery(Guid CourseId) : IRequest<List<QuizSummaryResponseDto>>;

    // =============================================
    // Student lấy đề quiz để làm bài (ẩn đáp án)
    // =============================================
    public record GetQuizDetailQuery(Guid QuizId) : IRequest<QuizDetailResponseDto>;

    // =============================================
    // Student xem kết quả sau khi nộp bài
    // =============================================
    public record GetAttemptResultQuery(Guid AttemptId) : IRequest<AttemptResultResponseDto>;
}

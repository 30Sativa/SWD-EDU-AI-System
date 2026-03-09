namespace EduAISystem.Domain.Enums
{
    /// <summary>
    /// Phân loại Quiz:
    /// - Formative: Quiz nhỏ gắn trực tiếp với Lesson (Flow 1)
    /// - Summative: Quiz tổng hợp gắn với Course (Flow 2)
    /// </summary>
    public enum QuizTypeDomain
    {
        Formative = 0,  // Quiz trong Lesson
        Summative = 1   // Quiz tổng hợp của Course
    }
}

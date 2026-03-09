namespace EduAISystem.Domain.Enums
{
    /// <summary>
    /// Phân loại khối nội dung sư phạm của một Lesson.
    /// Được dùng cho cả tạo thủ công (Manual) lẫn sinh tự động bởi AI.
    /// </summary>
    public enum BlockTypeDomain
    {
        /// <summary>Giải thích khái niệm lý thuyết (Concept block)</summary>
        Concept,

        /// <summary>Ví dụ minh họa thực tế (Example block)</summary>
        Example,

        /// <summary>Bài tập / câu hỏi thực hành (Exercise block)</summary>
        Exercise,

        /// <summary>Phản ánh / tư duy sâu (Reflection block)</summary>
        Reflection
    }
}

namespace EduAISystem.Domain.Entities
{
    /// <summary>
    /// Domain entity cho một lần làm bài quiz của Student.
    /// Dùng chung cho cả Flow 1 (Formative) và Flow 2 (Summative).
    /// 
    /// Lifecycle: START → IN_PROGRESS → (submit) → GRADED
    ///            (auto-grade vì quiz trắc nghiệm)
    /// </summary>
    public class QuizAttemptDomain
    {
        public Guid Id { get; private set; }

        public Guid StudentId { get; private set; }

        public Guid QuizId { get; private set; }

        /// <summary>IN_PROGRESS | GRADED</summary>
        public string Status { get; private set; } = "IN_PROGRESS";

        public decimal? Score { get; private set; }

        public decimal? MaxScore { get; private set; }

        public decimal? Percentage { get; private set; }

        public bool? IsPassed { get; private set; }

        public DateTime StartedAt { get; private set; }

        public DateTime? SubmittedAt { get; private set; }

        public int? TimeSpent { get; private set; }

        private QuizAttemptDomain() { }

        // =============================================
        // REHYDRATE — map từ DB trong Repository
        // =============================================
        internal QuizAttemptDomain(
            Guid id,
            Guid studentId,
            Guid quizId,
            string status,
            decimal? score,
            decimal? maxScore,
            decimal? percentage,
            bool? isPassed,
            DateTime startedAt,
            DateTime? submittedAt,
            int? timeSpent)
        {
            Id = id;
            StudentId = studentId;
            QuizId = quizId;
            Status = status;
            Score = score;
            MaxScore = maxScore;
            Percentage = percentage;
            IsPassed = isPassed;
            StartedAt = startedAt;
            SubmittedAt = submittedAt;
            TimeSpent = timeSpent;
        }

        // =============================================
        // FACTORY — Bắt đầu một lần làm bài mới
        // =============================================
        public static QuizAttemptDomain Start(Guid studentId, Guid quizId)
        {
            if (studentId == Guid.Empty)
                throw new ArgumentException("StudentId không hợp lệ.");
            if (quizId == Guid.Empty)
                throw new ArgumentException("QuizId không hợp lệ.");

            return new QuizAttemptDomain
            {
                Id = Guid.NewGuid(),
                StudentId = studentId,
                QuizId = quizId,
                Status = "IN_PROGRESS",
                StartedAt = DateTime.UtcNow
            };
        }

        // =============================================
        // SUBMIT & AUTO-GRADE
        // =============================================
        /// <summary>
        /// Nộp bài và tự động tính điểm (quiz trắc nghiệm).
        /// </summary>
        /// <param name="score">Tổng điểm Student đạt được</param>
        /// <param name="maxScore">Tổng điểm tối đa của quiz</param>
        /// <param name="passingScore">Ngưỡng điểm đậu (phần trăm, ví dụ 70)</param>
        /// <param name="timeSpentSeconds">Thời gian làm bài (giây)</param>
        public void Submit(decimal score, decimal maxScore, decimal passingScore, int timeSpentSeconds)
        {
            if (Status != "IN_PROGRESS")
                throw new InvalidOperationException("Chỉ có thể nộp bài khi Attempt đang ở trạng thái IN_PROGRESS.");

            Score = score;
            MaxScore = maxScore;
            Percentage = maxScore > 0
                ? Math.Round(score / maxScore * 100, 2)
                : 0m;
            IsPassed = Percentage >= passingScore;
            TimeSpent = timeSpentSeconds;
            SubmittedAt = DateTime.UtcNow;
            Status = "GRADED"; // Auto-grade vì là trắc nghiệm
        }

        // =============================================
        // BUSINESS RULES
        // =============================================
        public bool IsInProgress => Status == "IN_PROGRESS";
        public bool IsGraded => Status == "GRADED";
    }
}

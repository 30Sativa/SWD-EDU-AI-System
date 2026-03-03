using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class SubmissionDomain
    {
        public Guid Id { get; private set; }

        public Guid AssignmentId { get; private set; }

        public Guid StudentId { get; private set; }

        public string? Content { get; private set; }

        public string? FileUrl { get; private set; }

        public decimal? Score { get; private set; }

        public string? Feedback { get; private set; }

        public SubmissionStatusDomain Status { get; private set; }

        public DateTime? SubmittedAt { get; private set; }

        public DateTime? GradedAt { get; private set; }

        protected SubmissionDomain() { }

        internal SubmissionDomain(
            Guid id,
            Guid assignmentId,
            Guid studentId,
            string? content,
            string? fileUrl,
            decimal? score,
            string? feedback,
            SubmissionStatusDomain status,
            DateTime? submittedAt,
            DateTime? gradedAt)
        {
            Id = id;
            AssignmentId = assignmentId;
            StudentId = studentId;
            Content = content;
            FileUrl = fileUrl;
            Score = score;
            Feedback = feedback;
            Status = status;
            SubmittedAt = submittedAt;
            GradedAt = gradedAt;
        }

        public static SubmissionDomain CreateDraft(
            Guid assignmentId,
            Guid studentId,
            string? content,
            string? fileUrl)
        {
            if (assignmentId == Guid.Empty)
                throw new ArgumentException("AssignmentId là bắt buộc.");
            if (studentId == Guid.Empty)
                throw new ArgumentException("StudentId là bắt buộc.");

            return new SubmissionDomain
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignmentId,
                StudentId = studentId,
                Content = content,
                FileUrl = fileUrl,
                Status = SubmissionStatusDomain.Submitted,
                SubmittedAt = DateTime.UtcNow
            };
        }

        public void Resubmit(string? content, string? fileUrl)
        {
            Content = content;
            FileUrl = fileUrl;
            Status = SubmissionStatusDomain.Submitted;
            SubmittedAt = DateTime.UtcNow;
            Score = null;
            Feedback = null;
            GradedAt = null;
        }

        public void Grade(decimal? score, string? feedback)
        {
            Score = score;
            Feedback = feedback;
            Status = SubmissionStatusDomain.Graded;
            GradedAt = DateTime.UtcNow;
        }
    }
}


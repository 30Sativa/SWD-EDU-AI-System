using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class EnrollmentDomain
    {
        public Guid Id { get; private set; }

        public Guid StudentId { get; private set; }

        public Guid CourseId { get; private set; }

        public EnrollmentStatusDomain Status { get; private set; }

        public decimal Progress { get; private set; }

        public DateTime EnrolledAt { get; private set; }

        public DateTime? CompletedAt { get; private set; }

        protected EnrollmentDomain() { }

        // =========================
        // CREATE NEW ENROLLMENT
        // =========================
        public EnrollmentDomain(Guid studentId, Guid courseId)
        {
            if (studentId == Guid.Empty)
                throw new ArgumentException("StudentId required.");

            if (courseId == Guid.Empty)
                throw new ArgumentException("CourseId required.");

            Id = Guid.NewGuid();
            StudentId = studentId;
            CourseId = courseId;
            Status = EnrollmentStatusDomain.Active;
            Progress = 0;
            EnrolledAt = DateTime.UtcNow;
        }

        // =========================
        // LOAD FROM DATABASE
        // =========================
        public static EnrollmentDomain Load(
            Guid id,
            Guid studentId,
            Guid courseId,
            EnrollmentStatusDomain status,
            decimal progress,
            DateTime enrolledAt,
            DateTime? completedAt)
        {
            var enrollment = new EnrollmentDomain
            {
                Id = id,
                StudentId = studentId,
                CourseId = courseId,
                Status = status,
                Progress = progress,
                EnrolledAt = enrolledAt,
                CompletedAt = completedAt
            };

            return enrollment;
        }

        // =========================
        // UPDATE PROGRESS
        // =========================
        public void UpdateProgress(decimal progress)
        {
            if (progress < 0 || progress > 100)
                throw new ArgumentException("Progress must be between 0 and 100.");

            Progress = progress;

            if (progress == 100)
            {
                Status = EnrollmentStatusDomain.Completed;
                CompletedAt = DateTime.UtcNow;
            }
            else
            {
                Status = EnrollmentStatusDomain.Active;
                CompletedAt = null;
            }
        }
    }
}
using System;

namespace EduAISystem.Infrastructure.Persistence.Entities
{
    public partial class ClassSubjectTeacher
    {
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
        public Guid TeacherId { get; set; }
        public DateTime AssignedAt { get; set; }

        public virtual Class Class { get; set; } = null!;
        public virtual Subject Subject { get; set; } = null!;
        public virtual Teacher Teacher { get; set; } = null!;
    }
}

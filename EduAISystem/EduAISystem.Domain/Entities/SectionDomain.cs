using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Domain.Entities
{
    public class SectionDomain
    {
        public Guid Id { get; private set; }
        public Guid CourseId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public int SortOrder { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public ICollection<LessonDomain> Lessons { get; set; } = new List<LessonDomain>();

        protected SectionDomain() { }



        //factory method to create a new SectionDomain instance
        internal SectionDomain(
            Guid id,
            Guid courseId,
            string title,
            string? description,
            int sortOrder,
            bool isActive,
            DateTime createdAt,
            DateTime updatedAt)
        {
            Id = id;
            CourseId = courseId;
            Title = title;
            Description = description;
            SortOrder = sortOrder;
            IsActive = isActive;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
        }

        // Factory method to create a new SectionDomain instance

        public static SectionDomain Create(Guid courseId, string title, string? description, int sortOrder = 0)
        {
            if (courseId == Guid.Empty)
                throw new ArgumentException("CourseId không được để trống!", nameof(courseId));
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề không được để trống!", nameof(title));
            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));
            return new SectionDomain
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = title.Trim(),
                Description = description?.Trim(),
                SortOrder = sortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };


        }
        public void Update( string title,string? description,int sortOrder,bool? isActive = null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề không được để trống!", nameof(title));

            if (sortOrder < 0)
                throw new ArgumentException("SortOrder không được âm", nameof(sortOrder));

            Title = title.Trim();
            Description = description?.Trim();
            SortOrder = sortOrder;

            if (isActive.HasValue)
                IsActive = isActive.Value;

            UpdatedAt = DateTime.UtcNow;
        }

    }
}

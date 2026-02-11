using EduAISystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Domain.Entities
{
    public class    LessonDomain
    {
        public Guid Id { get; set; }

        public Guid SectionId { get; set; }

        public string Title { get; set; } = null!;

        public string Slug { get; set; } = null!;

        public string? VideoUrl { get; set; }

        public string? Content { get; set; }

        public int SortOrder { get; set; }

        public int? Duration { get; set; }

        public LessonStatusDomain Status { get; set; }

        public bool? IsPreview { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
        
        public LessonDomain() { 
        }
        internal LessonDomain(
            Guid id,
            Guid sectionId,
            string title,
            string slug,
            string? videoUrl,
            string? content,
            int sortOrder,
            int? duration,
            LessonStatusDomain status,
            bool? isPreview,
            bool? isActive,
            DateTime? createdAt,
            DateTime? updatedAt,
            DateTime? deletedAt)
        {
            Id = id;
            SectionId = sectionId;
            Title = title;
            Slug = slug;
            VideoUrl = videoUrl;
            Content = content;
            SortOrder = sortOrder;
            Duration = duration;
            Status = status;
            IsPreview = isPreview;
            IsActive = isActive;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            DeletedAt = deletedAt;
        }

        public static LessonDomain Create(
            Guid sectionId,
            string title,
            string slug,
            string? videoUrl,
            string? content,
            int sortOrder,
            int? duration,
            bool? isPreview)
        {
            return new LessonDomain
            {
                Id = Guid.NewGuid(),
                SectionId = sectionId,
                Title = title,
                Slug = slug,
                VideoUrl = videoUrl,
                Content = content,
                SortOrder = sortOrder,
                Duration = duration,
                Status = LessonStatusDomain.Draft,
                IsPreview = isPreview,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                DeletedAt = null
            };
        }
    }
}

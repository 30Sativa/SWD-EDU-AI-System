using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Enrollments.DTOs.Response
{
    public class MyEnrolledCourseResponseDto
    {
        public Guid CourseId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Thumbnail { get; set; }

        public decimal Progress { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime EnrolledAt { get; set; }
    }
}

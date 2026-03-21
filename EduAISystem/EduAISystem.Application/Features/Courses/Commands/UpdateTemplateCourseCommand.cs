using EduAISystem.Application.Features.Courses.DTOs.Request;
using MediatR;
using System;

namespace EduAISystem.Application.Features.Courses.Commands
{
    public class UpdateTemplateCourseCommand : IRequest<Unit>
    {
        public Guid CourseId { get; set; }
        public UpdateTemplateCourseRequestDto Request { get; set; }

        public UpdateTemplateCourseCommand(Guid courseId, UpdateTemplateCourseRequestDto request)
        {
            CourseId = courseId;
            Request = request;
        }
    }
}

using System;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Enrollments.Queries
{
    public record GetCourseProgressDetailQuery(Guid CourseId)
        : IRequest<CourseProgressDetailResponseDto>;
}


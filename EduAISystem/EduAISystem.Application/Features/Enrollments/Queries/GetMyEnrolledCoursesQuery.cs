using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Enrollments.Queries
{
    public record GetMyEnrolledCoursesQuery(int Page, int PageSize)
        : IRequest<PagedResult<MyEnrolledCourseResponseDto>>
    {
    }
}

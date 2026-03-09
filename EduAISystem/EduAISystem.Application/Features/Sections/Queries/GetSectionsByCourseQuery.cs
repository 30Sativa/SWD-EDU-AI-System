using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Queries
{
    public record GetSectionsByCourseQuery(Guid CourseId) : IRequest<List<SectionResponseDto>>
    {
    }
}

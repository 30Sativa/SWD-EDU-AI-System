using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using EduAISystem.Application.Features.Sections.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Handler
{
    public class GetSectionsByCourseQueryHandler : IRequestHandler<GetSectionsByCourseQuery, List<SectionResponseDto>>
    {
        private readonly ISectionRepository _sectionRepository;
        public GetSectionsByCourseQueryHandler(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

        public async Task<List<SectionResponseDto>> Handle(GetSectionsByCourseQuery request, CancellationToken cancellationToken)
        {
            var sections = await _sectionRepository.GetByCourseIdAsync(request.CourseId);
            return sections.Select(s => new SectionResponseDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                Order = s.SortOrder
            }).ToList();
        }
    }
}
